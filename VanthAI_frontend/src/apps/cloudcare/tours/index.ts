// src/apps/cloudcare/tours/index.ts
import type { SpotlightStep } from '../../../components/guidance/spotlightStore';
import { registerSpotlightTours } from '../../../hooks/useSpotlight';

// All data-vanthai-id values that the agent is allowed to spotlight.
// Elements NOT in this set are silently ignored by useAIDispatcher.
export const CLOUDCARE_ALLOWED = new Set<string>([
  'cloudcare-records-root',
  'cloudcare-records-latest',
  'cloudcare-records-filter-type',
  'cloudcare-records-sort-toggle',
  'cloudcare-records-count',
  'cloudcare-appointments-root',
  'cloudcare-appointments-book-btn',
  'cloudcare-appointments-next',
  'cloudcare-appointment-form-date',
  'cloudcare-appointment-form-time',
  'cloudcare-appointment-doctor',
  'cloudcare-appointment-hospital',
  'cloudcare-appointment-department',
  'cloudcare-appointment-notes',
  'cloudcare-appointments-confirm-btn',
  'cloudcare-vitals-root',
  'cloudcare-vitals-heart-rate',
  'cloudcare-vitals-spo2',
  'cloudcare-vitals-bp',
  'cloudcare-vitals-temp',
  'cloudcare-vitals-steps',
  'cloudcare-vitals-alert-badge',
  'cloudcare-vitals-hr-chart',
  'cloudcare-prescriptions-root',
  'cloudcare-prescriptions-active',
  'cloudcare-prescriptions-primary',
  'cloudcare-prescriptions-refills',
  'cloudcare-prescriptions-past',
  'cloudcare-prescriptions-print-btn',
]);

// ── Book Appointment tour ─────────────────────────────────────────────────────
const bookAppointmentTour: SpotlightStep[] = [
  {
    id: 'appt-step-1',
    target: '[data-vanthai-id="cloudcare-appointment-form-date"]',
    title: 'Step 1 of 3 — Pick a date',
    text: 'Tap the calendar icon to choose your appointment date. Choose a future date.',
  },
  {
    id: 'appt-step-2',
    target: '[data-vanthai-id="cloudcare-appointment-doctor"]',
    title: 'Step 2 of 3 — Select your doctor',
    text: 'Choose from your care team. Dr. Sarah Johnson handles Cardiology.',
  },
  {
    id: 'appt-step-3',
    target: '[data-vanthai-id="cloudcare-appointments-confirm-btn"]',
    title: 'Step 3 of 3 — Confirm',
    text: 'Review your selection and click Confirm to book your appointment.',
  },
];

// ── View Records tour ─────────────────────────────────────────────────────────
const viewRecordsTour: SpotlightStep[] = [
  {
    id: 'records-step-1',
    target: '[data-vanthai-id="cloudcare-records-latest"]',
    title: 'Your Latest Visit',
    text: 'This card shows your most recent medical encounter — including diagnosis and treatment.',
  },
  {
    id: 'records-step-2',
    target: '[data-vanthai-id="cloudcare-records-filter-type"]',
    title: 'Filter by Type',
    text: 'Use this dropdown to filter by Consultation, Lab Test, or Emergency visits.',
  },
];

const CLOUDCARE_TOURS: Record<string, SpotlightStep[]> = {
  'book-appointment': bookAppointmentTour,
  'view-records': viewRecordsTour,
};

registerSpotlightTours(CLOUDCARE_TOURS);

export default CLOUDCARE_TOURS;
