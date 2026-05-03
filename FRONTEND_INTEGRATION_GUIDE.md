# Frontend Integration Guide - Form 18 Auto-Fill

## How to Use `useForm18Filler` Hook in Form 18 Pages

### Step 1: Import the Hook
```typescript
import { useForm18Filler } from '../hooks/useForm18Filler';
```

### Step 2: Initialize in Your Component
```typescript
export default function AssesseeDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ... });
  
  // Initialize the filler hook
  const { handleForm18Action, fillFormSection, highlightElement } = useForm18Filler();
  
  // ... rest of component
}
```

### Step 3: Process Agent Actions

Option A: **Listen for broadcast events** (if using a custom message dispatcher)
```typescript
useEffect(() => {
  const handleAgentAction = (event: CustomEvent) => {
    const action = event.detail;
    handleForm18Action(action);
  };
  
  window.addEventListener('form18-action', handleAgentAction);
  return () => window.removeEventListener('form18-action', handleAgentAction);
}, [handleForm18Action]);
```

Option B: **Direct form filling** (if component receives action props)
```typescript
useEffect(() => {
  if (incomingAction && incomingAction.action === 'autofill') {
    fillFormSection(incomingAction.section, incomingAction.fill_data);
  }
}, [incomingAction]);
```

Option C: **Manual trigger** (for testing)
```typescript
const handleTestFill = () => {
  fillFormSection('assessee-details', {
    name: 'Test User',
    email: 'test@example.com',
    residentialStatus: 'Resident'
  });
};
```

### Step 4: Ensure Form Fields Have `name` Attributes

✅ **CORRECT** - Controlled input with name attribute:
```typescript
<input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  className="..."
/>
```

❌ **INCORRECT** - Missing name attribute:
```typescript
<input
  type="text"
  value={formData.name}
  onChange={handleChange}
  className="..."
/>
```

### Complete Example: AssesseeDetails.tsx

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm18Filler } from '../hooks/useForm18Filler';

export default function AssesseeDetails() {
  const navigate = useNavigate();
  const { handleForm18Action, fillFormSection } = useForm18Filler();
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_assessee_details');
    return saved ? JSON.parse(saved) : {
      name: '',
      address: '',
      pan: '',
      status: '',
      email: '',
      contact: '',
      residentialStatus: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Listen for agent auto-fill actions
  useEffect(() => {
    const listener = (event: CustomEvent<any>) => {
      if (event.detail.action === 'autofill') {
        fillFormSection(event.detail.section, event.detail.fill_data);
      }
    };
    
    window.addEventListener('form18-action', listener as EventListener);
    return () => window.removeEventListener('form18-action', listener as EventListener);
  }, [fillFormSection]);

  const handleSave = () => {
    localStorage.setItem('form18_assessee_details', JSON.stringify(formData));
    navigate(-1);
  };

  return (
    <div data-vanthai-id="assessee-details-root" className="space-y-6">
      {/* ... form fields with name attributes ... */}
      
      <input 
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="..."
      />
      
      <select 
        name="residentialStatus"
        value={formData.residentialStatus}
        onChange={handleChange}
        className="..."
      >
        <option value="">Select</option>
        <option value="Resident">Resident</option>
        <option value="Non-Resident">Non-Resident</option>
      </select>
      
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## How the Hook Works Internally

### `setInputByName(name, value)`
1. Finds the DOM input with `[name="..."]`
2. Sets the value using React's property descriptor (for controlled inputs)
3. Dispatches `input` + `change` events to trigger React state update
4. React's onChange handler automatically updates formData

### `fillFormSection(section, fillData)`
1. Loops through each key-value pair in fillData
2. Calls `setInputByName()` for each field
3. After all fields are set, form state is updated

### `highlightElement(elementId)`
1. Finds element by `[data-vanthai-id="..."]`
2. Adds `.spotlight-highlight` CSS class
3. Scrolls element into view smoothly
4. Auto-removes highlight after 5 seconds

## Testing the Integration

### Manual Test in Browser Console
```javascript
// Simulate agent action
const event = new CustomEvent('form18-action', {
  detail: {
    action: 'autofill',
    section: 'assessee-details',
    fill_data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      residentialStatus: 'Resident'
    }
  }
});

window.dispatchEvent(event);

// Check localStorage
console.log(JSON.parse(localStorage.getItem('form18_assessee_details')));
```

## Common Patterns

### Pattern 1: Auto-fill + Spotlight
```typescript
// Agent calls highlight_element()
highlightElement('assessee-details-root');

// Then agent calls fill_form_18_assessee()
fillFormSection('assessee-details', {
  name: 'John Doe',
  email: 'john@example.com',
  residentialStatus: 'Resident'
});
```

### Pattern 2: Progressive Filling
```typescript
// Fill only specific fields (not all)
fillFormSection('assessee-details', {
  name: 'Partial Name',
  email: 'partial@example.com'
  // other fields will not be overwritten
});
```

### Pattern 3: Custom Validation Before Fill
```typescript
const handleForm18Action = (action: any) => {
  if (action.action === 'autofill') {
    // Validate before filling
    if (action.fill_data.name && action.fill_data.name.length > 100) {
      console.warn('Name too long, skipping fill');
      return;
    }
    fillFormSection(action.section, action.fill_data);
  }
};
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Fields not updating | Ensure `name` attributes match exactly with fill_data keys |
| React component not re-rendering | Check that controlled inputs have `value` and `onChange` |
| Spotlight not showing | Verify `data-vanthai-id` is present on the root element |
| localStorage not saving | Make sure `handleSave()` is called before navigation |

## CSS Class for Spotlight (Optional)

Add this to your global CSS to style the spotlight highlight:
```css
.spotlight-highlight {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 2px #2563eb;
  border-radius: 8px;
  animation: spotlight-pulse 1.5s ease-in-out 3 times;
}

@keyframes spotlight-pulse {
  0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 2px #2563eb; }
  50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px #2563eb; }
}
```