"""
CloudCare ORM Models — mirrors init.sql schema exactly.
Read-only usage in agent tools only.
"""
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db import Base


class Doctor(Base):
    __tablename__ = "doctors"
    id:              Mapped[int]      = mapped_column(Integer, primary_key=True)
    name:            Mapped[str]      = mapped_column(String(255), nullable=False)
    age:             Mapped[int | None] = mapped_column(Integer)
    gender:          Mapped[str | None] = mapped_column(String(20))
    contact:         Mapped[str | None] = mapped_column(String(50))
    specializations: Mapped[str | None] = mapped_column(Text)


class Patient(Base):
    __tablename__ = "patients"
    id:                 Mapped[int]       = mapped_column(Integer, primary_key=True)
    name:               Mapped[str]       = mapped_column(String(255), nullable=False)
    age:                Mapped[int | None] = mapped_column(Integer)
    gender:             Mapped[str | None] = mapped_column(String(20))
    contact:            Mapped[str | None] = mapped_column(String(50))
    family_contact:     Mapped[str | None] = mapped_column(String(50))
    emergency:          Mapped[bool]      = mapped_column(Boolean, default=False)
    blood_type:         Mapped[str | None] = mapped_column(String(10))
    occupation:         Mapped[str | None] = mapped_column(String(255))
    address:            Mapped[str | None] = mapped_column(Text)
    insurance_provider: Mapped[str | None] = mapped_column(String(255))
    insurance_id:       Mapped[str | None] = mapped_column(String(100))
    ai_analysis:        Mapped[str | None] = mapped_column(Text)


class HealthRecord(Base):
    __tablename__ = "health_records"
    id:          Mapped[int]       = mapped_column(Integer, primary_key=True)
    patient_id:  Mapped[int]       = mapped_column(ForeignKey("patients.id"))
    record_type: Mapped[str]       = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text)
    diagnosis:   Mapped[str | None] = mapped_column(Text)
    treatment:   Mapped[str | None] = mapped_column(Text)
    doctor_id:   Mapped[int | None] = mapped_column(ForeignKey("doctors.id"))
    hospital:    Mapped[str | None] = mapped_column(String(255))
    record_date: Mapped[datetime]  = mapped_column(DateTime)


class Appointment(Base):
    __tablename__ = "appointments"
    id:               Mapped[int]       = mapped_column(Integer, primary_key=True)
    patient_id:       Mapped[int]       = mapped_column(ForeignKey("patients.id"))
    doctor_id:        Mapped[int | None] = mapped_column(ForeignKey("doctors.id"))
    hospital:         Mapped[str | None] = mapped_column(String(255))
    appointment_date: Mapped[date]      = mapped_column(Date)
    appointment_time: Mapped[datetime]  = mapped_column(Time)
    department:       Mapped[str | None] = mapped_column(String(100))
    status:           Mapped[str]       = mapped_column(String(20), default="scheduled")
    notes:            Mapped[str | None] = mapped_column(Text)


class Prescription(Base):
    __tablename__ = "prescriptions"
    id:                Mapped[int]       = mapped_column(Integer, primary_key=True)
    patient_id:        Mapped[int]       = mapped_column(ForeignKey("patients.id"))
    medication:        Mapped[str]       = mapped_column(String(255))
    dosage:            Mapped[str | None] = mapped_column(String(100))
    frequency:         Mapped[str | None] = mapped_column(String(100))
    instructions:      Mapped[str | None] = mapped_column(Text)
    prescribed_by:     Mapped[str | None] = mapped_column(String(255))
    start_date:        Mapped[date | None] = mapped_column(Date)
    end_date:          Mapped[date | None] = mapped_column(Date)
    refills_remaining: Mapped[int]       = mapped_column(Integer, default=0)


class Vitals(Base):
    __tablename__ = "vitals"
    id:           Mapped[int]         = mapped_column(Integer, primary_key=True)
    patient_id:   Mapped[int]         = mapped_column(ForeignKey("patients.id"))
    heart_rate:   Mapped[int | None]  = mapped_column(Integer)
    spo2:         Mapped[float | None] = mapped_column(Numeric(5, 2))
    bp_systolic:  Mapped[int | None]  = mapped_column(Integer)
    bp_diastolic: Mapped[int | None]  = mapped_column(Integer)
    temperature:  Mapped[float | None] = mapped_column(Numeric(4, 1))
    steps_today:  Mapped[int | None]  = mapped_column(Integer)
    recorded_at:  Mapped[datetime]    = mapped_column(DateTime)
