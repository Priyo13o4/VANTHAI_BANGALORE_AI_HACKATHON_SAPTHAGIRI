"""
VanthAI — Gemini Live Audio Bridge
Handles real-time duplex audio between the browser WebSocket and Gemini Live API.

Protocol (Browser ↔ Backend):
  Browser → Backend:
    - Binary frames:  raw 16-bit PCM, 16000Hz mono (mic audio)
    - JSON text:      {"type": "end_turn"}  — optional manual end-of-turn

  Backend → Browser:
    - JSON text:  {"type": "session_init",    "session_id": "..."}
    - Binary:     raw 16-bit PCM, 24000Hz mono (Gemini audio output)
    - JSON text:  {"type": "transcript",      "role": "user"|"model", "text": "..."}
    - JSON text:  {"type": "action",          ...ActionPayload fields}
    - JSON text:  {"type": "turn_complete"}
    - JSON text:  {"type": "error",           "message": "..."}
    - JSON text:  {"type": "done"}            — session closed

Architecture:
  run() opens a Gemini Live session (AUDIO modality + tools + transcription)
  then drives two concurrent asyncio tasks:
    _pump_client → reads WS frames → sends to Gemini
    _pump_gemini → reads Gemini events → sends to WS client

Navigation tool protocol:
  Gemini calls navigate_to(url) → backend sends {"type":"action","action":"navigate","url":"..."}
  Frontend's useAIDispatcher handles navigation from the voice channel too.
"""
from __future__ import annotations

import asyncio
import json
from typing import Any

import structlog
from fastapi import WebSocket, WebSocketDisconnect
from google import genai
from google.genai import types

from core.config import settings
from core.redis_client import create_session, delete_session
from core.websocket import BaseWebSocketHandler

logger = structlog.get_logger(__name__)

# Shared Gemini client (thread-safe; sessions are per-call)
print("DEBUG: [GEMINI LIVE] Loading v1.0.3 (Multi-turn support)")
_genai_client = genai.Client(api_key=settings.google_ai_api_key)


def _build_navigation_tool(available_routes: list[str]) -> types.Tool:
    """Gemini function-call tool for UI navigation."""
    return types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="navigate_to",
                description=(
                    "Navigate the web portal to a specific page. "
                    "Call this when the user asks to go somewhere, open a section, or see something."
                ),
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "url": types.Schema(
                            type="STRING",
                            description=f"Route to navigate to. Available: {', '.join(available_routes)}",
                        )
                    },
                    required=["url"],
                ),
            )
        ]
    )


