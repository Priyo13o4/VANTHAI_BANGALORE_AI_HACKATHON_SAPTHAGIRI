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

from agents.cloudcare.prompts import load_page_markdown_from_disk
from core.config import settings

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


# All tools exported as a list for LangGraph bind_tools()
CLOUDCARE_TOOLS = [
    load_page_markdown,
    query_patient_summary,
    query_upcoming_appointments,
    query_active_prescriptions,
    query_latest_vitals,
]
