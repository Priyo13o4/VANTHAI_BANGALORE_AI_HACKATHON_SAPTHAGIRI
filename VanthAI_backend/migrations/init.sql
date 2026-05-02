-- VanthAI — Database Schema
-- init.sql — run automatically by PostgreSQL on first container boot

-- ── CloudCare Tables ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctors (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    age         INTEGER,
    gender      VARCHAR(20),
    contact     VARCHAR(50),
    specializations TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    role        VARCHAR(100),
    department  VARCHAR(100),
    contact     VARCHAR(50),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    age                 INTEGER,
    gender              VARCHAR(20),
    contact             VARCHAR(50),
    family_contact      VARCHAR(50),
    emergency           BOOLEAN DEFAULT FALSE,
    blood_type          VARCHAR(10),
    occupation          VARCHAR(255),
    address             TEXT,
    insurance_provider  VARCHAR(255),
    insurance_id        VARCHAR(100),
    ai_analysis         TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
    -- NO PII beyond what is displayed in the UI
);

CREATE TABLE IF NOT EXISTS health_records (
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL,     -- Consultation, Lab Test, Emergency, Surgery
    description TEXT,
    diagnosis   TEXT,
    treatment   TEXT,
    doctor_id   INTEGER REFERENCES doctors(id),
    hospital    VARCHAR(255),
    record_date TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_records_patient ON health_records(patient_id, record_date DESC);

CREATE TABLE IF NOT EXISTS appointments (
    id               SERIAL PRIMARY KEY,
    patient_id       INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id        INTEGER REFERENCES doctors(id),
    hospital         VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    department       VARCHAR(100),
    status           VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, completed, cancelled
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appt_patient ON appointments(patient_id, appointment_date);

CREATE TABLE IF NOT EXISTS prescriptions (
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medication  VARCHAR(255) NOT NULL,
    dosage      VARCHAR(100),
    frequency   VARCHAR(100),
    instructions TEXT,
    prescribed_by VARCHAR(255),
    start_date  DATE,
    end_date    DATE,       -- NULL means ongoing
    refills_remaining INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vitals (
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    heart_rate  INTEGER,    -- bpm
    spo2        NUMERIC(5,2),   -- %
    bp_systolic INTEGER,    -- mmHg
    bp_diastolic INTEGER,   -- mmHg
    temperature NUMERIC(4,1),   -- °C
    steps_today INTEGER,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS patient_conditions (
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    condition   VARCHAR(255) NOT NULL,
    start_date  TIMESTAMP NOT NULL,
    end_date    TIMESTAMP   -- NULL means still active
);

-- ── ITR Extension (Minimal — No PII) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS itr_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  VARCHAR(64) NOT NULL UNIQUE,
    form_type   VARCHAR(20) DEFAULT 'ITR-1',
    status      VARCHAR(20) DEFAULT 'in_progress',
    created_at  TIMESTAMP DEFAULT NOW()
    -- NO PII columns — all tax data is ephemeral, never written here
);
