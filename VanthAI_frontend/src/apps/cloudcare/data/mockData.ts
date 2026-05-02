/**
 * CloudCare Mock Data
 * Ported from frontend/lib/mockData.ts
 * These types + data are used for UI rendering until the backend WS agent
 * is wired to serve real DB data via the chat protocol.
 */

export interface Doctor { id: number; name: string; age: number; gender: string; contact: string; specializations: string; }
export interface Hospital { id: number; name: string; }
export interface PatientCondition { id: number; patientId: number; condition: string; startDate: string; endDate: string | null; }
export interface MedicalRecord { id: number; patientId: number; recordType: string; description: string; diagnosis: string; treatment: string; doctorId: number; hospitalId?: number; hospital?: string; date: string; }
export interface Prescription { id: number; patientId: number; medication: string; dosage: string; startDate: string; endDate: string | null; frequency?: string; instructions?: string; prescribedBy?: string; refillsRemaining?: number; }
export interface AppointmentWithDetails { id: number; patientId: number; doctorId: number; hospitalId: number; appointmentDate: string; appointmentTime: string; department: string; status: 'scheduled' | 'completed' | 'cancelled'; notes?: string; doctor?: Doctor; hospital?: Hospital; }
export interface FamilyContact { id: number; patientId: number; name: string; relationship: string; contact: string; isPrimary: boolean; isEmergencyContact: boolean; }
export type PatientSnapshot = {
  id: number; name: string; age: number; gender: string; contact: string; familyContact: string;
  emergency: boolean; aiAnalysis?: string; address: string; occupation: string;
  bloodType: string; insuranceProvider: string; insuranceId: string;
  conditions: PatientCondition[]; records: MedicalRecord[];
};

export const FALLBACK_PATIENT_ID = 35;

export const MOCK_HOSPITALS: Hospital[] = [
  { id: 1, name: 'City General Hospital' },
  { id: 2, name: 'Metro Medical Center' },
  { id: 3, name: 'Sunrise Clinic' },
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Johnson', age: 45, gender: 'Female', contact: '+91-9876543210', specializations: 'Cardiology, Internal Medicine' },
  { id: 2, name: 'Dr. Amit Patel',    age: 38, gender: 'Male',   contact: '+91-9876543211', specializations: 'General Medicine' },
  { id: 3, name: 'Dr. Priya Sharma',  age: 42, gender: 'Female', contact: '+91-9876543212', specializations: 'Orthopedics' },
  { id: 4, name: 'Dr. Rajesh Kumar',  age: 50, gender: 'Male',   contact: '+91-9876543213', specializations: 'Neurology' },
];

