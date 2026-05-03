"""
ITR Agent Tools
"""
import json

import structlog
from langchain_core.tools import tool

from agents.itr.prompts import load_page_markdown_from_disk

logger = structlog.get_logger(__name__)


def _clean_fill_data(fill_data: dict) -> dict:
    cleaned: dict = {}
    for key, value in fill_data.items():
        if value is None:
            continue
        if isinstance(value, str) and not value.strip():
            continue
        cleaned[key] = value
    return cleaned


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
def navigate_to(url: str) -> str:
    """
    Navigate the user to a specific page in the ITR app.
    Use this when user asks to go to salary, deductions, attachments, etc.
    
    Args:
        url: The target page URL (e.g., '/itr/salary', '/itr/deductions')
    
    Returns:
        Confirmation message
    """
    valid_routes = [
        "/itr",
        "/itr/personal",
        "/itr/salary",
        "/itr/deductions",
        "/itr/attachments",
        "/itr/file-return",
        "/itr/overview",
    ]
    
    if url not in valid_routes:
        return json.dumps({
            "success": False,
            "message": f"Invalid page URL: {url}",
            "action": "none"
        })
    
    # Return action envelope for frontend to handle
    result = {
        "success": True,
        "message": f"Navigating to {url}",
        "action": "navigate",
        "url": url
    }
    logger.info("itr_tool.navigate_to", url=url)
    return json.dumps(result)


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
def highlight_element(element_id: str, popover_text: str = "") -> str:
    """
    Highlight/spotlight a Form 18 element using Driver.js blur + spotlight.
    The agent uses this to guide the user through the form.

    Args:
        element_id: The data-vanthai-id of the element to highlight (e.g., 'assessee-details-root')
        popover_text: Optional text to show in the popover above the spotlight

    Returns:
        Action envelope for frontend to process
    """
    result = {
        "success": True,
        "action": "highlight",
        "element": element_id,
        "popover": {
            "title": "Fill this section",
            "description": popover_text or "Please fill the highlighted section"
        }
    }
    logger.info("itr_tool.highlight_element", element_id=element_id)
    return json.dumps(result)


@tool
def fill_form_18_assessee() -> str:
    """
    Auto-fill Form 18 Assessee Details section with sample data.
    This tool tells the frontend to populate the assessee details form.

    Returns:
        Action envelope with fill data and success message
    """
    fill_data = {
        "name": "John Doe",
        "address": "123 Business Street, Suite 100",
        "pan": "HVGPM1142B",
        "status": "Individual",
        "email": "john.doe@example.com",
        "contact": "9999999999",
        "residentialStatus": "Resident"
    }
    result = {
        "success": True,
        "action": "autofill",
        "section": "assessee-details",
        "url": "/itr/assessee-details",
        "fill_data": fill_data,
        "message": "Filling assessee details..."
    }
    logger.info("itr_tool.fill_form_18_assessee")
    return json.dumps(result)


@tool
def fill_form_18_assessee_custom(
    name: str = "",
    address: str = "",
    pan: str = "",
    status: str = "",
    email: str = "",
    contact: str = "",
    residentialStatus: str = "",
) -> str:
    """
    Auto-fill Form 18 Assessee Details section with user-provided data.

    Returns:
        Action envelope with fill data and success message
    """
    fill_data = _clean_fill_data({
        "name": name,
        "address": address,
        "pan": pan,
        "status": status,
        "email": email,
        "contact": contact,
        "residentialStatus": residentialStatus,
    })

    if not fill_data:
        return json.dumps({
            "success": False,
            "action": "none",
            "section": "assessee-details",
            "message": "No assessee fields were provided to autofill."
        })
    result = {
        "success": True,
        "action": "autofill",
        "section": "assessee-details",
        "url": "/itr/assessee-details",
        "fill_data": fill_data,
        "message": "Filling assessee details from your provided information...",
    }
    logger.info("itr_tool.fill_form_18_assessee_custom")
    return json.dumps(result)


