"""
VanthAI — Minimal Critical Tests
Covers: dispatcher parsing, session Redis contract, WS envelope types, ITR tax calculator.
Run with: pytest tests/ -v
"""
import json
import pytest

# ── 1. Dispatcher: valid JSON action ─────────────────────────────────────────
def test_dispatcher_parses_navigate():
    from agents.cloudcare.prompts import build_system_prompt  # noqa: F401 — import check
    from core.dispatcher import parse_ai_response

    raw = json.dumps({
        "message": "Taking you to records.",
        "message_type": "text",
        "action": "navigate",
        "url": "/cloudcare/patient/records",
    })
    payload = parse_ai_response(raw)
    assert payload is not None
    assert payload.action == "navigate"
    assert payload.url == "/cloudcare/patient/records"


def test_dispatcher_parses_highlight():
    from core.dispatcher import parse_ai_response

    raw = json.dumps({
        "message": "Look at this record.",
        "message_type": "text",
        "action": "highlight",
        "element": "cloudcare-records-latest",
        "popover": {"title": "Latest", "description": "Your most recent visit"},
    })
    payload = parse_ai_response(raw)
    assert payload is not None
    assert payload.action == "highlight"
    assert payload.element == "cloudcare-records-latest"


def test_dispatcher_strips_markdown_fences():
    from core.dispatcher import parse_ai_response

    raw = '```json\n{"message": "Hi", "message_type": "text", "action": "none"}\n```'
    payload = parse_ai_response(raw)
    assert payload is not None
    assert payload.action == "none"


def test_dispatcher_returns_none_on_garbage():
    from core.dispatcher import parse_ai_response

    payload = parse_ai_response("This is not JSON at all!")
    assert payload is None


# ── 2. ITR Tax Calculator ─────────────────────────────────────────────────────
def test_itr_tax_calculator_basic():
    from agents.itr.tools import itr1_tax_calculator

    result_str = itr1_tax_calculator.invoke({
        "gross_salary": 700000,
        "hra_received": 0,
        "deduction_80c": 100000,
        "deduction_80d": 25000,
        "tds_by_employer": 15000,
    })
    result = json.loads(result_str)
    # Taxable = 700000 - 50000 - 100000 - 25000 = 525000
    assert result["taxable_income"] == 525000.0
    assert result["status"] in ("REFUND", "LIABILITY")
    assert "note" in result


def test_itr_tax_calculator_caps_deductions():
    from agents.itr.tools import itr1_tax_calculator

    result_str = itr1_tax_calculator.invoke({
        "gross_salary": 1000000,
        "hra_received": 0,
        "deduction_80c": 999999,   # over limit — should cap to 150000
        "deduction_80d": 999999,   # over limit — should cap to 25000
        "tds_by_employer": 0,
    })
    result = json.loads(result_str)
    # Taxable = 1000000 - 50000 - 150000 - 25000 = 775000
    assert result["taxable_income"] == 775000.0


# ── 3. KB URL Map completeness ────────────────────────────────────────────────
def test_kb_url_map_has_all_cloudcare_routes():
    from agents.cloudcare.prompts import KB_URL_MAP

    required = [
        "/cloudcare",
        "/cloudcare/patient/records",
        "/cloudcare/patient/appointments",
        "/cloudcare/patient/vitals",
        "/cloudcare/patient/prescriptions",
    ]
    for route in required:
        assert route in KB_URL_MAP, f"KB_URL_MAP missing: {route}"


def test_itr_url_map_has_all_itr_routes():
    from agents.itr.prompts import KB_URL_MAP

    required = ["/itr", "/itr/personal", "/itr/salary", "/itr/deductions", "/itr/tax-paid"]
    for route in required:
        assert route in KB_URL_MAP, f"ITR KB_URL_MAP missing: {route}"


# ── 4. Settings — no hardcoded URLs ───────────────────────────────────────────
def test_settings_ws_paths_use_env():
    """Verify WS paths are non-empty strings (set from env/defaults)."""
    from core.config import settings

    for attr in ["ws_cloudcare_chat", "ws_cloudcare_voice", "ws_itr_chat", "ws_itr_voice"]:
        val = getattr(settings, attr)
        assert isinstance(val, str) and len(val) > 0, f"settings.{attr} is empty"
        assert "localhost" not in val, f"settings.{attr} must not hardcode localhost"


# ── 5. Action Payload — ERP-SIH backward compat ──────────────────────────────
def test_fillform_action_compat():
    """fillForm action (ERP-SIH legacy) must be accepted without error."""
    from core.dispatcher import parse_ai_response

    raw = json.dumps({
        "message": "Filling the form.",
        "message_type": "text",
        "action": "fillForm",
        "fill_data": {"pan": "ABCDE1234F", "gross_salary": "750000"},
    })
    payload = parse_ai_response(raw)
    assert payload is not None
    assert payload.action == "fillForm"
    assert payload.fill_data == {"pan": "ABCDE1234F", "gross_salary": "750000"}
