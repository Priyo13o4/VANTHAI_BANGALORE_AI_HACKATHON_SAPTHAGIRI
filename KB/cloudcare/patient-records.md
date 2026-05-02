# Page: Patient Medical Records
**Route:** `/cloudcare/patient/records`
**Agent Purpose:** Allows the patient to view their complete medical history, past diagnoses, and treatment notes.

## Page Structure

### Page Heading
- Title: "Medical Records"
- Subtitle: "Your complete health history"

### Records List
Each record card displays:
- **Record Type** (Consultation, Lab Test, Emergency, Surgery, Vaccination)
- **Date** — formatted as "DD Month YYYY, HH:MM"
- **Description** — brief summary of the visit or test
- **Diagnosis** — confirmed diagnosis text
- **Treatment** — prescribed treatment or medication changes
- **Doctor** — name of treating physician
- **Hospital** — name of facility

### Filter/Sort Controls
- Filter by record type (All, Consultation, Lab Test, Emergency)
- Sort by date (newest first / oldest first)

### Key `data-vanthai-id` Attributes
| Element | ID |
|---|---|
| Records page root | `cloudcare-records-root` |
| Latest/most recent record card | `cloudcare-records-latest` |
| Record type filter dropdown | `cloudcare-records-filter-type` |
| Sort order toggle | `cloudcare-records-sort-toggle` |
| Individual record card (n-th) | `cloudcare-records-card-{id}` |
| Records count badge | `cloudcare-records-count` |

## Agent Guidance
- When user asks "show my records" or "medical history", navigate here
- When user asks about a specific condition (e.g., "my diabetes records"), filter by relevant record type
- The agent can use `highlight` action to spotlight the latest record card using `cloudcare-records-latest`
- Use `navigate+tour` with tour `view-records` to walk the user through interpreting a record
- **Explanation Capability:** To explain or summarize any records seen on this page, the agent **MUST** call the `query_health_records` tool. Do NOT hallucinate record details; only the tool provides the ground truth from the database.
