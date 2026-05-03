# Form 18 - Affordable Housing Project Filing

Form 18 is used for notification of affordable housing project as a specified business under Section 46 of the Income-tax Act. It requires detailed information about the assessee, business, and project.

## Pages & Navigation Flow

1. **File Form 18** (`/itr/file-form-18`)
   - Select Tax Year (T.Y.)
   - Click Continue to proceed
   - Element ID: `file-form-18-root`

2. **Form 18 Sections** (`/itr/form-18-sections`)
   - Index page showing all sections
   - Displays completion status for each section
   - Element ID: `form-18-sections-root`

3. **Assessee Details** (`/itr/assessee-details`)
   - Name, Address, PAN, Status
   - Email, Contact, Residential Status (mandatory)
   - Element ID: `assessee-details-root`
   - Auto-fill fields: name, address, pan, status, email, contact, residentialStatus

4. **Business Details** (`/itr/business-details`)
   - Business name and address
   - Project name and address
   - Element ID: `business-details-root`
   - Auto-fill fields: businessName, flat, road, pin, postOffice, area, district, state, projectName, projFlat, projRoad, projPin

5. **Project Details** (`/itr/project-details`)
   - Project location (address)
   - Total units and area details
   - Element ID: `project-details-root`
   - Auto-fill fields: flat, road, pin, postOffice, area, district, state, totalUnits

## Agent Actions

When user asks "Can you help me fill form 18?", the agent should:

1. **Ask for mode first**: "Do you want me to autofill it for you, or would you like me to guide you section by section?"
2. **If the user wants guidance**: navigate to `/itr/file-form-18` and explain the page, but do not autofill.
3. **If the user wants autofill**:
   - Call `form18_fill_sequence()` to navigate to `/itr/file-form-18`
   - Ask for the Tax Year first, because it must be selected before the rest of the flow can continue
   - Once Tax Year is provided, fill the landing page Tax Year field
   - For each section in order, ask only for the exact fields needed for that section
   - Call `highlight_element('<section-root>')` to spotlight the section
   - Call the matching `fill_form_18_*_custom(...)` tool with the user's values
   - Confirm completion and move to the next section
4. **Use sample-data tools only when the user explicitly requests demo/sample data**

## Available Tools

- `highlight_element(element_id, popover_text)` - Spotlight a form section with Driver.js
- `fill_form_18_assessee_custom(...)` - Auto-fill Assessee Details from user-provided values
- `fill_form_18_business_custom(...)` - Auto-fill Business Details from user-provided values
- `fill_form_18_project_custom(...)` - Auto-fill Project Details from user-provided values
- `fill_form_18_assessee()` - Auto-fill Assessee Details section
- `fill_form_18_business()` - Auto-fill Business Details section
- `fill_form_18_project()` - Auto-fill Project Details section
- `form18_fill_sequence()` - Start the Form 18 filing sequence
- `Tax Year` on `/itr/file-form-18` is a selectable autofillable field with name `taxYear`

## Key Fields

### Assessee Details (Mandatory)
- **residentialStatus** - REQUIRED (Resident, Non-Resident, Resident but Not Ordinarily Resident)

### Business Details (Mandatory)
- **businessName** - REQUIRED
- **flat** - REQUIRED (Flat/Door/Building number)
- **pin** - REQUIRED (PIN code)

### Project Details (Mandatory)
- **flat** - REQUIRED (Plot/Flat number)
- **pin** - REQUIRED (PIN code)
- **totalUnits** - REQUIRED (Total number of units in project)

## Fillability Notes

- **Auto-fillable like Tax Year**: all named inputs and selects used for actual data entry, including `name`, `address`, `pan`, `status`, `email`, `contact`, `residentialStatus`, `businessName`, `flat`, `road`, `pin`, `postOffice`, `area`, `district`, `state`, `projectName`, `projFlat`, `projRoad`, `projPin`, `totalUnits`, and `taxYear`.
- **Not auto-fillable by value**: display-only fields, computed totals, and action buttons such as `Add Details` in project sections.
- **Disabled but fixed**: `country` and `projCountry` are currently fixed to `India`; they are not user-editable fields, but they are already correct by default.
- If the agent needs to spotlight a section, it should use the section root `data-vanthai-id` values rather than individual text labels.

## Storage

Form data is persisted in localStorage:
- `form18_assessee_details` - Assessee info
- `form18_business_details` - Business & project info
- `form18_project_details` - Project location & area info

## Section 12: Fulfilment of Conditions (`/itr/conditions-fulfillment`)
- Element ID: `conditions-fulfillment-root`
- Persisted in: `form18_conditions_details`

This section contains 7 mandatory "Yes/No" questions (12a to 12g) regarding statutory compliance under Rule 36(5):
- **12a(a)**: Prior sanction of the competent authority under the Scheme of Affordable Housing in Partnership.
- **12b(b)**: Commencement of operations on or after 1st April, 2011.
- **12c(c)**: Project is on a plot of land with minimum area of one acre.
- **12d(d)**: At least 30% of total allocable rentable area comprises EWS category housing.
- **12e(e)**: At least 60% of total allocable rentable area comprises EWS and LIG categories housing.
- **12f(f)**: At least 90% of total allocable rentable area comprises EWS, LIG, and MIG categories housing.
- **12g(g)**: Layout, specifications, and design approved by State/UT Government or designated agency.

## Section 13-19: Other Details (`/itr/other-details`)
- Element ID: `other-details-root`
- Persisted in: `form18_other_details`

Key fields:
- **13. Proposed investment**: Total expected investment in Rupees.
- **14(a). Expected date of commencement**: Planned start date.
- **14(b). Actual date of commencement**: Realized start date.
- **15. Adjacent Land**: Whether the assessee has land/projects in the vicinity.
- **16. Separate Area**: Whether the project is a separate identifiable area.
- **17. Project Status**: Independent vs Extension of another project.
- **18. Nature of Title**: Description of the land title held by the assessee (max 400 chars).
- **19. Agreement**: Whether developed under an agreement with other parties.

## Final Steps
- **Attachments** (`/itr/attachments`): Upload supporting documents and audit reports.
- **Declaration** (`/itr/declaration`): Final self-declaration and verification method selection.