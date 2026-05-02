"""
ITR Agent — FastAPI WS Routes (LIVE — uses real LangGraph agent)
"""
from fastapi import APIRouter, WebSocket

from agents.itr.agent import ITRChatHandler
from core.config import settings
from core.websocket import BaseWebSocketHandler

router = APIRouter(tags=["itr"])


class ITRVoiceHandler(BaseWebSocketHandler):
    async def handle_message(self, message: str) -> None:
        await self.send_token("ITR voice agent — Phase 4c.")
        await self.send_done()


@router.websocket(f"/{settings.ws_itr_chat}")
async def itr_chat_endpoint(websocket: WebSocket) -> None:
    handler = ITRChatHandler(websocket, app="itr")
    await handler.run()


@router.websocket(f"/{settings.ws_itr_voice}")
async def itr_voice_endpoint(websocket: WebSocket) -> None:
    handler = ITRVoiceHandler(websocket, app="itr")
    await handler.run()
