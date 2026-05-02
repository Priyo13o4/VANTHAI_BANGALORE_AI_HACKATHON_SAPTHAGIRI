"""
CloudCare Agent — Wires the base graph with CloudCare tools + prompts.
"""
import json

import structlog

from agents.base_agent import build_agent_graph, run_agent
from agents.cloudcare.prompts import build_system_prompt, load_page_markdown_from_disk
from agents.cloudcare.tools import CLOUDCARE_TOOLS
from core.redis_client import append_message, get_session, update_session_page
from core.http_chat import HTTPChatHandler

logger = structlog.get_logger(__name__)

# Compile graph once at module load (not per request)
_CLOUDCARE_GRAPH = build_agent_graph(CLOUDCARE_TOOLS)


class CloudCareChatHandler(HTTPChatHandler):
    """
    Handles CloudCare chat WebSocket connections.
    Each incoming message:
      1. Slides Redis session TTL
      2. Loads page markdown for current page (grounding)
      3. Builds system prompt
      4. Runs LangGraph agent (streams WS frames)
      5. Appends messages to Redis session
    """

    async def handle_message(self, text: str, current_page: str) -> None:
        if not text:
            await self.send_done()
            return

        session = await get_session(self.session_id) or {"messages": [], "current_page": current_page}
        await update_session_page(self.session_id, current_page)

        page_markdown = load_page_markdown_from_disk(current_page, kb_base="/app/KB")
        user_id = session.get("user_id", "1")  # default to demo patient 1 (Rajesh)
        system_prompt = build_system_prompt(current_page, user_id, page_markdown)

        await run_agent(
            ws=self,
            message=text,
            session=session,
            system_prompt=system_prompt,
            tools=CLOUDCARE_TOOLS,
            graph=_CLOUDCARE_GRAPH,
        )

        # Persist to rolling 20-turn window in Redis
        await append_message(self.session_id, "user", text)
        # (assistant reply is appended by output_node via session — simplified here)

        logger.info("cloudcare.message_handled", session_id=self.session_id, page=current_page)