const PATIENT_SNAPSHOTS: Record<number, PatientSnapshot> = {
  1: {
    id: 1, name: 'Rajesh Kumar', age: 58, gender: 'Male', contact: '+91-9876543210',
    familyContact: '+91-9876543211', emergency: true,
    aiAnalysis: 'AI detected elevated cardiovascular risk driven by hypertension history and recent heart-rate variability trends. Recommend recording BP twice daily, staying hydrated, and scheduling a cardiology follow-up this week.',
    address: '34 Lakeview Society, Sector 42, New Delhi', occupation: 'Retired Electrical Engineer',
    bloodType: 'B+', insuranceProvider: 'HealthShield Advantage', insuranceId: 'HS-IND-2398842',
    conditions: [
      { id: 1, patientId: 1, condition: 'Hypertension (Stage 1)',       startDate: '2022-03-12T00:00:00Z', endDate: null },
      { id: 2, patientId: 1, condition: 'Type 2 Diabetes Mellitus',     startDate: '2021-07-01T00:00:00Z', endDate: null },
      { id: 3, patientId: 1, condition: 'Generalized Anxiety Disorder', startDate: '2024-01-15T00:00:00Z', endDate: '2024-09-01T00:00:00Z' },
    ],
    records: [
      { id: 101, patientId: 1, recordType: 'Consultation', description: 'Cardiology review — systolic BP averaged 145 mmHg', diagnosis: 'Hypertension not fully controlled', treatment: 'Continue Amlodipine 5mg daily', doctorId: 1, date: '2025-10-15T10:00:00Z' },
      { id: 102, patientId: 1, recordType: 'Lab Test', description: 'Complete lipid profile and HbA1c screening', diagnosis: 'LDL 145 mg/dL — HbA1c 7.2%', treatment: 'Start Atorvastatin 10mg nightly', doctorId: 2, date: '2025-10-10T08:30:00Z' },
      { id: 103, patientId: 1, recordType: 'Emergency', description: 'Emergency visit for chest discomfort and dizziness', diagnosis: 'Ruled out MI; anxiety episode', treatment: 'Short-term anxiolytic', doctorId: 3, date: '2025-09-05T22:30:00Z' },
    ],
  },
  35: {
    id: 35, name: 'Ananya Menon', age: 34, gender: 'Female', contact: '+91-9845012345',
    familyContact: '+91-9845012346', emergency: false,
    aiAnalysis: 'Vitals within normal range. Mild anaemia risk — suggest dietary iron supplementation and re-test in 4 weeks.',
    address: '12 Indiranagar, Bengaluru', occupation: 'Software Engineer',
    bloodType: 'O+', insuranceProvider: 'Star Health Premier', insuranceId: 'SH-KA-4481221',
    conditions: [
      { id: 4, patientId: 35, condition: 'Iron Deficiency Anaemia (mild)', startDate: '2025-08-01T00:00:00Z', endDate: null },
    ],
    records: [
      { id: 201, patientId: 35, recordType: 'Consultation', description: 'Routine annual check-up', diagnosis: 'Mild anaemia, otherwise healthy', treatment: 'Iron 65mg twice daily', doctorId: 2, date: '2025-10-20T11:00:00Z' },
    ],
  },
};

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 1, patientId: 1, medication: 'Amlodipine',   dosage: '5mg',  startDate: '2025-10-01', endDate: '2025-11-01', frequency: 'Once daily',          instructions: 'Take in the morning with food', prescribedBy: 'Dr. Sarah Johnson', refillsRemaining: 2 },
  { id: 2, patientId: 1, medication: 'Metformin',    dosage: '500mg',startDate: '2025-09-15', endDate: '2025-12-15', frequency: 'Twice daily',          instructions: 'Take with meals',               prescribedBy: 'Dr. Sarah Johnson', refillsRemaining: 3 },
  { id: 3, patientId: 1, medication: 'Aspirin',      dosage: '75mg', startDate: '2025-10-10', endDate: null,         frequency: 'Once daily',           instructions: 'Take after breakfast',           prescribedBy: 'Dr. Sarah Johnson' },
  { id: 4, patientId: 1, medication: 'Atorvastatin', dosage: '10mg', startDate: '2025-09-20', endDate: null,         frequency: 'Once daily at bedtime', instructions: 'Take before sleep',             prescribedBy: 'Dr. Sarah Johnson' },
  { id: 5, patientId: 35,medication: 'Iron Sulphate','dosage': '65mg',startDate: '2025-10-20', endDate: '2025-12-20', frequency: 'Twice daily',         instructions: 'Take 1hr before meals',          prescribedBy: 'Dr. Amit Patel',   refillsRemaining: 1 },
];

export const MOCK_APPOINTMENTS: AppointmentWithDetails[] = [
  { id: 1, patientId: 1, doctorId: 1, hospitalId: 1, appointmentDate: '2026-05-10', appointmentTime: '10:00', department: 'Cardiology',      status: 'scheduled', notes: 'Regular BP checkup',      doctor: MOCK_DOCTORS[0], hospital: MOCK_HOSPITALS[0] },
  { id: 2, patientId: 1, doctorId: 2, hospitalId: 1, appointmentDate: '2026-05-14', appointmentTime: '14:30', department: 'General Medicine', status: 'scheduled', notes: 'Follow-up consultation',  doctor: MOCK_DOCTORS[1], hospital: MOCK_HOSPITALS[0] },
  { id: 3, patientId: 1, doctorId: 1, hospitalId: 1, appointmentDate: '2025-10-15', appointmentTime: '11:00', department: 'Cardiology',      status: 'completed', notes: 'ECG test completed',      doctor: MOCK_DOCTORS[0], hospital: MOCK_HOSPITALS[0] },
  { id: 4, patientId: 1, doctorId: 3, hospitalId: 2, appointmentDate: '2025-10-12', appointmentTime: '09:30', department: 'Orthopedics',     status: 'cancelled', notes: 'Patient rescheduled',     doctor: MOCK_DOCTORS[2], hospital: MOCK_HOSPITALS[1] },
  { id: 5, patientId: 35,doctorId: 2, hospitalId: 3, appointmentDate: '2026-05-08', appointmentTime: '09:00', department: 'General Medicine', status: 'scheduled', notes: 'Anaemia follow-up',       doctor: MOCK_DOCTORS[1], hospital: MOCK_HOSPITALS[2] },
];

export const getPatientById = (id: number): PatientSnapshot | undefined => PATIENT_SNAPSHOTS[id];
export const getPatientPrescriptions = (pid: number): Prescription[] => MOCK_PRESCRIPTIONS.filter(p => p.patientId === pid);
export const getAppointmentsForPatient = (pid: number): AppointmentWithDetails[] => MOCK_APPOINTMENTS.filter(a => a.patientId === pid);

export const getDoctorById = (id: number): Doctor | undefined => MOCK_DOCTORS.find(d => d.id === id);
export const getHospitalById = (id: number): Hospital | undefined => MOCK_HOSPITALS.find(h => h.id === id);
export const MOCK_PRESCRIPTION_DETAILS = MOCK_PRESCRIPTIONS;
