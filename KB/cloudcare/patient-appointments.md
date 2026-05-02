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

### Book New Appointment Button
- Label: "Book Appointment"
- Opens a form with: Doctor selector, Hospital selector, Date picker, Time picker, Department, Notes textarea

### Key `data-vanthai-id` Attributes
| Element | ID |
|---|---|
| Appointments page root | `cloudcare-appointments-root` |
| Book appointment button | `cloudcare-appointments-book-btn` |
| Next upcoming appointment card | `cloudcare-appointments-next` |
| Date picker input | `cloudcare-appointment-date` |
| Doctor selector | `cloudcare-appointment-doctor` |
| Hospital selector | `cloudcare-appointment-hospital` |
| Department input | `cloudcare-appointment-department` |
| Confirm/Submit button | `cloudcare-appointments-confirm-btn` |

## Agent Guidance
- When user says "book appointment", "schedule a visit", "see a doctor", navigate here
- Use `navigate+tour` with tour `book-appointment` to walk the user through booking
- `autoFillForm` can pre-fill doctor, hospital, department from context (e.g., user's existing care team)
- Use `highlight` + `cloudcare-appointments-next` to draw attention to the next appointment
- Appointment dates are always in the future; agent should not suggest past dates
