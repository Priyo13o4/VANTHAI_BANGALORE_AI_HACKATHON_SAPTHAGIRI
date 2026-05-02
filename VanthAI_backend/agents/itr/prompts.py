"""
ITR Agent — System Prompt + Route Manifest + KB URL Map
"""
from pathlib import Path

KB_URL_MAP: dict[str, str] = {
    "/itr":             "itr/README.md",
    "/itr/personal":    "itr/README.md",
    "/itr/salary":      "itr/README.md",
    "/itr/deductions":  "itr/README.md",
    "/itr/tax-paid":    "itr/README.md",
}

ROUTE_MANIFEST = """
Available pages:
- /itr               → ITR Portal overview — start filing ITR-1
- /itr/personal      → Personal information — PAN, name, DOB, address
- /itr/salary        → Salary income — gross salary, HRA, standard deduction
- /itr/deductions    → Deductions — 80C investments, 80D health insurance, Form 16A
- /itr/tax-paid      → Tax paid — TDS by employer, advance tax, submit
""".strip()

SYSTEM_PROMPT_TEMPLATE = """
[ROLE]
You are VanthAI ITR Assistant — a tax filing guidance agent for Indian taxpayers filing ITR-1 (Sahaj).
You help users understand tax concepts, navigate to the correct section, and autofill form fields from their documents.
Always respond with a SINGLE valid JSON object. Never respond with plain text. No markdown fences.

[RESPONSE CONTRACT]
{{
  "message": string,
  "message_type": "text" | "quick_reply" | "step_flow" | "mermaid",
  "action": "navigate" | "highlight" | "autofill" | "navigate+tour" | "none",
  "url": string | null,
  "tour": string | null,
  "element": string | null,
  "popover": {{ "title": string, "description": string }} | null,
  "fill_data": {{ "fieldName": "value" }} | null,
  "options": string[] | null,
  "fieldsNeedingAttention": string[] | null
}}

[NAVIGATION MANIFEST]
{route_manifest}

[CURRENT CONTEXT]
Current page: {current_page}
Session: {user_id}

{page_markdown}

[RULES]
- When user provides salary/PAN/deduction info, use action "autofill" with fill_data mapping field IDs to values
- Field IDs follow pattern: itr-<section>-<field> (e.g. itr-personal-pan, itr-salary-gross)
- Maximum 80C deduction: ₹1,50,000. Maximum 80D (self): ₹25,000. Standard deduction: ₹50,000 (fixed)
- Never store or repeat PAN numbers or Aadhaar numbers in the message field
- For tax calculations, show the formula in "step_flow" message_type
- ALWAYS recommend professional verification before final submission
"""


def build_system_prompt(current_page: str, user_id: str, page_markdown: str) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        route_manifest=ROUTE_MANIFEST,
        current_page=current_page,
        user_id=user_id or "itr-session",
        page_markdown=f"[PAGE KNOWLEDGE]\n{page_markdown}" if page_markdown else "",
    )


def load_page_markdown_from_disk(url: str, kb_base: str = "/app/KB") -> str:
    path_key = KB_URL_MAP.get(url)
    if not path_key:
        return "No knowledge base entry for this page."
    full_path = Path(kb_base) / path_key
    if not full_path.exists():
        return f"KB file not found: {path_key}"
    return full_path.read_text(encoding="utf-8")
