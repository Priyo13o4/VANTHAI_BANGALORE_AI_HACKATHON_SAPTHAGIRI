"""
ITR Agent — FastAPI Routes (Phase 4c)
Chat: HTTP POST with Server-Sent Events (SSE) streaming
Voice: WebSocket duplex audio with Gemini Live API
"""
import structlog
from fastapi import APIRouter, Query, WebSocket
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import StreamingResponse
import asyncio

from agents.itr.agent import ITRChatHandler
from agents.itr.prompts import load_page_markdown_from_disk
from core.config import settings
from core.gemini_live import GeminiLiveVoiceHandler
from core.redis_client import create_session

logger = structlog.get_logger(__name__)
router = APIRouter(tags=["itr"])

class ChatPayload(BaseModel):
    text: str
    current_page: str
    session_id: Optional[str] = None

_ITR_SYSTEM_PROMPT = """You are VanthAI ITR Assistant, a voice-first Indian tax filing guide.
You are having a real-time voice conversation with a taxpayer.
Keep all spoken responses concise (2-3 sentences max) and natural — no lists, no markdown.
If the user asks to navigate to a tax section, use the navigate_to tool.
Never repeat sensitive data like PAN or Aadhaar numbers back to the user.
Be helpful, clear, and patient."""

_ITR_ROUTES = [
    "/itr",
    "/itr/personal",
    "/itr/salary",
    "/itr/deductions",
    "/itr/tax-paid",
    "/itr/file-return",
    "/itr/upload-itr",
    "/itr/file-forms",
    "/itr/file-form-18",
    "/itr/form-18-sections",
    "/itr/assessee-details",
    "/itr/business-details",
    "/itr/project-details",
    "/itr/other-details",
    "/itr/conditions-fulfillment",
    "/itr/attachments",
    "/itr/declaration",
]

@router.post(f"/{settings.ws_itr_chat}")
async def itr_chat_endpoint(payload: ChatPayload):
    """Text agent — HTTP POST + SSE streaming"""
    session_id = payload.session_id or await create_session(app="itr")
    handler = ITRChatHandler(session_id=session_id, app="itr")
    
    async def process():
        try:
            await handler.handle_message(payload.text, payload.current_page)
        except Exception as exc:
            logger.error("itr_chat.process_error", error=str(exc))
            await handler.send_error(str(exc))
    
    asyncio.create_task(process())
    return StreamingResponse(handler.stream_generator(), media_type="text/event-stream")

@router.websocket(f"/{settings.ws_itr_voice}")
async def itr_voice_endpoint(
    websocket: WebSocket,
    page: str = Query(default="/itr"),
    session_id: str = Query(default=""),
) -> None:
    """Duplex voice agent — gemini-3.1-flash-live-preview via Gemini Live API"""
    page_markdown = load_page_markdown_from_disk(page, kb_base="/app/KB")
    page_ctx = f"\n\n[CURRENT PAGE]\nThe user is currently on: {page}\nDo NOT offer to navigate there — the user is already there."
    kb_ctx = f"\n\n[PAGE KNOWLEDGE]\n{page_markdown}" if page_markdown else ""
    
    system_prompt = _ITR_SYSTEM_PROMPT + page_ctx + kb_ctx
    
    handler = GeminiLiveVoiceHandler(
        websocket=websocket,
        app="itr",
        system_prompt=system_prompt,
        available_routes=_ITR_ROUTES,
        provided_session_id=session_id or None,
    )
    await handler.run()
