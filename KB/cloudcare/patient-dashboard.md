# KB: Patient Dashboard
**Route:** `/cloudcare` or `/cloudcare/patient`
**Agent Purpose:** Main patient overview — profile, AI health analysis, active conditions, recent records.

## Page Structure

### Patient Profile Card (left column)
- Avatar with patient initial
- Name, Age, Gender, Blood Type, Occupation chips
- Emergency badge if active
- Address, Contact, Family Contact, Insurance details

### AI Health Analysis Panel (right column, top)
- 🧠 Gemini-generated health insight for this patient
- Displayed in amber callout box

### Current Conditions (right column, bottom-left)
- Active conditions with onset date
- Red left-border cards

### Recent Medical Records (right column, bottom-right)
- Last 3 records sorted by date (newest first)
- Blue left-border cards

## Key `data-vanthai-id` Attributes
| Element | ID |
|---|---|
| Dashboard root | `cloudcare-patient-dashboard` |
| Recent records list | `cloudcare-records-latest` |

## Agent Guidance
- This is the landing page — greet patient by name when possible
- Point to conditions and AI analysis when user asks "how am I doing"
- Use `navigate` to route to specific sections when user asks for details
