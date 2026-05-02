"""
CloudCare Agent — FastAPI Routes (Phase 4c)
Chat: HTTP POST with Server-Sent Events (SSE) streaming
Voice: WebSocket duplex audio with Gemini Live API
"""
import structlog
from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import StreamingResponse
import asyncio

from agents.cloudcare.agent import CloudCareChatHandler
from core.config import settings
from core.gemini_live import GeminiLiveVoiceHandler
from core.redis_client import create_session

logger = structlog.get_logger(__name__)
router = APIRouter(tags=["cloudcare"])

class ChatPayload(BaseModel):
    text: str
    current_page: str
    session_id: Optional[str] = None

_CLOUDCARE_SYSTEM_PROMPT = """You are VanthAI CloudCare, a voice-first health assistant embedded in a patient portal.
You are having a real-time voice conversation with a patient.
Keep all spoken responses concise (2-3 sentences max) and natural — no lists, no markdown.
If the user asks to navigate somewhere, use the navigate_to tool.
Be warm, professional, and reassuring.ALways use the language the user is speaking."""

_CLOUDCARE_ROUTES = [
    "/cloudcare/patient",
    "/cloudcare/patient/records",
    "/cloudcare/patient/appointments",
    "/cloudcare/patient/vitals",
    "/cloudcare/patient/prescriptions",
]

@router.post(f"/{settings.ws_cloudcare_chat}")
async def cloudcare_chat_endpoint(payload: ChatPayload):
    """Text agent — HTTP POST + SSE streaming"""
    session_id = payload.session_id or await create_session(app="cloudcare")
    handler = CloudCareChatHandler(session_id=session_id, app="cloudcare")
    
    async def process():
        try:
            await handler.handle_message(payload.text, payload.current_page)
        except Exception as exc:
            logger.error("cloudcare_chat.process_error", error=str(exc))
            await handler.send_error(str(exc))
    
    asyncio.create_task(process())
    return StreamingResponse(handler.stream_generator(), media_type="text/event-stream")

@router.websocket(f"/{settings.ws_cloudcare_voice}")
async def cloudcare_voice_endpoint(websocket: WebSocket) -> None:
    """Duplex voice agent — gemini-3.1-flash-live-preview via Gemini Live API"""
    handler = GeminiLiveVoiceHandler(
        websocket=websocket,
        app="cloudcare",
        system_prompt=_CLOUDCARE_SYSTEM_PROMPT,
        available_routes=_CLOUDCARE_ROUTES,
    )
    await handler.run()
