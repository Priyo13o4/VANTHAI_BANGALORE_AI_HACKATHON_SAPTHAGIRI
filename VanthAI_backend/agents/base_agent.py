"""
VanthAI — Base LangGraph Agent
Shared graph structure for CloudCare and ITR agents.

Graph topology:
  START → input_node → llm_node → tool_router
                                    ├── tool_node → llm_node  (loop until done)
                                    └── output_node → END

WS streaming:
  - llm_node:   emits thinking + token frames
  - tool_node:  emits tool_call(running) → tool_call(done) frames
  - output_node: emits action + done frames

⚠️ langchain-google-genai 4.2.2: Use ChatGoogleGenerativeAI(model=..., google_api_key=...)
⚠️ langchain-openai 1.1.12: Use ChatOpenAI(base_url=..., api_key="lm-studio")
"""
from __future__ import annotations

import json
import re
from typing import Any, Literal

import structlog
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

from core.config import settings
from core.dispatcher import parse_ai_response
from core.websocket import BaseWebSocketHandler

logger = structlog.get_logger(__name__)


# ── Agent State ────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: list[BaseMessage]
    system_prompt: str
    current_page: str
    ws_handler: Any          # BaseWebSocketHandler — not serialized by LangGraph
    tool_results: list[str]


# ── LLM Factory ───────────────────────────────────────────────────────────────

def _make_llm(tools: list[BaseTool]):
    """
    ⚠️ langchain-google-genai 4.2.2: initialise with google_api_key kwarg.
       Do NOT use the old genai.configure() pattern.
    """
    from langchain_google_genai import ChatGoogleGenerativeAI
    llm = ChatGoogleGenerativeAI(
        model=settings.gemma_text_model,
        google_api_key=settings.google_ai_api_key,
        temperature=0.2,
        streaming=True,
    )
    return llm.bind_tools(tools)


# ── Node Implementations ───────────────────────────────────────────────────────

async def input_node(state: AgentState) -> dict:
    """Prepend SystemMessage with current system prompt."""
    sys_msg = SystemMessage(content=state["system_prompt"])
    # Ensure system message is first — replace if already present
    msgs = [m for m in state["messages"] if not isinstance(m, SystemMessage)]
    return {"messages": [sys_msg, *msgs]}


async def llm_node(state: AgentState, tools: list[BaseTool]) -> dict:
    """
    Call LLM with streaming. Silently accumulates JSON output — does NOT stream
    tokens to the frontend because the LLM outputs raw JSON (per system prompt contract).
    output_node sends the parsed message field as the visible token instead.
    Appends AIMessage (with possible tool_calls) to state.
    """
    ws: BaseWebSocketHandler = state["ws_handler"]
    llm = _make_llm(tools)

    await ws.send_thinking("Analysing your request…")

    full_content = ""
    tool_calls_raw = []

    def _coerce_content(content: Any) -> str:
        """Safely extract text from a chunk.content that may be str or list-of-parts."""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for part in content:
                if isinstance(part, str):
                    parts.append(part)
                elif isinstance(part, dict):
                    parts.append(part.get("text", ""))
            return "".join(parts)
        return str(content) if content is not None else ""

    try:
        async for chunk in llm.astream(state["messages"]):
            # Check if the chunk is a thought part
            _metadata = getattr(chunk, "response_metadata", {}) or {}
            for part in _metadata.get("parts", []):
                if part.get("thought"):
                    await ws.send_thinking(part.get("text", ""))

            if chunk.content:
                text = _coerce_content(chunk.content)
                if text:
                    full_content += text
                    # ✅ Stream tokens immediately — model output is plain text/JSON
                    # Partial JSON is fine; output_node parses the complete final string
                    await ws.send_token(text)
            if hasattr(chunk, "tool_calls") and chunk.tool_calls:
                # Accumulate tool calls properly across chunks if needed, but for now match existing:
                tool_calls_raw = chunk.tool_calls
    except Exception as exc:
        logger.error("llm_node.error", error=str(exc), exc_info=True)
        await ws.send_error(f"LLM error: {exc}")
        return {"messages": state["messages"]}

    ai_msg = AIMessage(content=full_content, tool_calls=tool_calls_raw)
    return {"messages": [*state["messages"], ai_msg]}