class GeminiLiveVoiceHandler(BaseWebSocketHandler):
    """
    Duplex voice agent using Gemini Live API (gemini-3.1-flash-live-preview).

    Audio pipeline:
      Browser mic (16kHz PCM) → binary WS frame → _pump_client → Gemini Live session
      Gemini Live session    → audio (24kHz PCM) → _pump_gemini → binary WS frame → browser speaker
      Gemini Live session    → transcript / tool_call → JSON WS frame → browser UI
    """

    def __init__(
        self,
        websocket: WebSocket,
        app: str,
        system_prompt: str,
        available_routes: list[str],
    ) -> None:
        super().__init__(websocket, app)
        self.system_prompt = system_prompt
        self.available_routes = available_routes
        self._stop_event: asyncio.Event = asyncio.Event()

    # ── JSON helpers ──────────────────────────────────────────────────────────

    async def _send_json(self, payload: dict[str, Any]) -> None:
        try:
            await self.ws.send_text(json.dumps(payload))
        except Exception as exc:
            logger.warning("voice_ws.send_json_failed", session_id=self.session_id, error=str(exc))

    async def _send_audio(self, pcm_bytes: bytes) -> None:
        try:
            await self.ws.send_bytes(pcm_bytes)
        except Exception as exc:
            logger.warning("voice_ws.send_audio_failed", session_id=self.session_id, error=str(exc))

    # ── Gemini Live pump tasks ────────────────────────────────────────────────

    async def _pump_client_to_gemini(self, session) -> None:
        """
        Read binary audio frames from the browser WebSocket and forward to Gemini.
        Also handle JSON control frames (e.g. end_turn).
        Exits cleanly on disconnect or stop event.
        """
        while not self._stop_event.is_set():
            try:
                msg = await asyncio.wait_for(self.ws.receive(), timeout=30.0)
            except asyncio.TimeoutError:
                # Keep session alive — Gemini handles silence detection
                continue
            except (WebSocketDisconnect, RuntimeError):
                self._stop_event.set()
                break
            except Exception as exc:
                logger.warning("voice_pump_client.error", error=str(exc))
                self._stop_event.set()
                break

            if msg.get("type") == "websocket.disconnect":
                logger.info("voice_pump_client.client_disconnected", session_id=self.session_id)
                self._stop_event.set()
                break

            if msg.get("bytes"):
                # Raw PCM audio from browser mic → forward to Gemini
                try:
                    await session.send_realtime_input(
                        audio=types.Blob(
                            data=msg["bytes"],
                            mime_type="audio/pcm;rate=16000",
                        )
                    )
                except Exception as exc:
                    logger.error("voice_pump_client.send_audio_error", error=str(exc))
                    self._stop_event.set()
                    break

            elif msg.get("text"):
                # JSON control message from browser
                try:
                    ctrl = json.loads(msg["text"])
                    if ctrl.get("type") == "end_turn":
                        # Optional manual end-of-turn (VAD handles this automatically)
                        await session.send_realtime_input(
                            activity_end=types.ActivityEnd()
                        )
                except Exception:
                    pass  # Malformed control frame — ignore

    async def _pump_gemini_to_client(self, session) -> None:
        """
        Read events from the Gemini Live session and relay to the browser.
        Handles multiple conversation turns — each turn starts when client sends audio
        and ends when VAD detects silence. Only exits when client disconnects (_stop_event).

        - Audio blobs    → binary WS frames
        - Transcripts    → JSON transcript frames
        - Tool calls     → execute navigate_to + JSON action frames
        - Turn complete  → JSON turn_complete frame
        """
        try:
            # Keep looping across multiple turns until client disconnects
            while not self._stop_event.is_set():
                try:
                    async for response in session.receive():
                        if self._stop_event.is_set():
                            break
                        
                        sc = response.server_content
                        if sc:
                            # Audio output → forward raw PCM bytes to browser
                            if sc.model_turn:
                                for part in sc.model_turn.parts:
                                    if part.inline_data and part.inline_data.data:
                                        await self._send_audio(part.inline_data.data)

                            # Model output transcript
                            if sc.output_transcription and sc.output_transcription.text:
                                await self._send_json({
                                    "type": "transcript",
                                    "role": "model",
                                    "text": sc.output_transcription.text,
                                })

                            # User input transcript (from Gemini's VAD + STT)
                            if sc.input_transcription and sc.input_transcription.text:
                                await self._send_json({
                                    "type": "transcript",
                                    "role": "user",
                                    "text": sc.input_transcription.text,
                                })

                            # Turn complete (VAD detected silence, model finished)
                            if sc.turn_complete:
                                await self._send_json({"type": "turn_complete"})

                        if response.tool_call:
                            # Execute tool call in background to avoid blocking the audio stream
                            asyncio.create_task(self._handle_tool_call(session, response.tool_call))
                    
                    # If we reach here, receive() iterator ended (normal end-of-turn)
                    # Log it and loop back to listen for the next turn
                    logger.info("voice_pump_gemini.turn_ended", session_id=self.session_id)
                    
                except Exception as exc:
                    if not self._stop_event.is_set():
                        logger.error("voice_pump_gemini.turn_error", session_id=self.session_id, error=str(exc))
                        # Don't exit — try to continue listening
                    break

        except Exception as exc:
            if not self._stop_event.is_set():
                logger.error("voice_pump_gemini.fatal_error", session_id=self.session_id, error=str(exc))
                await self._send_json({"type": "error", "message": str(exc)})
        finally:
            logger.info("voice_pump_gemini.exited", session_id=self.session_id)
            self._stop_event.set()

    async def _handle_tool_call(self, session, tool_call) -> None:
        """Handle function calls without blocking the main event pump."""
        try:
            for fc in tool_call.function_calls:
                if fc.name == "navigate_to":
                    url = (fc.args or {}).get("url", "")
                    if url:
                        await self._send_json({
                            "type": "action",
                            "action": "navigate",
                            "url": url,
                            "message": None,
                            "message_type": "text",
                        })
                    
                    # Send tool response back to Gemini
                    try:
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": f"Navigated to {url}"},
                                )
                            ]
                        )
                    except Exception as exc:
                        logger.warning("voice_pump_gemini.tool_response_error", error=str(exc))
        except Exception as exc:
            logger.error("voice_handle_tool_call.error", error=str(exc))

    # ── Main run() ────────────────────────────────────────────────────────────

    async def run(self) -> None:
        """
        Override BaseWebSocketHandler.run() entirely for duplex audio.
        1. Accept WS + send session_init
        2. Open Gemini Live session (AUDIO + transcription + navigation tool)
        3. Run two concurrent tasks: client→Gemini, Gemini→client
        4. Clean up on disconnect
        """
        await self.ws.accept()
        self.session_id = await create_session(app=self.app)
        await self._send_json({"type": "session_init", "session_id": self.session_id})
        logger.info("voice_ws.connected", session_id=self.session_id, app=self.app)
        print(f"DEBUG: [VOICE WS CONNECT] app={self.app} session={self.session_id}")

        live_config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            input_audio_transcription=types.AudioTranscriptionConfig(),   # user speech → text
            output_audio_transcription=types.AudioTranscriptionConfig(),  # model audio → text
            system_instruction=self.system_prompt,
            tools=[_build_navigation_tool(self.available_routes)],
        )

        try:
            async with _genai_client.aio.live.connect(
                model=settings.gemini_voice_model,
                config=live_config,
            ) as session:
                logger.info(
                    "voice_ws.gemini_live_connected",
                    session_id=self.session_id,
                    model=settings.gemini_voice_model,
                )
                print(f"DEBUG: [GEMINI LIVE CONNECTED] session={self.session_id} model={settings.gemini_voice_model}")

                await asyncio.gather(
                    self._pump_client_to_gemini(session),
                    self._pump_gemini_to_client(session),
                )
                logger.info("voice_ws.gather_completed", session_id=self.session_id)

        except WebSocketDisconnect:
            pass
        except Exception as exc:
            logger.error(
                "voice_ws.gemini_connect_error",
                session_id=self.session_id,
                error=str(exc),
                exc_info=True,
            )
            try:
                await self._send_json({"type": "error", "message": str(exc)})
            except Exception:
                pass
        finally:
            self._stop_event.set()
            if self.session_id:
                await delete_session(self.session_id)
            logger.info("voice_ws.disconnected", session_id=self.session_id, app=self.app)
