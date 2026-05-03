# Form 18 Prefill Tool

## Quick Start

### Manual Trigger (Browser Console)
```javascript
// Navigate to ITR dashboard or any ITR page, then in console:
await prefillForm18()
```

### Programmatic Usage
```typescript
import prefillForm18 from './prefillForm18';
import { handleForm18PrefillRequest } from './form18PrefillTrigger';

// Direct call with default data
await prefillForm18();

// With custom data
await prefillForm18({
  taxYear: '2027-28',
  assessee: { name: 'Jane Doe', email: 'jane@example.com', ... },
  business: { businessName: 'My Business', ... },
  project: { totalUnits: '20', ... }
});

// Via trigger handler (checks message, confirms with user, then fills)
const result = await handleForm18PrefillRequest(
  'Can you help me fill form 18?',
  { confirmFirst: true, userData: {...} }
);
```

## Pages Visited (Exact Sequence)
1. `/itr/file-form-18` — Set tax year and continue
2. `/itr/form-18-sections` — Index of form sections (navigated automatically)
3. `/itr/assessee-details` — Fill assessee info and save
4. `/itr/business-details` — Fill business info and save
5. `/itr/project-details` — Fill project info and save

## Fields Populated

### Assessee Details
- name, address, pan, status, email, contact, residentialStatus

### Business Details
- businessName, country, flat, road, pin, postOffice, area, district, state
- projectName, projCountry, projFlat, projRoad, projPin

### Project Details
- country, flat, road, pin, postOffice, area, district, state, totalUnits

## Component Changes

### BusinessDetails.tsx
- Added `name` attributes to project address inputs: `projFlat`, `projRoad`, `projPin`
- Bound inputs to `formData` state with `onChange={handleChange}` for proper controlled-component behavior
- Allows `setInputValueByName()` in prefillForm18.ts to trigger state updates

## Testing

### Manual Test Steps
1. Clear browser localStorage: `localStorage.clear()`
2. Navigate to `/itr/file-form-18`
3. Open browser DevTools (F12) → Console
4. Run: `await prefillForm18()`
5. Watch the script navigate through pages and fill fields
6. After completion, go back to `/itr/form-18-sections` and verify "Completed" badges appear for assessee, business, project

### Verify localStorage
```javascript
console.log(JSON.parse(localStorage.getItem('form18_assessee_details')));
console.log(JSON.parse(localStorage.getItem('form18_business_details')));
console.log(JSON.parse(localStorage.getItem('form18_project_details')));
```

## Known Limitations
- Requires controlled React inputs with proper `name` attributes and `onChange` handlers
- Depends on navigation completing within 6-second timeout (adjustable in prefillForm18.ts)
- Currently set to fill default demo data; pass custom `userData` to override
- Does not fill "Add Details" sections for rentable/earmarked areas in ProjectDetails (requires modal/dynamic list handling)

## Future Enhancements
- Add support for rentable area and earmarked area dynamic lists
- Add form submission after all pages filled
- Add rollback/undo functionality (clear localStorage keys)
- Add success/progress notifications
- Add error retry logic