async def tool_router(state: AgentState) -> Literal["tool_node", "output_node"]:
    """Route to tool_node if LLM wants to call tools, else output_node."""
    last = state["messages"][-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "tool_node"
    return "output_node"


async def tool_node(state: AgentState, tools: list[BaseTool]) -> dict:
    """Execute all tool calls and return ToolMessages."""
    ws: BaseWebSocketHandler = state["ws_handler"]
    last: AIMessage = state["messages"][-1]
    tool_map = {t.name: t for t in tools}
    new_messages = list(state["messages"])

    for tc in last.tool_calls:
        name = tc["name"]
        args = tc.get("args", {})
        tool_id = tc.get("id", name)

        await ws.send_tool_call(name=name, args=args, status="running")

        tool_fn = tool_map.get(name)
        if tool_fn is None:
            result = f"Tool '{name}' not found."
        else:
            try:
                result = await tool_fn.ainvoke(args) if hasattr(tool_fn, "ainvoke") else tool_fn.invoke(args)
            except Exception as exc:
                result = f"Tool error: {exc}"

        result_str = str(result)
        preview = result_str[:120] + ("…" if len(result_str) > 120 else "")
        await ws.send_tool_call(name=name, args=args, status="done", result_preview=preview)

        # If tool result is a JSON action payload (e.g., from spotlight_element), send it as action
        try:
            result_json = json.loads(result_str)
            if isinstance(result_json, dict) and "action" in result_json:
                await ws.send_action(result_json)
        except (json.JSONDecodeError, TypeError):
            pass  # Not an action payload, just a regular tool result

        new_messages.append(ToolMessage(content=result_str, tool_call_id=tool_id))

    return {"messages": new_messages}


async def output_node(state: AgentState) -> dict:
    """
    Send the conversational text output from the LLM.
    
    The LLM now outputs plain conversational text (not JSON).
    Tool calls are handled separately by tool_node.
    """
    ws: BaseWebSocketHandler = state["ws_handler"]
    last = state["messages"][-1]
    raw_content = last.content if isinstance(last, (AIMessage, HumanMessage)) else ""
    
    # Flatten content if it's a list of parts
    if isinstance(raw_content, list):
        raw = "".join(
            p if isinstance(p, str) else p.get("text", "") if isinstance(p, dict) else ""
            for p in raw_content
        )
    else:
        raw = raw_content or ""

    # Send the conversational text directly (no JSON parsing)
    visible = raw.strip() if raw.strip() else "I'm not sure how to help with that."
    await ws.send_token(visible)

    await ws.send_done()
    return {}


# ── Graph Builder ──────────────────────────────────────────────────────────────

def build_agent_graph(tools: list[BaseTool]):
    """
    Build the LangGraph StateGraph with the given tools.
    Returns a compiled graph ready for async invocation.
    """
    from functools import partial

    graph = StateGraph(AgentState)

    graph.add_node("input_node", input_node)
    graph.add_node("llm_node",   partial(llm_node,  tools=tools))
    graph.add_node("tool_node",  partial(tool_node, tools=tools))
    graph.add_node("output_node", output_node)

    graph.add_edge(START, "input_node")
    graph.add_edge("input_node", "llm_node")
    graph.add_conditional_edges("llm_node", tool_router, {
        "tool_node":   "tool_node",
        "output_node": "output_node",
    })
    graph.add_edge("tool_node", "llm_node")   # loop back after tool execution
    graph.add_edge("output_node", END)

    return graph.compile()


# ── Run Helper ─────────────────────────────────────────────────────────────────

async def run_agent(
    *,
    ws: BaseWebSocketHandler,
    message: str,
    session: dict,
    system_prompt: str,
    tools: list[BaseTool],
    graph,
    image_base64: str = None,
    image_mime_type: str = None,
) -> None:
    """
    Entry point for each incoming WS message.
    Builds state from session history, invokes graph, which streams WS frames.
    """
    history: list[BaseMessage] = []
    for msg in session.get("messages", []):
        if msg["role"] == "user":
            history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            history.append(AIMessage(content=msg["content"]))

    if image_base64:
        mime = image_mime_type or "image/jpeg"
        content_block = [
            {"type": "text", "text": message},
            {
                "type": "image_url",
                 "image_url": {"url": f"data:{mime};base64,{image_base64}"}
            }
        ]
        history.append(HumanMessage(content=content_block))
    else:
        history.append(HumanMessage(content=message))

    state: AgentState = {
        "messages": history,
        "system_prompt": system_prompt,
        "current_page": session.get("current_page", "/"),
        "ws_handler": ws,
        "tool_results": [],
    }

    try:
        await graph.ainvoke(state)
    except Exception as exc:
        logger.error("run_agent.error", session_id=ws.session_id, error=str(exc), exc_info=True)
        await ws.send_error(str(exc))
        await ws.send_done()
