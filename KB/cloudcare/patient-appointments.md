# Page: Patient Appointments
**Route:** `/cloudcare/patient/appointments`
**Agent Purpose:** Allows the patient to view scheduled, completed, and cancelled appointments, and book new ones.

## Page Structure

### Page Heading
- Title: "Appointments"
- Subtitle: "Manage your upcoming and past visits"

### Upcoming Appointments Section
Shows appointments with `status: "scheduled"`, sorted by date (earliest first).

Each appointment card:
- **Date & Time** — e.g., "25 Oct 2025, 10:00 AM"
- **Department** — e.g., "Cardiology"
- **Doctor Name** — e.g., "Dr. Sarah Johnson"
- **Hospital Name** — e.g., "City General Hospital"
- **Status Badge** — Scheduled (blue), Completed (green), Cancelled (red)
- **Notes** — brief note from the doctor

### Past Appointments Section
Shows appointments with `status: "completed"` or `status: "cancelled"`, sorted by date (newest first).

### Book New Appointment Button & Form
- Button Label: "Book Appointment"
- Opens a dialog form with the following fields in order:
  1. **Doctor Selector** — Dropdown to choose doctor by name and specialty
  2. **Hospital Selector** — Dropdown to choose hospital
  3. **Department** — Dropdown to select department (Cardiology, General Medicine, etc.)
  4. **Appointment Date** — Date picker for selecting the appointment date
  5. **Appointment Time** — Time picker for selecting the appointment time
  6. **Notes** — Optional textarea for special requests or concerns
  7. **Cancel Button** — Closes the form without saving
  8. **Schedule Appointment Button** — Submits the form and creates the appointment

### Key `data-vanthai-id` Attributes
| Element | ID | Location |
|---|---|---|
| Appointments page root | `cloudcare-appointments-root` | Page container |
| Book appointment button | `cloudcare-appointments-book-btn` | Top right corner |
| Next upcoming appointment card | `cloudcare-appointments-next` | Upcoming appointments list |
| Schedule dialog root | `cloudcare-appointments-dialog-root` | Dialog container |
| Doctor selector | `cloudcare-appointment-doctor` | Form field 1 |
| Hospital selector | `cloudcare-appointment-hospital` | Form field 2 |
| Department selector | `cloudcare-appointment-department` | Form field 3 |
| Date picker input | `cloudcare-appointment-form-date` | Form field 4 |
| Time picker input | `cloudcare-appointment-form-time` | Form field 5 |
| Notes textarea | `cloudcare-appointment-notes` | Form field 6 |
| Cancel button | `cloudcare-appointments-cancel-btn` | Dialog footer |
| Confirm/Submit button | `cloudcare-appointments-confirm-btn` | Dialog footer |

## Agent Guidance
- When user says "book appointment", "schedule a visit", "see a doctor", navigate here
- For step-by-step guidance through the appointment form, use spotlight in this sequence:
  1. First, highlight `cloudcare-appointments-book-btn` → "This is the Book Appointment button"
  2. After clicking, highlight `cloudcare-appointment-doctor` → "Select a doctor"
  3. Then `cloudcare-appointment-hospital` → "Choose the hospital"
  4. Then `cloudcare-appointment-department` → "Pick the department"
  5. Then `cloudcare-appointment-form-date` → "Select your preferred date"
  6. Then `cloudcare-appointment-form-time` → "Choose a time slot"
  7. Optionally `cloudcare-appointment-notes` → "Add any special requests"
  8. Finally `cloudcare-appointments-confirm-btn` → "Click here to book your appointment"
- Use `highlight` + `cloudcare-appointments-next` to draw attention to the next appointment
- Appointment dates are always in the future; agent should not suggest past dates
- Fields marked as required: Doctor, Hospital, Department. Date/Time/Notes can be defaulted if needed.
