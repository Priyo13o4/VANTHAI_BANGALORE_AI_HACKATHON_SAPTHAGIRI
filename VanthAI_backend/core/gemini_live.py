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


def _build_voice_tools(available_routes: list[str], app: str) -> types.Tool:
    """Gemini function-call tools for voice: shared tools + app-specific tools."""
    function_declarations = [

        types.FunctionDeclaration(
            name="spotlight_element",
            description=(
                "Point the user's attention to a specific UI element using the Spotlight overlay. "
                "This draws a glowing ring around the element with a floating popover. "
                "Use this when the user asks WHERE something is or when you want to draw attention "
                "to a specific part of the page after navigating."
            ),
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "element_id": types.Schema(
                        type="STRING",
                        description="The data-vanthai-id value of the element to spotlight. Valid values: cloudcare-appointments-book-btn, cloudcare-vitals-alert-badge, etc.",
                    ),
                    "title": types.Schema(
                        type="STRING",
                        description="Short title for the popover (e.g. 'Book Appointment').",
                    ),
                    "description": types.Schema(
                        type="STRING",
                        description="One sentence explaining what this element does.",
                    ),
                },
                required=["element_id"],
            ),
        ),

            types.FunctionDeclaration(
                name="navigate_to",
                description=(
                    "Navigate the web portal to a specific page. "
                    "Use this PROACTIVELY whenever discussing information (like medical records, salary, or vitals) "
                    "that resides on a different page than the current one."
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
            ),
            types.FunctionDeclaration(
                name="highlight_element",
                description=(
                    "Highlight a specific UI element on the current page using its data-vanthai-id. "
                    "Use this to point the user's attention to a button, field, or section."
                ),
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "element_id": types.Schema(
                            type="STRING",
                            description="The data-vanthai-id value of the element to highlight (without brackets or quotes).",
                        ),
                        "title": types.Schema(
                            type="STRING",
                            description="Short popover title shown near the highlighted element.",
                        ),
                        "description": types.Schema(
                            type="STRING",
                            description="Popover description explaining what the element does.",
                        ),
                    },
                    required=["element_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="query_health_records",
                description="Query the complete medical history (health records) for a patient. Returns diagnosis, dates, and treatments.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "patient_id": types.Schema(
                            type="INTEGER",
                            description="Integer patient ID (e.g. 1 or 35).",
                        ),
                    },
                    required=["patient_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="query_doctors",
                description="Query the list of available doctors. Can be filtered by specialty.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "specialization": types.Schema(
                            type="STRING",
                            description="Doctor's specialization (e.g. 'Cardiology', 'Endocrinology').",
                        ),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="prefill_appointment_form",
                description="Pre-fill the appointment booking form with a specific doctor ID. This opens the form dialog automatically.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "doctor_id": types.Schema(
                            type="INTEGER",
                            description="The ID of the doctor to pre-fill (e.g. 1 for Dr. Sarah Johnson).",
                        ),
                        "date": types.Schema(
                            type="STRING",
                            description="Optional appointment date in YYYY-MM-DD format.",
                        ),
                        "time": types.Schema(
                            type="STRING",
                            description="Optional appointment time in HH:mm format.",
                        ),
                    },
                    required=["doctor_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="query_upcoming_appointments",
                description="Query the list of upcoming appointments for a patient.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "patient_id": types.Schema(
                            type="INTEGER",
                            description="Integer patient ID.",
                        ),
                    },
                    required=["patient_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="query_latest_vitals",
                description="Query the most recent vital signs (heart rate, BP, etc.) for a patient.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "patient_id": types.Schema(
                            type="INTEGER",
                            description="Integer patient ID.",
                        ),
                    },
                    required=["patient_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="query_active_prescriptions",
                description="Query the active medications and prescriptions for a patient.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "patient_id": types.Schema(
                            type="INTEGER",
                            description="Integer patient ID.",
                        ),
                    },
                    required=["patient_id"],
                ),
            ),
    ]

    if app == "itr":
        function_declarations.extend([
            types.FunctionDeclaration(
                name="form18_fill_sequence",
                description="Start Form 18 sequence by navigating to the Form 18 landing page.",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_assessee_custom",
                description="Auto-fill assessee details in Form 18 using provided values. Partial fields are supported.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "name": types.Schema(type="STRING"),
                        "address": types.Schema(type="STRING"),
                        "pan": types.Schema(type="STRING"),
                        "status": types.Schema(type="STRING"),
                        "email": types.Schema(type="STRING"),
                        "contact": types.Schema(type="STRING"),
                        "residentialStatus": types.Schema(type="STRING"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_business_custom",
                description="Auto-fill business details in Form 18 using provided values. Partial fields are supported.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "businessName": types.Schema(type="STRING"),
                        "flat": types.Schema(type="STRING"),
                        "road": types.Schema(type="STRING"),
                        "pin": types.Schema(type="STRING"),
                        "postOffice": types.Schema(type="STRING"),
                        "area": types.Schema(type="STRING"),
                        "district": types.Schema(type="STRING"),
                        "state": types.Schema(type="STRING"),
                        "projectName": types.Schema(type="STRING"),
                        "projFlat": types.Schema(type="STRING"),
                        "projRoad": types.Schema(type="STRING"),
                        "projPin": types.Schema(type="STRING"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_project_custom",
                description="Auto-fill project details in Form 18 using provided values. Partial fields are supported.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "flat": types.Schema(type="STRING"),
                        "road": types.Schema(type="STRING"),
                        "pin": types.Schema(type="STRING"),
                        "postOffice": types.Schema(type="STRING"),
                        "area": types.Schema(type="STRING"),
                        "district": types.Schema(type="STRING"),
                        "state": types.Schema(type="STRING"),
                        "totalUnits": types.Schema(type="STRING"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_tax_year",
                description="Auto-fill the Form 18 landing page with a specific tax year.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "taxYear": types.Schema(
                            type="STRING",
                            description="The tax year to fill (e.g. '2027-28').",
                        ),
                    },
                    required=["taxYear"],
                ),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_assessee",
                description="Auto-fill assessee details in Form 18 with sample/demo data.",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_business",
                description="Auto-fill business details in Form 18 with sample/demo data.",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="fill_form_18_project",
                description="Auto-fill project details in Form 18 with sample/demo data.",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="highlight_form18_field",
                description="Highlight a specific Form 18 field by its HTML name attribute.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "field_name": types.Schema(type="STRING"),
                        "popover_text": types.Schema(type="STRING"),
                    },
                    required=["field_name"],
                ),
            ),
        ])

    return types.Tool(function_declarations=function_declarations)


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
        provided_session_id: str | None = None,
    ) -> None:
        super().__init__(websocket, app)
        self.system_prompt = system_prompt
        self.available_routes = available_routes
        self.provided_session_id = provided_session_id
        self._stop_event: asyncio.Event = asyncio.Event()
        self._owned_session = False  # True only if we created the session ourselves

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
                    elif ctrl.get("type") == "page_update":
                        # User navigated to a new page — inform Gemini Live context
                        new_page = ctrl.get("page", "/itr")
                        logger.info("voice_pump_client.page_update", session_id=self.session_id, page=new_page)
                        
                        # Load page knowledge
                        from agents.itr.prompts import load_page_markdown_from_disk
                        page_markdown = load_page_markdown_from_disk(new_page, kb_base="/app/KB")
                        
                        context_msg = (
                            f"[SYSTEM CONTEXT UPDATE]\n"
                            f"User has just navigated to: {new_page}\n"
                            f"Do NOT offer to navigate there — user is already there.\n"
                            f"Page content/knowledge:\n{page_markdown or 'No specific knowledge for this page.'}"
                        )
                        
                        await session.send_realtime_input(
                            text=context_msg
                        )
                except Exception as exc:
                    logger.warning("voice_pump_client.control_frame_error", error=str(exc))

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
                logger.info(
                    "voice_pump_gemini.tool_call_received",
                    session_id=self.session_id,
                    tool_name=fc.name,
                    args=fc.args or {},
                )

                if self.app == "itr" and fc.name in {
                    "form18_fill_sequence",
                    "fill_form_18_tax_year",
                    "fill_form_18_assessee",
                    "fill_form_18_assessee_custom",
                    "fill_form_18_business",
                    "fill_form_18_business_custom",
                    "fill_form_18_project",
                    "fill_form_18_project_custom",
                    "highlight_form18_field",
                }:
                    from agents.itr import tools as itr_tools

                    tool_map = {
                        "form18_fill_sequence": itr_tools.form18_fill_sequence,
                        "fill_form_18_tax_year": itr_tools.fill_form_18_tax_year,
                        "fill_form_18_assessee": itr_tools.fill_form_18_assessee,
                        "fill_form_18_assessee_custom": itr_tools.fill_form_18_assessee_custom,
                        "fill_form_18_business": itr_tools.fill_form_18_business,
                        "fill_form_18_business_custom": itr_tools.fill_form_18_business_custom,
                        "fill_form_18_project": itr_tools.fill_form_18_project,
                        "fill_form_18_project_custom": itr_tools.fill_form_18_project_custom,
                        "highlight_form18_field": itr_tools.highlight_form18_field,
                    }

                    args = fc.args or {}
                    try:
                        result_json_str = await tool_map[fc.name].ainvoke(args)
                        try:
                            parsed = json.loads(result_json_str)
                            if isinstance(parsed, dict) and parsed.get("action"):
                                await self._send_json({"type": "action", **parsed})
                        except Exception:
                            pass

                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": result_json_str},
                                )
                            ]
                        )
                    except Exception as exc:
                        logger.error("voice_pump_gemini.itr_tool_error", tool_name=fc.name, error=str(exc))
                    continue

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

                elif fc.name == "spotlight_element":
                    args = fc.args or {}
                    element_id = args.get("element_id", "")
                    title = args.get("title", "")
                    description = args.get("description", "")
                    if element_id:
                        await self._send_json({
                            "type": "action",
                            "action": "spotlight",
                            "element": element_id,
                            "selector": f'[data-vanthai-id="{element_id}"]',
                            "popover": {
                                "title": title,
                                "description": description
                            }
                        })
                    try:
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": f"Spotlighted {element_id}"},
                                )
                            ]
                        )
                    except Exception as exc:
                        logger.warning("voice_pump_gemini.tool_response_error", error=str(exc))

                elif fc.name == "highlight_element":
                    args = fc.args or {}
                    element_id = args.get("element_id", "")
                    title = args.get("title", "")
                    description = args.get("description", "")
                    if element_id:
                        payload: dict = {
                            "type": "action",
                            "action": "highlight",
                            "element": element_id,
                            "message": description or title or "Here's what you need.",
                            "message_type": "text",
                        }
                        if title or description:
                            payload["popover"] = {"title": title, "description": description}
                        await self._send_json(payload)
                    try:
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": f"Highlighted element: {element_id}"},
                                )
                            ]
                        )
                    except Exception as exc:
                        logger.warning("voice_pump_gemini.tool_response_error", error=str(exc))

                elif fc.name == "query_health_records":
                    from agents.cloudcare.tools import query_health_records
                    pid = (fc.args or {}).get("patient_id") or 1
                    try:
                        result_json = await query_health_records.ainvoke({"patient_id": pid})
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": result_json},
                                )
                            ]
                        )
                    except Exception as exc:
                        logger.error("voice_pump_gemini.query_records_error", error=str(exc))

                elif fc.name == "query_doctors":
                    from agents.cloudcare.tools import query_doctors
                    spec = (fc.args or {}).get("specialization") or (fc.args or {}).get("specialty")
                    try:
                        result_json = await query_doctors.ainvoke({"specialization": spec})
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": result_json},
                                )
                            ]
                        )
                    except Exception as exc:
                        logger.error("voice_pump_gemini.query_doctors_error", error=str(exc))
                
                elif fc.name == "prefill_appointment_form":
                    from agents.cloudcare.tools import prefill_appointment_form
                    args = fc.args or {}
                    doc_id = args.get("doctor_id")
                    pref_date = args.get("date")
                    pref_time = args.get("time")
                    
                    if doc_id:
                        # Ensure doc_id is int for tool invocation
                        try:
                            clean_doc_id = int(doc_id)
                        except (ValueError, TypeError):
                            clean_doc_id = 1 # fallback to default doctor
                            
                        result_json = await prefill_appointment_form.ainvoke({
                            "doctor_id": clean_doc_id,
                            "date": pref_date,
                            "time": pref_time
                        })
                        try:
                            res_data = json.loads(result_json)
                            if res_data.get("success"):
                                await self._send_json({
                                    "type": "action",
                                    "action": "prefill_form",
                                    "doctorId": str(doc_id),
                                    "department": res_data.get("department", ""),
                                    "date": pref_date,
                                    "time": pref_time,
                                    "message": f"Pre-filling form for Dr. {res_data.get('doctor_name', 'Sarah')}",
                                    "message_type": "text",
                                })
                                
                                # If date and time are also provided, highlight the confirm button
                                if pref_date and pref_time:
                                    await self._send_json({
                                        "type": "action",
                                        "action": "spotlight",
                                        "element": "cloudcare-appointments-confirm-btn",
                                        "selector": '[data-vanthai-id="cloudcare-appointments-confirm-btn"]',
                                        "popover": {
                                            "title": "Confirm Appointment",
                                            "description": f"Click here to schedule your appointment with {res_data.get('doctor_name', 'your doctor')}."
                                        }
                                    })
                        except Exception:
                            pass
                        
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    name=fc.name,
                                    id=fc.id,
                                    response={"result": result_json},
                                )
                            ]
                        )

                elif fc.name == "query_upcoming_appointments":
                    from agents.cloudcare.tools import query_upcoming_appointments
                    pid = (fc.args or {}).get("patient_id") or 1
                    result = await query_upcoming_appointments.ainvoke({"patient_id": pid})
                    await session.send_tool_response(
                        function_responses=[types.FunctionResponse(name=fc.name, id=fc.id, response={"result": result})]
                    )

                elif fc.name == "query_latest_vitals":
                    from agents.cloudcare.tools import query_latest_vitals
                    pid = (fc.args or {}).get("patient_id") or 1
                    result = await query_latest_vitals.ainvoke({"patient_id": pid})
                    await session.send_tool_response(
                        function_responses=[types.FunctionResponse(name=fc.name, id=fc.id, response={"result": result})]
                    )

                elif fc.name == "query_active_prescriptions":
                    from agents.cloudcare.tools import query_active_prescriptions
                    pid = (fc.args or {}).get("patient_id") or 1
                    result = await query_active_prescriptions.ainvoke({"patient_id": pid})
                    await session.send_tool_response(
                        function_responses=[types.FunctionResponse(name=fc.name, id=fc.id, response={"result": result})]
                    )

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
        if self.provided_session_id:
            self.session_id = self.provided_session_id
            self._owned_session = False
        else:
            self.session_id = await create_session(app=self.app)
            self._owned_session = True
        await self._send_json({"type": "session_init", "session_id": self.session_id})
        logger.info("voice_ws.connected", session_id=self.session_id, app=self.app)

        live_config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            input_audio_transcription=types.AudioTranscriptionConfig(),   # user speech → text
            output_audio_transcription=types.AudioTranscriptionConfig(),  # model audio → text
            system_instruction=self.system_prompt,
            tools=[_build_voice_tools(self.available_routes, self.app)],
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
            if self.session_id and self._owned_session:
                await delete_session(self.session_id)
            logger.info("voice_ws.disconnected", session_id=self.session_id, app=self.app)
