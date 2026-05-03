# Form 18 Agent Quick Reference

## Trigger Phrases
When user says any of these, initiate Form 18 auto-fill:
- "Can you help me fill form 18?"
- "Fill form 18 for me"
- "Auto-fill form 18"
- "Help with form 18"
- "I need to file form 18"

## Tool Sequence (EXACT ORDER)

### Step 1: Initiate
```
Call: form18_fill_sequence()
Response: { action: "navigate", url: "/itr/file-form-18", ... }
Agent says: "I'm taking you to Form 18. Once we're there, I can help fill in your details."
```

### Step 2: Assessee Section
```
Call: highlight_element("assessee-details-root", "Assessee details - Name, address, residential status")
Response: { action: "highlight", element: "assessee-details-root", ... }
Agent says: "I've highlighted the Assessee Details section. This is where we enter your personal info."

Call: fill_form_18_assessee()
Response: {
  action: "autofill",
  section: "assessee-details",
  fill_data: {
    name: "John Doe",
    address: "123 Business Street, Suite 100",
    pan: "HVGPM1142B",
    status: "Individual",
    email: "john.doe@example.com",
    contact: "9999999999",
    residentialStatus: "Resident"
  }
}
Agent says: "Perfect! I've filled your assessee details. Now click Save to continue."
```

**User Action:** Click Save button on AssesseeDetails page

### Step 3: Business Section
```
Call: highlight_element("business-details-root", "Business details - Business name, address, project info")
Response: { action: "highlight", element: "business-details-root", ... }
Agent says: "Now let's move to the Business Details section."

Call: fill_form_18_business()
Response: {
  action: "autofill",
  section: "business-details",
  fill_data: {
    businessName: "Acme Housing Development LLP",
    flat: "Plot 123-A",
    road: "MG Road",
    pin: "560064",
    postOffice: "Yelahanka S.O",
    area: "Yelahanka",
    district: "Bengaluru Urban",
    state: "Karnataka",
    projectName: "Acme Residency Phase 1",
    projFlat: "Plot 123",
    projRoad: "MG Road",
    projPin: "560064"
  }
}
Agent says: "I've filled your business details including the project address. Click Save to continue."
```

**User Action:** Click Save button on BusinessDetails page

### Step 4: Project Section
```
Call: highlight_element("project-details-root", "Project details - Location, units, area info")
Response: { action: "highlight", element: "project-details-root", ... }
Agent says: "Now for the final section - Project Details."

Call: fill_form_18_project()
Response: {
  action: "autofill",
  section: "project-details",
  fill_data: {
    flat: "Plot 123",
    road: "MG Road",
    pin: "560064",
    postOffice: "Yelahanka S.O",
    area: "Yelahanka",
    district: "Bengaluru Urban",
    state: "Karnataka",
    totalUnits: "15"
  }
}
Agent says: "All done! I've filled all three sections of Form 18. Click Save on this page."
```

**User Action:** Click Save button on ProjectDetails page

### Step 5: Completion
Agent confirms: "Excellent! Form 18 is now ready. You can review all sections and proceed with submission."

---

## Important Notes

1. **Always call tools in this order** - Don't skip steps
2. **Highlight BEFORE fill** - User expects to see the section highlighted before it auto-fills
3. **Wait for user action** - After each fill, tell user to click Save
4. **Respond conversationally** - Don't output JSON or tool payloads to user
5. **Confirm section completion** - "Great! Assessee details are done. Next is business details..."
6. **Use exact element IDs** - These must match `data-vanthai-id` in the pages

---

## Element IDs Reference

| Section | Element ID | Page URL |
|---------|-----------|----------|
| Assessee | `assessee-details-root` | `/itr/assessee-details` |
| Business | `business-details-root` | `/itr/business-details` |
| Project | `project-details-root` | `/itr/project-details` |
| Index | `form-18-sections-root` | `/itr/form-18-sections` |
| Start | `file-form-18-root` | `/itr/file-form-18` |

---

## Field Names for Fill Data

### Assessee Details Fields
- `name` (text)
- `address` (textarea)
- `pan` (text)
- `status` (select: Individual, HUF, Company, Firm)
- `email` (email)
- `contact` (tel)
- `residentialStatus` (select: Resident, Non-Resident, etc.) **[MANDATORY]**

### Business Details Fields
- `businessName` (text) **[MANDATORY]**
- `country` (select) - Fixed to "India"
- `flat` (text) **[MANDATORY]**
- `road` (text)
- `pin` (text) **[MANDATORY]**
- `postOffice` (select)
- `area` (select)
- `district` (select)
- `state` (select)
- `projectName` (text)
- `projCountry` (select) - Fixed to "India"
- `projFlat` (text)
- `projRoad` (text)
- `projPin` (text)

### Project Details Fields
- `country` (select) - Fixed to "India"
- `flat` (text) **[MANDATORY]**
- `road` (text)
- `pin` (text) **[MANDATORY]**
- `postOffice` (select)
- `area` (select)
- `district` (select)
- `state` (select)
- `totalUnits` (text) **[MANDATORY]**

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Element not highlighted | Verify `data-vanthai-id` matches exactly (case-sensitive) |
| Fields not filling | Check field `name` attribute matches the fill_data key |
| Save button disabled | Verify all MANDATORY fields are filled |
| Page navigation fails | User may have left the page; call `navigate_to()` again |