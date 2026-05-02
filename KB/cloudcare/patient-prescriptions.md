# Page: Patient Prescriptions
**Route:** `/cloudcare/patient/prescriptions`
**Agent Purpose:** Shows active and past prescriptions, dosage information, refill status.

## Page Structure

### Page Heading
- Title: "Prescriptions"
- Subtitle: "Your active medications and dosage schedule"

### Active Prescriptions Section
Each prescription card:
- **Medication Name** — e.g., "Amlodipine"
- **Dosage** — e.g., "5mg"
- **Frequency** — e.g., "Once daily"
- **Instructions** — e.g., "Take in the morning with food"
- **Prescribed By** — doctor name
- **Start Date / End Date** — formatted dates (Ongoing if no end date)
- **Refills Remaining** — numeric badge (if applicable)
- **Status Badge** — Active (green), Completed (grey)

### Past Prescriptions Section
Shows prescriptions with a past `endDate`.

### Prescription Details Drawer
Clicking a card opens a side drawer with full details and print option.

### Key `data-vanthai-id` Attributes
| Element | ID |
|---|---|
| Prescriptions page root | `cloudcare-prescriptions-root` |
| Active prescriptions section | `cloudcare-prescriptions-active` |
| First/primary active prescription | `cloudcare-prescriptions-primary` |
| Refills remaining badge | `cloudcare-prescriptions-refills` |
| Past prescriptions section | `cloudcare-prescriptions-past` |
| Print prescription button | `cloudcare-prescriptions-print-btn` |

## Agent Guidance
- When user asks "my medications", "prescriptions", "what am I taking", navigate here
- Use `highlight` + `cloudcare-prescriptions-primary` to draw attention to the main active medication
- If user asks about refills, highlight the refills badge
- The agent can explain medication purpose, dosage timing, and interaction warnings from its knowledge
- Do NOT write prescription data to the backend — it is display-only from the database
