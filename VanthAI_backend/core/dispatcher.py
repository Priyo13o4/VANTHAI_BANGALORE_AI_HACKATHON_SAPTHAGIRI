"""
VanthAI Backend — Typed Action Payload (Dispatcher)
Parses raw AI JSON output → validated Pydantic ActionPayload.
Contract matches ERP-SIH protocol exactly, extended with new action types.
"""
import json
import re
from typing import Any, Literal

import structlog
from pydantic import BaseModel, field_validator

logger = structlog.get_logger(__name__)

# ── Envelope types (WS frames sent to frontend) ────────────────────────────────

MessageType = Literal["text", "quick_reply", "step_flow", "mermaid"]
ActionType = Literal["navigate", "highlight", "autofill", "navigate+tour", "fillForm", "none"]


class PopoverConfig(BaseModel):
    title: str = ""
    description: str = ""


class ActionPayload(BaseModel):
    """
    Typed representation of a single AI action envelope.
    Backward-compatible with ERP-SIH protocol:
      - action: navigate  (ERP-SIH compat)
      - action: fillForm  (ERP-SIH compat — fill_data maps to parsed.data)
    Extended:
      - action: highlight
      - action: autofill  (preferred new name for fillForm)
      - action: navigate+tour
      - action: none
    """
    message: str = ""
    message_type: MessageType = "text"
    action: ActionType = "none"
    url: str | None = None
    tour: str | None = None
    element: str | None = None
    popover: PopoverConfig | None = None
    fill_data: dict[str, Any] | None = None  # maps to ERP-SIH parsed.data
    options: list[str] | None = None
    fields_needing_attention: list[str] | None = None

    @field_validator("action", mode="before")
    @classmethod
    def coerce_action(cls, v: Any) -> str:
        # Accept "fillForm" (ERP-SIH legacy) and normalize
        if v == "fillForm":
            return "fillForm"
        return v if v else "none"


def parse_ai_response(raw: str) -> ActionPayload | None:
    """
    Parse raw LLM output string into a typed ActionPayload.
    Strips markdown code fences if present.
    Returns None if parsing fails (caller sends error envelope).
    """
    text = raw.strip()

    # Strip ```json ... ``` or ``` ... ``` fences
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()

    try:
        data = json.loads(text)
        return ActionPayload.model_validate(data)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("dispatcher.parse_failed", error=str(exc), raw_preview=raw[:200])
        return None