@tool
def fill_form_18_business() -> str:
    """
    Auto-fill Form 18 Business Details section with sample data.
    This tool tells the frontend to populate the business details form.

    Returns:
        Action envelope with fill data and success message
    """
    fill_data = {
        "businessName": "Acme Housing Development LLP",
        "flat": "Plot 123-A",
        "road": "MG Road",
        "pin": "560064",
        "postOffice": "Yelahanka S.O",
        "area": "Yelahanka",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "projectName": "Acme Residency Phase 1",
        "projFlat": "Plot 123",
        "projRoad": "MG Road",
        "projPin": "560064"
    }
    result = {
        "success": True,
        "action": "autofill",
        "section": "business-details",
        "url": "/itr/business-details",
        "fill_data": fill_data,
        "message": "Filling business details..."
    }
    logger.info("itr_tool.fill_form_18_business")
    return json.dumps(result)


@tool
def fill_form_18_business_custom(
    businessName: str = "",
    flat: str = "",
    road: str = "",
    pin: str = "",
    postOffice: str = "",
    area: str = "",
    district: str = "",
    state: str = "",
    projectName: str = "",
    projFlat: str = "",
    projRoad: str = "",
    projPin: str = "",
) -> str:
    """
    Auto-fill Form 18 Business Details section with user-provided data.

    Returns:
        Action envelope with fill data and success message
    """
    fill_data = _clean_fill_data({
        "businessName": businessName,
        "flat": flat,
        "road": road,
        "pin": pin,
        "postOffice": postOffice,
        "area": area,
        "district": district,
        "state": state,
        "projectName": projectName,
        "projFlat": projFlat,
        "projRoad": projRoad,
        "projPin": projPin,
    })

    if not fill_data:
        return json.dumps({
            "success": False,
            "action": "none",
            "section": "business-details",
            "message": "No business fields were provided to autofill."
        })
    result = {
        "success": True,
        "action": "autofill",
        "section": "business-details",
        "url": "/itr/business-details",
        "fill_data": fill_data,
        "message": "Filling business details from your provided information...",
    }
    logger.info("itr_tool.fill_form_18_business_custom")
    return json.dumps(result)


@tool
def fill_form_18_project() -> str:
    """
    Auto-fill Form 18 Project Details section with sample data.
    This tool tells the frontend to populate the project details form.

    Returns:
        Action envelope with fill data and success message
    """
    fill_data = {
        "flat": "Plot 123",
        "road": "MG Road",
        "pin": "560064",
        "postOffice": "Yelahanka S.O",
        "area": "Yelahanka",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "totalUnits": "15"
    }
    result = {
        "success": True,
        "action": "autofill",
        "section": "project-details",
        "url": "/itr/project-details",
        "fill_data": fill_data,
        "message": "Filling project details..."
    }
    logger.info("itr_tool.fill_form_18_project")
    return json.dumps(result)


@tool
def fill_form_18_project_custom(
    flat: str = "",
    road: str = "",
    pin: str = "",
    postOffice: str = "",
    area: str = "",
    district: str = "",
    state: str = "",
    totalUnits: str = "",
) -> str:
    """
    Auto-fill Form 18 Project Details section with user-provided data.

    Returns:
        Action envelope with fill data and success message
    """
    fill_data = _clean_fill_data({
        "flat": flat,
        "road": road,
        "pin": pin,
        "postOffice": postOffice,
        "area": area,
        "district": district,
        "state": state,
        "totalUnits": totalUnits,
    })

    if not fill_data:
        return json.dumps({
            "success": False,
            "action": "none",
            "section": "project-details",
            "message": "No project fields were provided to autofill."
        })
    result = {
        "success": True,
        "action": "autofill",
        "section": "project-details",
        "url": "/itr/project-details",
        "fill_data": fill_data,
        "message": "Filling project details from your provided information...",
    }
    logger.info("itr_tool.fill_form_18_project_custom")
    return json.dumps(result)


@tool
def form18_fill_sequence() -> str:
    """
    Start the Form 18 guided fill sequence.
    This tool initiates the step-by-step guided filling of Form 18.
    The agent should follow with highlight and fill calls for each section.

    Returns:
        Action envelope indicating start of sequence
    """
    result = {
        "success": True,
        "action": "navigate",
        "url": "/itr/file-form-18",
        "message": "Starting Form 18 filing sequence. I'll guide you through each section."
    }
    logger.info("itr_tool.form18_fill_sequence")
    return json.dumps(result)


