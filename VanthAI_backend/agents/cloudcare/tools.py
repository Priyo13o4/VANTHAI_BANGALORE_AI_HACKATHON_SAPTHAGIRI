"""
CloudCare Agent Tools
LangChain @tool definitions for the CloudCare LangGraph agent.

⚠️ All DB queries are READ-ONLY (SELECT only).
⚠️ No PII is returned directly — only non-sensitive fields shown in existing UI.
"""
import json
from pathlib import Path

import structlog
from langchain_core.tools import tool
from sqlalchemy import select

from agents.cloudcare.prompts import load_page_markdown_from_disk
from core.config import settings
from core.db import AsyncSessionLocal
from models.cloudcare import Doctor, HealthRecord

logger = structlog.get_logger(__name__)


@tool
def load_page_markdown(url: str) -> str:
    """
    Load the KB markdown spec for a given page URL.
    Call this BEFORE composing the navigation response so your reply is grounded
    in the actual page structure (data-vanthai-id values, available filters, etc.).

    Args:
        url: The page route, e.g. '/cloudcare/patient/records'
    Returns:
        Markdown string describing the page, or 'No knowledge base entry.'
    """
    result = load_page_markdown_from_disk(url, kb_base="/app/KB")
    logger.info("tool.load_page_markdown", url=url, chars=len(result))
    return result


