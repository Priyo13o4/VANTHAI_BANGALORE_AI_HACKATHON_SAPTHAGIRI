"""
CloudCare Agent — FastAPI Routes (Phase 4c)
Chat: HTTP POST with Server-Sent Events (SSE) streaming
Voice: WebSocket duplex audio with Gemini Live API
"""
import structlog
from fastapi import APIRouter, Query, WebSocket
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import StreamingResponse
import asyncio

from agents.cloudcare.agent import CloudCareChatHandler
from agents.cloudcare.prompts import load_page_markdown_from_disk
from core.config import settings
from core.gemini_live import GeminiLiveVoiceHandler
from core.redis_client import create_session

logger = structlog.get_logger(__name__)
router = APIRouter(tags=["cloudcare"])

class ChatPayload(BaseModel):
    text: str
    current_page: str
    session_id: Optional[str] = None
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = None

_CLOUDCARE_SYSTEM_PROMPT = """You are VanthAI CloudCare, a voice-first health assistant embedded in a patient portal.
You are having a real-time voice conversation with a patient.
Keep all spoken responses concise (2-3 sentences max) and natural — no lists, no markdown.
Be warm, professional, and reassuring. Always use the language the user is speaking.

[CRITICAL: ELEMENT-TO-PAGE MAPPING]
APPOINTMENTS page (/cloudcare/patient/appointments): cloudcare-appointments-root, cloudcare-appointments-book-btn, cloudcare-appointments-next, cloudcare-appointments-dialog-root, cloudcare-appointment-doctor, cloudcare-appointment-hospital, cloudcare-appointment-department, cloudcare-appointment-form-date, cloudcare-appointment-form-time, cloudcare-appointment-notes, cloudcare-appointments-cancel-btn, cloudcare-appointments-confirm-btn
RECORDS page (/cloudcare/patient/records): cloudcare-records-root, cloudcare-records-latest, cloudcare-records-filter-type, cloudcare-records-sort-toggle, cloudcare-records-count
VITALS page (/cloudcare/patient/vitals): cloudcare-vitals-root, cloudcare-vitals-heart-rate, cloudcare-vitals-spo2, cloudcare-vitals-bp, cloudcare-vitals-temp, cloudcare-vitals-steps, cloudcare-vitals-alert-badge, cloudcare-vitals-hr-chart
PRESCRIPTIONS page (/cloudcare/patient/prescriptions): cloudcare-prescriptions-root, cloudcare-prescriptions-active, cloudcare-prescriptions-primary, cloudcare-prescriptions-refills, cloudcare-prescriptions-past, cloudcare-prescriptions-print-btn
DASHBOARD page (/cloudcare/patient): cloudcare-patient-dashboard, cloudcare-records-latest

[SMART SPOTLIGHTING LOGIC]
When user asks "where is [element]?" or "show me [element]?":
  1. Look up which page that element belongs to (use mapping above)
  2. Check the [CURRENT PAGE] section below to see where user is now
  3. IF user is NOT on that page → Call navigate_to(target_page) FIRST
  4. THEN call spotlight_element(element_id, title, description)
  5. Respond naturally: "I'm taking you to [page name]. Let me highlight the [element name] for you."

IF element doesn't exist on ANY page or you're unsure → Say so. Don't hallucinate or guess.
IF user asks about something only on current page → Skip navigate_to, just spotlight directly.

[PAGE KNOWLEDGE & CONTEXT]
Below you will find:
- [CURRENT PAGE]: The page the user is currently viewing
- [PAGE KNOWLEDGE]: Detailed information about the current page from our knowledge base
- [PATIENT CONTEXT]: Patient ID and session info

Use the page knowledge to answer questions AND to know which elements are actually visible.
The element-to-page mapping above tells you WHERE things are; the page knowledge tells you WHAT they mean.

Examples:
- User: "Where is the book appointment button?" (if on /cloudcare/patient dashboard)
  → Element is on APPOINTMENTS page, user is on DASHBOARD
  → Call: navigate_to("/cloudcare/patient/appointments")
  → Call: spotlight_element("cloudcare-appointments-book-btn", "Book Appointment", "Click here to schedule...")
  → Say: "I'm taking you to your appointments page. Let me highlight the Book Appointment button for you."

- User: "Show me my heart rate" (if on /cloudcare/patient/vitals)
  → Element is on VITALS page, user is already on VITALS
  → Skip navigate_to()
  → Call: spotlight_element("cloudcare-vitals-heart-rate", "Heart Rate", "Your current heart rate reading...")
  → Say: "Here's your heart rate metric. You can see your reading right there."
"""

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
            await handler.handle_message(
                payload.text,
                payload.current_page,
                image_base64=payload.image_base64,
                image_mime_type=payload.image_mime_type
            )
        except Exception as exc:
            logger.error("cloudcare_chat.process_error", error=str(exc))
            await handler.send_error(str(exc))
    
    asyncio.create_task(process())
    return StreamingResponse(handler.stream_generator(), media_type="text/event-stream")

@router.websocket(f"/{settings.ws_cloudcare_voice}")
async def cloudcare_voice_endpoint(
    websocket: WebSocket,
    page: str = Query(default="/cloudcare"),
    session_id: str = Query(default=""),
) -> None:
    """Duplex voice agent — gemini-3.1-flash-live-preview via Gemini Live API"""
    page_markdown = load_page_markdown_from_disk(page, kb_base="/app/KB")
    page_ctx = f"\n\n[CURRENT PAGE]\nThe user is currently on: {page}\nDo NOT offer to navigate there — the user is already there. Focus on helping with what that page provides."
    kb_ctx = f"\n\n[PAGE KNOWLEDGE]\n{page_markdown}" if page_markdown else ""
    patient_ctx = f"\n\n[PATIENT CONTEXT]\nPatient: 1 (Rajesh Kumar)\nUse this ID for all database queries."
    
    system_prompt = _CLOUDCARE_SYSTEM_PROMPT + page_ctx + kb_ctx + patient_ctx
    
    handler = GeminiLiveVoiceHandler(
        websocket=websocket,
        app="cloudcare",
        system_prompt=system_prompt,
        available_routes=_CLOUDCARE_ROUTES,
        provided_session_id=session_id or None,
    )
    await handler.run()
