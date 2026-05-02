// src/apps/cloudcare/tours/index.ts
import type { TourStepConfig } from '../../../hooks/useTour';
import { registerTours } from '../../../hooks/useTour';

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
  'cloudcare-appointment-date',
  'cloudcare-appointment-doctor',
  'cloudcare-appointment-hospital',
  'cloudcare-appointment-department',
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
const bookAppointmentTour: TourStepConfig[] = [
  {
    id: 'appt-step-1',
    attachTo: { element: '[data-vanthai-id="cloudcare-appointment-date"]', on: 'bottom' },
    title: 'Step 1 of 3 — Pick a date',
    text: 'Tap the calendar icon to choose your appointment date. Choose a future date.',
    buttons: [{ text: 'Next →', action: 'next' }],
  },
  {
    id: 'appt-step-2',
    attachTo: { element: '[data-vanthai-id="cloudcare-appointment-doctor"]', on: 'bottom' },
    title: 'Step 2 of 3 — Select your doctor',
    text: 'Choose from your care team. Dr. Sarah Johnson handles Cardiology.',
    buttons: [
      { text: '← Back', action: 'back', classes: 'shepherd-button-secondary' },
      { text: 'Next →', action: 'next' },
    ],
  },
  {
    id: 'appt-step-3',
    attachTo: { element: '[data-vanthai-id="cloudcare-appointments-confirm-btn"]', on: 'top' },
    title: 'Step 3 of 3 — Confirm',
    text: 'Review your selection and click Confirm to book your appointment.',
    buttons: [
      { text: '← Back', action: 'back', classes: 'shepherd-button-secondary' },
      { text: 'Done ✓', action: 'complete' },
    ],
  },
];

// ── View Records tour ─────────────────────────────────────────────────────────
const viewRecordsTour: TourStepConfig[] = [
  {
    id: 'records-step-1',
    attachTo: { element: '[data-vanthai-id="cloudcare-records-latest"]', on: 'bottom' },
    title: 'Your Latest Visit',
    text: 'This card shows your most recent medical encounter — including diagnosis and treatment.',
    buttons: [{ text: 'Next →', action: 'next' }],
  },
  {
    id: 'records-step-2',
    attachTo: { element: '[data-vanthai-id="cloudcare-records-filter-type"]', on: 'bottom' },
    title: 'Filter by Type',
    text: 'Use this dropdown to filter by Consultation, Lab Test, or Emergency visits.',
    buttons: [
      { text: '← Back', action: 'back', classes: 'shepherd-button-secondary' },
      { text: 'Done ✓', action: 'complete' },
    ],
  },
];

const CLOUDCARE_TOURS: Record<string, TourStepConfig[]> = {
  'book-appointment': bookAppointmentTour,
  'view-records': viewRecordsTour,
};

registerTours(CLOUDCARE_TOURS);

export default CLOUDCARE_TOURS;
