"""
CloudCare Agent — FastAPI WS Routes (LIVE — uses real LangGraph agent)
Path strings read from settings — never hardcoded.
"""
from fastapi import APIRouter, WebSocket

from agents.cloudcare.agent import CloudCareChatHandler
from core.config import settings
from core.websocket import BaseWebSocketHandler

router = APIRouter(tags=["cloudcare"])


class CloudCareVoiceHandler(BaseWebSocketHandler):
    """
    Voice pipeline stub.
    Phase 4c: wire Gemma E4B via LM Studio for audio→audio.
    langchain-openai 1.1.12: ChatOpenAI(base_url=settings.lmstudio_base_url, api_key='lm-studio')
    """
    async def handle_message(self, message: str) -> None:
        await self.send_thinking("Voice agent processing…")
        await self.send_token("Voice pipeline ready — microphone input coming in Phase 4c.")
        await self.send_done()


@router.websocket(f"/{settings.ws_cloudcare_chat}")
async def cloudcare_chat_endpoint(websocket: WebSocket) -> None:
    handler = CloudCareChatHandler(websocket, app="cloudcare")
    await handler.run()


@router.websocket(f"/{settings.ws_cloudcare_voice}")
async def cloudcare_voice_endpoint(websocket: WebSocket) -> None:
    handler = CloudCareVoiceHandler(websocket, app="cloudcare")
    await handler.run()
