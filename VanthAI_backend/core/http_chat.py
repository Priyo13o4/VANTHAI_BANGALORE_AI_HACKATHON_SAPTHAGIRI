"""
VanthAI Backend — HTTPChatHandler
Simulates the BaseWebSocketHandler interface but streams Server-Sent Events (SSE).
Used to replace the WebSocket chat endpoint with standard POST HTTP + streaming.
"""
import asyncio
import json
from typing import Any

class HTTPChatHandler:
    def __init__(self, session_id: str, app: str):
        self.session_id = session_id
        self.app = app
        self._queue = asyncio.Queue()
        self._done = False

    async def send(self, payload: dict[str, Any]) -> None:
        if self._done:
            return
        await self._queue.put(f"data: {json.dumps(payload)}\n\n")

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
        await self._queue.put(None)  # stream closer
        self._done = True

    async def send_error(self, message: str) -> None:
        await self.send({"type": "error", "message": message})
        if not self._done:
            await self.send_done()

    async def stream_generator(self):
        # 1. Start with session_init
        yield f"data: {json.dumps({'type': 'session_init', 'session_id': self.session_id})}\n\n"
        
        while True:
            chunk = await self._queue.get()
            if chunk is None:
                break
            yield chunk
