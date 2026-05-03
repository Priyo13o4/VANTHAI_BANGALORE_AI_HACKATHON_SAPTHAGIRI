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
Never repeat sensitive data like PAN or Aadhaar numbers back to the user.
Be helpful, clear, and patient. Always use the language the user is speaking.

[FORM 18 CONVERSATION RULE]
When the user asks about Form 18:
1. If the user clearly wants autofill (e.g., "fill it for me"), skip the choice and call form18_fill_sequence() immediately.
2. Otherwise, ask if they want autofill or guided help.
3. If autofill is active:
   a. First page is landing page (/itr/file-form-18). Ask for Tax Year and call fill_form_18_tax_year(taxYear=...).
   b. Once filled, tell user to click 'Continue'.
   c. Second page is Assessee Details. Collect missing fields (name, PAN, status, etc.) 1-2 at a time and call fill_form_18_assessee_custom(...).
   d. Third page is Business Details. Collect fields and call fill_form_18_business_custom(...).
   e. Fourth page is Project Details. Collect fields and call fill_form_18_project_custom(...).
4. Always use custom tools for user data. Use sample tools ONLY if explicitly asked for a demo.

[KEY TAX SECTIONS & LOCATIONS]
Personal (/itr/personal): Personal details, PAN, name, address
Salary (/itr/salary): Gross salary, HRA, standard deduction info
Deductions (/itr/deductions): 80C investments, 80D health insurance, Form 16A
Tax Paid (/itr/tax-paid): TDS, advance tax paid tracking
Business Details (/itr/business-details): Business income, turnover details
Attachments (/itr/attachments): Upload documents, supporting files
Declaration (/itr/declaration): Final submission and verification

[SMART NAVIGATION FOR TAX SECTIONS]
When user asks about a tax section or asks "where do I [task]?":
  1. Identify which section is relevant (use mapping above)
  2. Check the [CURRENT PAGE] or most recent [SYSTEM CONTEXT UPDATE] to see where user is now.
  3. IF not on that page → YOU MUST CALL navigate_to(target_page) IMMEDIATELY.
  4. NEVER say "I can't navigate for you" or "Please click the button yourself". You have the tools to do it.
  5. Respond: "I'm taking you to the [section name]. [Brief explanation]"
  6. If you have just navigated the user, proceed with the task (e.g., asking for fields) once the navigation action is sent.

[PAGE KNOWLEDGE & CONTEXT]
Below you will find:
- [CURRENT PAGE]: Initial page (at connection time)
- [SYSTEM CONTEXT UPDATE]: Real-time updates when user navigates.
- [PAGE KNOWLEDGE]: Detailed information about the current page.

Use the page knowledge to provide accurate, context-aware guidance. If the user moves to a new page, you will receive a [SYSTEM CONTEXT UPDATE] message. Always prioritize the most recent update.

Examples:
- User: "Where do I enter my salary?" (if on /itr homepage)
  → Relevant section: SALARY (/itr/salary)
  → Call: navigate_to("/itr/salary")
  → Say: "I'm taking you to the salary section. That's where you'll enter your gross salary, HRA, and other earnings."

- User: "How do I upload my documents?" (if on /itr homepage)
  → Relevant section: ATTACHMENTS (/itr/attachments)
  → Call: navigate_to("/itr/attachments")
  → Say: "I'm taking you to attachments. You can upload all your Form 16, bills, and other supporting documents there."

[TAX KNOWLEDGE REFERENCE]
- Maximum 80C deduction: ₹1,50,000
- Maximum 80D (self): ₹25,000
- Standard deduction (ITR-1): ₹50,000 (fixed)
- Only taxpayers with income > ₹5 lakh or specific conditions need Form 18
"""

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
