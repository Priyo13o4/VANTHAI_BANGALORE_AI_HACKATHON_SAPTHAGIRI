"""
ITR Agent — Wires the base graph with ITR tools + prompts.
"""
import json

import structlog

from agents.base_agent import build_agent_graph, run_agent
from agents.itr.prompts import build_system_prompt, load_page_markdown_from_disk
from agents.itr.tools import ITR_TOOLS
from core.redis_client import append_message, get_session, update_session_page
from core.websocket import BaseWebSocketHandler

logger = structlog.get_logger(__name__)

_ITR_GRAPH = build_agent_graph(ITR_TOOLS)


class ITRChatHandler(BaseWebSocketHandler):
    async def handle_message(self, raw: str) -> None:
        try:
            data = json.loads(raw)
            text = data.get("text", "").strip()
            current_page = data.get("current_page", "/itr")
        except (json.JSONDecodeError, AttributeError):
            text = raw.strip()
            current_page = "/itr"

        if not text:
            return

        session = await get_session(self.session_id) or {"messages": [], "current_page": current_page}
        await update_session_page(self.session_id, current_page)

        page_markdown = load_page_markdown_from_disk(current_page, kb_base="/app/KB")
        user_id = session.get("user_id", "itr-demo")
        system_prompt = build_system_prompt(current_page, user_id, page_markdown)

        await run_agent(
            ws=self,
            message=text,
            session=session,
            system_prompt=system_prompt,
            tools=ITR_TOOLS,
            graph=_ITR_GRAPH,
        )

        await append_message(self.session_id, "user", text)
        logger.info("itr.message_handled", session_id=self.session_id, page=current_page)
