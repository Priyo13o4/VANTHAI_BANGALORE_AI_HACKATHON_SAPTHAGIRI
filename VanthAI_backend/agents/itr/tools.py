"""
ITR Agent Tools
"""
import json

import structlog
from langchain_core.tools import tool

from agents.itr.prompts import load_page_markdown_from_disk

logger = structlog.get_logger(__name__)


@tool
def load_page_markdown(url: str) -> str:
    """
    Load the KB markdown spec for a given ITR page URL.

    Args:
        url: The ITR page route, e.g. '/itr/personal'
    Returns:
        Markdown string describing the page structure.
    """
    result = load_page_markdown_from_disk(url, kb_base="/app/KB")
    logger.info("itr_tool.load_page_markdown", url=url, chars=len(result))
    return result


@tool
def itr1_tax_calculator(
    gross_salary: float,
    hra_received: float = 0,
    deduction_80c: float = 0,
    deduction_80d: float = 0,
    tds_by_employer: float = 0,
) -> str:
    """
    Calculate estimated ITR-1 tax liability under the old regime.
    Standard deduction of ₹50,000 is applied automatically.
    Returns taxable income, tax before cess, 4% health & education cess, total tax, and net refund/liability.

    Args:
        gross_salary: Total gross salary (CTC before deductions)
        hra_received: HRA received from employer
        deduction_80c: 80C investments (max ₹1,50,000)
        deduction_80d: 80D health insurance premium (max ₹25,000)
        tds_by_employer: TDS already deducted by employer (from Form 16)
    """
    STANDARD_DEDUCTION = 50_000
    MAX_80C = 1_50_000
    MAX_80D = 25_000

    ded_80c = min(deduction_80c, MAX_80C)
    ded_80d = min(deduction_80d, MAX_80D)
    taxable = gross_salary - STANDARD_DEDUCTION - ded_80c - ded_80d
    taxable = max(0, taxable)

    # Old tax regime slabs (FY 2025-26)
    tax = 0.0
    if taxable > 10_00_000:
        tax += (taxable - 10_00_000) * 0.30
        taxable_for_slab = 10_00_000
    else:
        taxable_for_slab = taxable

    if taxable_for_slab > 5_00_000:
        tax += (taxable_for_slab - 5_00_000) * 0.20
        taxable_for_slab = 5_00_000

    if taxable_for_slab > 2_50_000:
        tax += (taxable_for_slab - 2_50_000) * 0.05

    cess = tax * 0.04
    total_tax = tax + cess
    net = total_tax - tds_by_employer

    result = {
        "taxable_income": round(taxable, 2),
        "tax_before_cess": round(tax, 2),
        "health_edu_cess_4pct": round(cess, 2),
        "total_tax": round(total_tax, 2),
        "tds_already_paid": tds_by_employer,
        "net_refund_or_liability": round(net, 2),
        "status": "REFUND" if net < 0 else "LIABILITY",
        "note": "Calculation is indicative only. Please verify with a CA before filing.",
    }
    logger.info("itr_tool.tax_calculator", taxable_income=result["taxable_income"])
    return json.dumps(result)


@tool
def itr1_form_schema(section: str) -> str:
    """
    Return the field schema for a given ITR-1 section to understand what to autofill.

    Args:
        section: One of 'personal', 'salary', 'deductions', 'tax_paid'
    Returns:
        JSON describing field IDs, types, and constraints.
    """
    SCHEMAS = {
        "personal": {
            "fields": [
                {"id": "itr-personal-pan",  "type": "text",   "label": "PAN Number", "pattern": "[A-Z]{5}[0-9]{4}[A-Z]", "required": True},
                {"id": "itr-personal-name", "type": "text",   "label": "Full Name",  "required": True},
                {"id": "itr-personal-dob",  "type": "date",   "label": "Date of Birth", "required": True},
            ]
        },
        "salary": {
            "fields": [
                {"id": "itr-salary-gross",              "type": "number", "label": "Gross Salary (₹)", "required": True},
                {"id": "itr-salary-hra",                "type": "number", "label": "HRA Received (₹)"},
                {"id": "itr-salary-standard-deduction", "type": "number", "label": "Standard Deduction", "readonly": True, "value": 50000},
            ]
        },
        "deductions": {
            "fields": [
                {"id": "itr-deductions-80c",         "type": "number", "label": "80C Investments",      "max": 150000},
                {"id": "itr-deductions-80d",         "type": "number", "label": "80D Health Insurance", "max": 25000},
                {"id": "itr-deductions-form16a-field","type": "text",   "label": "Form 16A Reference"},
            ]
        },
        "tax_paid": {
            "fields": [
                {"id": "itr-taxpaid-tds-employer", "type": "number", "label": "TDS by Employer (₹)", "required": True},
                {"id": "itr-taxpaid-submit-btn",   "type": "button", "label": "Submit ITR"},
            ]
        },
    }
    schema = SCHEMAS.get(section, {"error": f"Unknown section: {section}"})
    return json.dumps(schema)


ITR_TOOLS = [load_page_markdown, itr1_tax_calculator, itr1_form_schema]
