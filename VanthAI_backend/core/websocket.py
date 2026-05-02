"""
VanthAI Backend — BaseWebSocketHandler
Manages WS lifecycle: connect → session_init → stream → disconnect.

Protocol:
  1. WS CONNECT  → generate session_id → send { type: "session_init", session_id }
  2. Each message → slide TTL: EXPIRE session:{id} 300
  3. WS DISCONNECT → DEL session:{id}
  4. No reconnect — page reload = new WS = new session
"""
import json
from typing import Any

import structlog
from fastapi import WebSocket, WebSocketDisconnect

from core.redis_client import create_session, delete_session

logger = structlog.get_logger(__name__)


class BaseWebSocketHandler:
    """
    Subclass this for each agent endpoint.
    Override handle_message() to process incoming text messages.
    """

    def __init__(self, websocket: WebSocket, app: str) -> None:
        self.ws = websocket
        self.app = app
        self.session_id: str = ""

    # ── Frame helpers ──────────────────────────────────────────────────────────

    async def send(self, payload: dict[str, Any]) -> None:
        """Send a JSON frame to the frontend."""
        try:
            await self.ws.send_text(json.dumps(payload))
        except Exception as exc:
            logger.warning("ws.send_failed", session_id=self.session_id, error=str(exc))

    async def send_thinking(self, content: str) -> None:
        await self.send({"type": "thinking", "content": content})

    async def send_tool_call(
        self,
        name: str,
        args: dict,
        status: str = "running",
        result_preview: str = "",
    ) -> None:
        payload: dict[str, Any] = {
            "type": "tool_call",
            "name": name,
            "args": args,
            "status": status,
        }
        if result_preview:
            payload["result_preview"] = result_preview
        await self.send(payload)

    async def send_token(self, content: str) -> None:
        await self.send({"type": "token", "content": content})

    async def send_action(self, action_payload: dict[str, Any]) -> None:
        await self.send({"type": "action", **action_payload})

    async def send_done(self) -> None:
        await self.send({"type": "done"})

    async def send_error(self, message: str) -> None:
        await self.send({"type": "error", "message": message})

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        """Accept the WS, create session, send session_init as FIRST frame."""
        await self.ws.accept()
        self.session_id = await create_session(app=self.app)
        # session_init is ALWAYS the first WS frame — frontend stores session_id in state only
        await self.send({"type": "session_init", "session_id": self.session_id})
        logger.info("ws.connected", session_id=self.session_id, app=self.app)

    async def disconnect(self) -> None:
        """Delete session on disconnect (triggered by beforeunload or tab close)."""
        if self.session_id:
            await delete_session(self.session_id)
        logger.info("ws.disconnected", session_id=self.session_id, app=self.app)

    async def handle_message(self, message: str) -> None:
        """
        Override in subclasses to handle incoming text messages.
        Default: echo with error that the endpoint has no agent wired yet.
        """
        await self.send_error("No agent wired to this endpoint yet.")
        await self.send_done()

    async def run(self) -> None:
        """Main loop — connect, receive messages, disconnect on close."""
        await self.connect()
        try:
            while True:
                raw = await self.ws.receive_text()
                await self.handle_message(raw)
        except WebSocketDisconnect:
            await self.disconnect()
        except Exception as exc:
            logger.error(
                "ws.unexpected_error",
                session_id=self.session_id,
                error=str(exc),
                exc_info=True,
            )
            await self.send_error(str(exc))
            await self.disconnect()