@tool
def navigate_to(url: str) -> str:
    """
    Navigate the user to a specific page in the CloudCare app.
    Use this when user asks to go to appointments, records, vitals, prescriptions, etc.
    
    Args:
        url: The target page URL (e.g., '/cloudcare/patient/appointments', '/cloudcare/patient/records')
    
    Returns:
        Confirmation message
    """
    valid_routes = [
        "/cloudcare/patient",
        "/cloudcare/patient/records",
        "/cloudcare/patient/appointments",
        "/cloudcare/patient/vitals",
        "/cloudcare/patient/prescriptions",
        "/cloudcare/patient/profile",
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
    logger.info("tool.navigate_to", url=url)
    return json.dumps(result)


@tool
def query_patient_summary(patient_id: int) -> str:
    """
    Query basic patient profile from the database.
    Returns name, age, blood type, emergency status, and active conditions.
    Does NOT return contact numbers or insurance IDs (PII-adjacent).

    Args:
        patient_id: Integer patient ID
    Returns:
        JSON string with patient summary.
    """
    # During Phase 4 (before full DB wiring), return static demo data
    # matched to seed.sql. Replace with real async DB query in Phase 5.
    DEMO_PATIENTS = {
        1: {
            "name": "Rajesh Kumar",
            "age": 58,
            "gender": "Male",
            "blood_type": "B+",
            "emergency": True,
            "conditions": ["Hypertension (Stage 1)", "Type 2 Diabetes Mellitus"],
            "ai_analysis": "Elevated cardiovascular risk — recommend BP monitoring and cardiology follow-up.",
        },
        35: {
            "name": "Ananya Menon",
            "age": 34,
            "gender": "Female",
            "blood_type": "O+",
            "emergency": False,
            "conditions": ["Iron Deficiency Anaemia (mild)"],
            "ai_analysis": "Vitals normal. Mild anaemia — iron supplementation and retest in 4 weeks.",
        },
    }
    patient = DEMO_PATIENTS.get(patient_id)
    if not patient:
        return json.dumps({"error": f"Patient {patient_id} not found"})
    logger.info("tool.query_patient_summary", patient_id=patient_id)
    return json.dumps(patient)


@tool
def query_upcoming_appointments(patient_id: int) -> str:
    """
    Query upcoming scheduled appointments for a patient.

    Args:
        patient_id: Integer patient ID
    Returns:
        JSON array of upcoming appointments.
    """
    DEMO_APPOINTMENTS = {
        1: [
            {"date": "2026-05-10", "time": "10:00", "doctor": "Dr. Sarah Johnson", "department": "Cardiology", "hospital": "City General Hospital"},
            {"date": "2026-05-14", "time": "14:30", "doctor": "Dr. Amit Patel",    "department": "General Medicine", "hospital": "City General Hospital"},
        ],
        35: [
            {"date": "2026-05-08", "time": "09:00", "doctor": "Dr. Amit Patel", "department": "General Medicine", "hospital": "Sunrise Clinic"},
        ],
    }
    appts = DEMO_APPOINTMENTS.get(patient_id, [])
    logger.info("tool.query_upcoming_appointments", patient_id=patient_id, count=len(appts))
    return json.dumps(appts)


@tool
def query_active_prescriptions(patient_id: int) -> str:
    """
    Query active prescriptions for a patient.

    Args:
        patient_id: Integer patient ID
    Returns:
        JSON array of active prescriptions.
    """
    DEMO_PRESCRIPTIONS = {
        1: [
            {"medication": "Amlodipine",   "dosage": "5mg",  "frequency": "Once daily",          "refills": 2},
            {"medication": "Metformin",    "dosage": "500mg","frequency": "Twice daily",          "refills": 3},
            {"medication": "Aspirin",      "dosage": "75mg", "frequency": "Once daily",           "refills": 0},
            {"medication": "Atorvastatin", "dosage": "10mg", "frequency": "Once daily at bedtime","refills": 0},
        ],
        35: [
            {"medication": "Iron Sulphate", "dosage": "65mg", "frequency": "Twice daily", "refills": 1},
        ],
    }
    scripts = DEMO_PRESCRIPTIONS.get(patient_id, [])
    logger.info("tool.query_active_prescriptions", patient_id=patient_id, count=len(scripts))
    return json.dumps(scripts)


@tool
def query_latest_vitals(patient_id: int) -> str:
    """
    Query the most recent vital signs reading for a patient.

    Args:
        patient_id: Integer patient ID
    Returns:
        JSON object with latest vitals.
    """
    DEMO_VITALS = {
        1:  {"heart_rate": 88, "spo2": 97.5, "bp": "145/90", "temperature": 37.0, "steps_today": 2340, "alerts": ["BP above normal range (>120 systolic)"]},
        35: {"heart_rate": 72, "spo2": 99.0, "bp": "118/76", "temperature": 37.1, "steps_today": 8120, "alerts": []},
    }
    vitals = DEMO_VITALS.get(patient_id, {"error": "No vitals found"})
    logger.info("tool.query_latest_vitals", patient_id=patient_id)
    return json.dumps(vitals)


@tool
async def query_health_records(patient_id: int) -> str:
    """
    Query the complete medical history (health records) for a patient.
    Returns record type, date, description, diagnosis, treatment, and doctor name.

    Args:
        patient_id: Integer patient ID
    Returns:
        JSON array of health records.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Join with doctors to get the doctor's name
            stmt = (
                select(HealthRecord, Doctor.name)
                .join(Doctor, HealthRecord.doctor_id == Doctor.id, isouter=True)
                .where(HealthRecord.patient_id == patient_id)
                .order_by(HealthRecord.record_date.desc())
            )
            result = await session.execute(stmt)
            records = []
            for row in result:
                hr: HealthRecord = row[0]
                doc_name = row[1] or "Unknown"
                records.append({
                    "id": hr.id,
                    "date": hr.record_date.strftime("%Y-%m-%d %H:%M"),
                    "type": hr.record_type,
                    "description": hr.description,
                    "diagnosis": hr.diagnosis,
                    "treatment": hr.treatment,
                    "doctor": doc_name,
                    "hospital": hr.hospital
                })
            
            logger.info("tool.query_health_records", patient_id=patient_id, count=len(records))
            return json.dumps(records)
        except Exception as exc:
            logger.error("tool.query_health_records.error", error=str(exc))
            return json.dumps({"error": f"Database query failed: {exc}"})


@tool
async def query_doctors(specialization: str | None = None) -> str:
    """
    Query the list of available doctors. Can be filtered by specialization (e.g. 'Cardiology').
    Returns doctor name, specializations, and contact info.
    """
    from sqlalchemy import select
    from models.cloudcare import Doctor

    async with AsyncSessionLocal() as session:
        try:
            stmt = select(Doctor)
            if specialization:
                stmt = stmt.where(Doctor.specializations.ilike(f"%{specialization}%"))
            
            result = await session.execute(stmt)
            doctors = result.scalars().all()

            results = []
            for d in doctors:
                results.append({
                    "id": d.id,
                    "name": d.name,
                    "specializations": d.specializations,
                    "contact": d.contact
                })

            logger.info("tool.query_doctors", count=len(results), specialization=specialization)
            return json.dumps(results)
        except Exception as exc:
            logger.error("tool.query_doctors.error", error=str(exc))
            return json.dumps({"error": str(exc)})


SPOTLIGHT_ELEMENTS: dict[str, str] = {
    # Dashboard
    "cloudcare-patient-dashboard": "Patient dashboard root",
    "cloudcare-records-latest": "Latest record card (on dashboard or records page)",
    # Records
    "cloudcare-records-root": "Medical records page root",
    "cloudcare-records-filter-type": "Record type filter dropdown",
    "cloudcare-records-sort-toggle": "Sort order toggle",
    "cloudcare-records-count": "Total records count badge",
    # Appointments
    "cloudcare-appointments-root": "Appointments page root",
    "cloudcare-appointments-book-btn": "Book Appointment button",
    "cloudcare-appointments-next": "Next upcoming appointment card",
    "cloudcare-appointments-dialog-root": "Schedule New Appointment dialog",
    "cloudcare-appointment-doctor": "Doctor selector dropdown",
    "cloudcare-appointment-hospital": "Hospital selector dropdown",
    "cloudcare-appointment-department": "Department selector dropdown",
    "cloudcare-appointment-form-date": "Appointment date picker",
    "cloudcare-appointment-form-time": "Appointment time picker",
    "cloudcare-appointment-notes": "Notes / special requests textarea",
    "cloudcare-appointments-cancel-btn": "Cancel appointment button",
    "cloudcare-appointments-confirm-btn": "Schedule/Confirm appointment button",
    # Vitals
    "cloudcare-vitals-root": "Vitals page root",
    "cloudcare-vitals-heart-rate": "Heart rate card",
    "cloudcare-vitals-spo2": "SpO2 / oxygen saturation card",
    "cloudcare-vitals-bp": "Blood pressure card",
    "cloudcare-vitals-temp": "Body temperature card",
    "cloudcare-vitals-steps": "Steps today card",
    "cloudcare-vitals-alert-badge": "Active health alert banner",
    "cloudcare-vitals-hr-chart": "Heart rate trend chart (24h)",
    # Prescriptions
    "cloudcare-prescriptions-root": "Prescriptions page root",
    "cloudcare-prescriptions-active": "Active prescriptions section",
    "cloudcare-prescriptions-primary": "Primary active medication card",
    "cloudcare-prescriptions-refills": "Refills remaining badge",
    "cloudcare-prescriptions-past": "Past prescriptions section",
    "cloudcare-prescriptions-print-btn": "Print prescription button",
}

@tool
def spotlight_element(element_id: str, title: str = "", description: str = "") -> str:
    """
    Point the user's attention to a specific UI element using the Spotlight overlay.
    This draws a glowing ring around the element with a floating popover.
    Use this when the user asks WHERE something is or when you want to draw attention
    to a specific part of the page after navigating.

    Args:
        element_id: The data-vanthai-id value of the element to spotlight.
                    Must be one of the known element IDs. Do not include brackets.
                    Valid values: cloudcare-appointments-book-btn, cloudcare-vitals-alert-badge, etc.
        title: Short title for the popover (e.g. "Book Appointment")
        description: One sentence explaining what this element does.

    Returns:
        JSON string with the spotlight action payload. Include this payload's
        'element' and 'popover' values in your response's action field.
    """
    if element_id not in SPOTLIGHT_ELEMENTS:
        return json.dumps({
            "error": f"Unknown element '{element_id}'. Valid IDs: {list(SPOTLIGHT_ELEMENTS.keys())}"
        })
    
    selector = f'[data-vanthai-id="{element_id}"]'
    result = {
        "action": "spotlight",
        "element": element_id,
        "selector": selector,
        "popover": {
            "title": title or SPOTLIGHT_ELEMENTS[element_id],
            "description": description or f"This is the {SPOTLIGHT_ELEMENTS[element_id].lower()}."
        }
    }
    logger.info("tool.spotlight_element", element_id=element_id, title=title)
    return json.dumps(result)


@tool
async def prefill_appointment_form(doctor_id: int, date: str | None = None, time: str | None = None) -> str:
    """
    Pre-fill the appointment booking form with a specific doctor and optional date/time.
    Auto-fills their specialty as department.
    
    Args:
        doctor_id: The ID of the doctor to pre-fill in the form
        date: Optional date in YYYY-MM-DD format
        time: Optional time in HH:mm format
        
    Returns:
        JSON with pre-fill action for the frontend
    """
    try:
        async with AsyncSessionLocal() as session:
            stmt = select(Doctor).where(Doctor.id == doctor_id)
            result = await session.execute(stmt)
            doctor = result.scalar_one_or_none()
            
            if not doctor:
                return json.dumps({
                    "success": False,
                    "message": f"Doctor with ID {doctor_id} not found",
                    "action": "prefill_form",
                })
            
            response = {
                "success": True,
                "message": f"Form pre-filled for Dr. {doctor.name}",
                "action": "prefill_form",
                "doctorId": str(doctor_id),
                "doctor_name": doctor.name,
                "department": doctor.specializations or "",
                "date": date,
                "time": time,
            }
            logger.info("tool.prefill_appointment_form", doctor_id=doctor_id, doctor_name=doctor.name)
            return json.dumps(response)
    except Exception as exc:
        logger.error("tool.prefill_appointment_form.error", error=str(exc))
        return json.dumps({
            "success": False,
            "message": f"Error pre-filling form: {exc}",
            "action": "prefill_form",
        })


@tool
def autofill_profile(name: str | None = None, age: int | None = None, gender: str | None = None, contact: str | None = None, address: str | None = None) -> str:
    """
    Help the user fill out their personal profile information.
    This will automatically navigate to the profile page and fill in the provided fields.
    
    Args:
        name: User's full name
        age: User's age
        gender: User's gender
        contact: User's contact number
        address: User's home address
    """
    fill_data = {}
    if name: fill_data["name"] = name
    if age: fill_data["age"] = age
    if gender: fill_data["gender"] = gender
    if contact: fill_data["contact"] = contact
    if address: fill_data["address"] = address

    result = {
        "success": True,
        "message": "Filling profile details...",
        "action": "autofill",
        "url": "/cloudcare/patient/profile",
        "fill_data": fill_data
    }
    logger.info("tool.autofill_profile", fields=list(fill_data.keys()))
    return json.dumps(result)


@tool
def add_family_contact(name: str, relationship: str, contact: str, is_emergency: bool = False) -> str:
    """
    Help the user add a new family or emergency contact.
    This will navigate to the profile page and open the 'Add Contact' dialog with pre-filled info.
    
    Args:
        name: Contact's full name
        relationship: Relationship (e.g. Spouse, Son, Daughter, Parent)
        contact: Contact's phone number
        is_emergency: Whether to set as an emergency contact
    """
    fill_data = {
        "family-name": name,
        "family-relationship": relationship,
        "family-contact": contact,
        "family-is-emergency": is_emergency
    }

    result = {
        "success": True,
        "message": f"Adding {name} as {relationship}...",
        "action": "autofill",
        "url": "/cloudcare/patient/profile",
        "fill_data": fill_data,
        "trigger": "cloudcare-family-add-btn"
    }
    logger.info("tool.add_family_contact", name=name)
    return json.dumps(result)


# All tools exported as a list for LangGraph bind_tools()
CLOUDCARE_TOOLS = [
    load_page_markdown,
    navigate_to,
    query_patient_summary,
    query_upcoming_appointments,
    query_active_prescriptions,
    query_latest_vitals,
    query_health_records,
    query_doctors,
    spotlight_element,
    prefill_appointment_form,
    autofill_profile,
    add_family_contact,
]