@tool
def fill_form_18_tax_year(taxYear: str) -> str:
    """
    Auto-fill Form 18 landing page Tax Year field.

    Args:
        taxYear: Tax year value, e.g. '2027-28'
    """
    fill_data = _clean_fill_data({"taxYear": taxYear})
    if not fill_data:
        return json.dumps({
            "success": False,
            "action": "none",
            "section": "file-form-18",
            "message": "No tax year provided."
        })

    result = {
        "success": True,
        "action": "autofill",
        "section": "file-form-18",
        "url": "/itr/file-form-18",
        "fill_data": fill_data,
        "message": "Setting Form 18 tax year...",
    }
    logger.info("itr_tool.fill_form_18_tax_year")
    return json.dumps(result)


@tool
def highlight_form18_field(field_name: str, popover_text: str = "") -> str:
    """
    Highlight a specific Form 18 field by name for precise guidance.

    Args:
        field_name: HTML name attribute of the field (e.g., 'businessName', 'pin', 'projRoad')
        popover_text: Optional popover text

    Returns:
        Action envelope with CSS selector target for the frontend spotlight engine
    """
    selector = f"[name=\"{field_name}\"]"
    result = {
        "success": True,
        "action": "highlight",
        "selector": selector,
        "element": field_name,
        "popover": {
            "title": "Fill this field",
            "description": popover_text or f"Please fill: {field_name}",
        },
    }
    logger.info("itr_tool.highlight_form18_field", field_name=field_name)
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


@tool
def fill_form_18_conditions_custom(
    c12a: str = "",
    c12b: str = "",
    c12c: str = "",
    c12d: str = "",
    c12e: str = "",
    c12f: str = "",
    c12g: str = "",
) -> str:
    """
    Auto-fill Form 18 Section 12 (Conditions Fulfillment) with user-provided Yes/No values.
    """
    fill_data = _clean_fill_data({
        "c12a": c12a,
        "c12b": c12b,
        "c12c": c12c,
        "c12d": c12d,
        "c12e": c12e,
        "c12f": c12f,
        "c12g": c12g,
    })
    
    if not fill_data:
        return json.dumps({"success": False, "message": "No condition fields provided."})

    result = {
        "success": True,
        "action": "autofill",
        "section": "conditions-fulfillment",
        "url": "/itr/conditions-fulfillment",
        "fill_data": fill_data,
        "message": "Filling statutory conditions..."
    }
    logger.info("itr_tool.fill_form_18_conditions_custom")
    return json.dumps(result)


@tool
def fill_form_18_other_custom(
    investment: str = "",
    expectedDate: str = "",
    actualDate: str = "",
    hasAdjacentLand: str = "",
    isSeparateArea: str = "",
    projectStatus: str = "",
    landTitle: str = "",
    hasAgreement: str = "",
) -> str:
    """
    Auto-fill Form 18 Sections 13-19 (Other Details) with user-provided data.
    """
    fill_data = _clean_fill_data({
        "investment": investment,
        "expectedDate": expectedDate,
        "actualDate": actualDate,
        "hasAdjacentLand": hasAdjacentLand,
        "isSeparateArea": isSeparateArea,
        "projectStatus": projectStatus,
        "landTitle": landTitle,
        "hasAgreement": hasAgreement,
    })
    
    if not fill_data:
        return json.dumps({"success": False, "message": "No other detail fields provided."})

    result = {
        "success": True,
        "action": "autofill",
        "section": "other-details",
        "url": "/itr/other-details",
        "fill_data": fill_data,
        "message": "Filling other project details..."
    }
    logger.info("itr_tool.fill_form_18_other_custom")
    return json.dumps(result)


ITR_TOOLS = [
    load_page_markdown,
    navigate_to,
    itr1_tax_calculator,
    itr1_form_schema,
    highlight_element,
    highlight_form18_field,
    fill_form_18_tax_year,
    fill_form_18_assessee,
    fill_form_18_assessee_custom,
    fill_form_18_business,
    fill_form_18_business_custom,
    fill_form_18_project,
    fill_form_18_project_custom,
    fill_form_18_conditions_custom,
    fill_form_18_other_custom,
    form18_fill_sequence
]
