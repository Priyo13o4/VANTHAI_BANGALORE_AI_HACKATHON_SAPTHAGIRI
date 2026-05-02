-- VanthAI — Seed Data
-- seed.sql — hand-authored, realistic. No mock generation in application code.
-- No PII beyond what appears in the CloudCare UI.

-- ── Doctors ──────────────────────────────────────────────────────────────────
INSERT INTO doctors (id, name, age, gender, contact, specializations) VALUES
  (1, 'Dr. Sarah Johnson', 45, 'Female', '+91-9876543210', 'Cardiology, Internal Medicine'),
  (2, 'Dr. Amit Patel',    38, 'Male',   '+91-9876543211', 'General Medicine'),
  (3, 'Dr. Priya Sharma',  42, 'Female', '+91-9876543212', 'Orthopedics'),
  (4, 'Dr. Rajesh Kumar',  50, 'Male',   '+91-9876543213', 'Neurology')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));

-- ── Patients ─────────────────────────────────────────────────────────────────
INSERT INTO patients (
  id, name, age, gender, contact, family_contact, emergency,
  blood_type, occupation, address, insurance_provider, insurance_id, ai_analysis
) VALUES
  (
    1,
    'Rajesh Kumar', 58, 'Male', '+91-9876543210', '+91-9876543211', TRUE,
    'B+', 'Retired Electrical Engineer',
    '34 Lakeview Society, Sector 42, New Delhi',
    'HealthShield Advantage', 'HS-IND-2398842',
    'AI detected elevated cardiovascular risk driven by hypertension history and recent heart-rate variability trends. Recommend recording BP twice daily, staying hydrated, and scheduling a cardiology follow-up this week.'
  ),
  (
    35,
    'Ananya Menon', 34, 'Female', '+91-9845012345', '+91-9845012346', FALSE,
    'O+', 'Software Engineer',
    '12 Indiranagar, Bengaluru',
    'Star Health Premier', 'SH-KA-4481221',
    'Vitals within normal range. Mild anaemia risk detected from last haemoglobin reading — suggest dietary iron supplementation and re-test in 4 weeks.'
  )
ON CONFLICT (id) DO NOTHING;

SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- ── Conditions ───────────────────────────────────────────────────────────────
INSERT INTO patient_conditions (id, patient_id, condition, start_date, end_date) VALUES
  (1, 1, 'Hypertension (Stage 1)',         '2022-03-12', NULL),
  (2, 1, 'Type 2 Diabetes Mellitus',       '2021-07-01', NULL),
  (3, 1, 'Generalized Anxiety Disorder',   '2024-01-15', '2024-09-01'),
  (4, 35,'Iron Deficiency Anaemia (mild)', '2025-08-01', NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('patient_conditions_id_seq', (SELECT MAX(id) FROM patient_conditions));

-- ── Health Records ────────────────────────────────────────────────────────────
INSERT INTO health_records (id, patient_id, record_type, description, diagnosis, treatment, doctor_id, hospital, record_date) VALUES
  (101, 1, 'Consultation', 'Regular cardiac checkup — BP 145/95',
   'Stage 1 Hypertension',
   'Amlodipine 5mg once daily, salt reduction',
   1, 'City General Hospital', '2025-10-15 10:00'),
  (102, 1, 'Lab Test', 'CBC and Lipid Profile screening',
   'Cholesterol (LDL: 145 mg/dL), elevated total cholesterol',
   'Dietary changes (low fat), initiated statin therapy',
   2, 'City General Hospital', '2025-10-10 14:30'),
  (103, 1, 'ECG', 'Electrocardiogram for heart rhythm check',
   'Normal sinus rhythm, no abnormalities detected',
   'Continue current monitoring',
   1, 'City General Hospital', '2025-10-08 11:00'),
  (104, 1, 'X-Ray', 'Routine Chest X-ray (PA View)',
   'Clear lung fields, normal cardiac silhouette',
   'No immediate clinical action required',
   2, 'Metro Medical Center', '2025-09-28 09:00'),
  (105, 1, 'Consultation', 'Diabetes follow-up — HbA1c screening',
   'Type 2 Diabetes Mellitus (HbA1c: 7.2%)',
   'Adjusted Metformin to 500mg twice daily',
   2, 'City General Hospital', '2025-09-20 15:00'),
  (106, 1, 'Emergency', 'Chest discomfort and shortness of breath',
   'Acute anxiety attack, ruled out myocardial infarction',
   'Short-term anxiolytic, observation for 4 hours',
   3, 'Metro Medical Center', '2025-09-05 22:30'),
  (201, 35, 'Consultation', 'Routine annual check-up',
   'Mild anaemia, otherwise healthy',
   'Iron 65mg twice daily, ferritin retest in 4 weeks',
   2, 'Sunrise Clinic', '2025-10-20 11:00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('health_records_id_seq', (SELECT MAX(id) FROM health_records));

-- ── Appointments ──────────────────────────────────────────────────────────────
INSERT INTO appointments (id, patient_id, doctor_id, hospital, appointment_date, appointment_time, department, status, notes) VALUES
  (1, 1, 1, 'City General Hospital', '2026-05-10', '10:00', 'Cardiology',     'scheduled', 'Regular BP checkup'),
  (2, 1, 2, 'City General Hospital', '2026-05-14', '14:30', 'General Medicine','scheduled', 'Follow-up consultation'),
  (3, 1, 1, 'City General Hospital', '2025-10-15', '11:00', 'Cardiology',     'completed', 'ECG test completed'),
  (4, 1, 3, 'Metro Medical Center',  '2025-10-12', '09:30', 'Orthopedics',    'cancelled', 'Patient rescheduled'),
  (5, 35, 2,'Sunrise Clinic',        '2026-05-08', '09:00', 'General Medicine','scheduled', 'Anaemia follow-up')
ON CONFLICT (id) DO NOTHING;

SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));

-- ── Prescriptions ─────────────────────────────────────────────────────────────
INSERT INTO prescriptions (id, patient_id, medication, dosage, frequency, instructions, prescribed_by, start_date, end_date, refills_remaining) VALUES
  (1, 1, 'Amlodipine',   '5mg',  'Once daily',          'Take in the morning with food', 'Dr. Sarah Johnson', '2025-10-01', '2025-11-01', 2),
  (2, 1, 'Metformin',    '500mg','Twice daily',          'Take with meals',               'Dr. Sarah Johnson', '2025-09-15', '2025-12-15', 3),
  (3, 1, 'Aspirin',      '75mg', 'Once daily',           'Take after breakfast',          'Dr. Sarah Johnson', '2025-10-10', NULL,         0),
  (4, 1, 'Atorvastatin', '10mg', 'Once daily at bedtime','Take before sleep',             'Dr. Sarah Johnson', '2025-09-20', NULL,         0),
  (5, 35,'Iron Sulphate','65mg', 'Twice daily',          'Take 1 hr before meals',        'Dr. Amit Patel',    '2025-10-20', '2025-12-20', 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('prescriptions_id_seq', (SELECT MAX(id) FROM prescriptions));

-- ── Vitals (latest reading per patient) ──────────────────────────────────────
INSERT INTO vitals (patient_id, heart_rate, spo2, bp_systolic, bp_diastolic, temperature, steps_today, recorded_at) VALUES
  (1,  88, 97.5, 145, 90, 37.0, 2340, NOW() - INTERVAL '2 minutes'),
  (1,  85, 98.0, 142, 88, 36.9, 2340, NOW() - INTERVAL '32 minutes'),
  (35, 72, 99.0, 118, 76, 37.1, 8120, NOW() - INTERVAL '1 minute');
