// src/utils/formHelpers.ts
// ─────────────────────────────────────────────────────────────────────────────
// Ported from ERP-SIH utils/formHelpers.ts — VERBATIM for the ERP-SIH section.
// ⚠️  DO NOT REFACTOR nativeInputValueSetter — it is required for React 19
//     controlled-component autofill compatibility.
//
// EXTENDED BELOW with:
//   - CloudCare form descriptors
//   - ITR form descriptors
//   - data-vanthai-id convention (renamed from data-chatbot-id)
// ─────────────────────────────────────────────────────────────────────────────

export interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  value?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'date' | 'number' | 'minLength' | 'maxLength' | 'pattern';
  value?: unknown;
  message: string;
}

export interface FormData {
  [key: string]: unknown;
}

// ── Auto-fill form fields with AI-provided data ───────────────────────────────
// ⚠️ COPY VERBATIM — nativeInputValueSetter must not be refactored.
export const autoFillForm = (data: FormData): void => {
  Object.keys(data).forEach((fieldName) => {
    const value = data[fieldName];
    if (value === null || value === undefined || value === 'NEEDS_USER_INPUT') return;

    const input = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[name="${fieldName}"], #${fieldName}`
    );

    if (input) {
      const stringValue = String(value);
      
      if (input.tagName === 'SELECT') {
        (input as HTMLSelectElement).value = stringValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (input.tagName === 'TEXTAREA') {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        if (setter) {
          setter.call(input, stringValue);
        } else {
          input.value = stringValue;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else if ((input as HTMLInputElement).type === 'checkbox') {
        (input as HTMLInputElement).checked = Boolean(value);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else if ((input as HTMLInputElement).type === 'radio') {
        const radioInput = document.querySelector<HTMLInputElement>(
          `input[name="${fieldName}"][value="${value}"]`
        );
        if (radioInput) {
          radioInput.checked = true;
          radioInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        // Standard Input (text, email, etc.)
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (setter) {
          setter.call(input, stringValue);
        } else {
          input.value = stringValue;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
};

export const validateField = (value: unknown, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && !value.trim())) return rule.message;
        break;
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(String(value))) return rule.message;
        break;
      }
      case 'phone': {
        const phoneRegex = /^\+?[\d\s-()+]+$/;
        if (value && !phoneRegex.test(String(value))) return rule.message;
        break;
      }
      case 'date':
        if (value && isNaN(Date.parse(String(value)))) return rule.message;
        break;
      case 'number':
        if (value && isNaN(Number(value))) return rule.message;
        break;
      case 'minLength':
        if (value && String(value).length < (rule.value as number)) return rule.message;
        break;
      case 'maxLength':
        if (value && String(value).length > (rule.value as number)) return rule.message;
        break;
      case 'pattern':
        if (value && rule.value && !new RegExp(String(rule.value)).test(String(value)))
          return rule.message;
        break;
    }
  }
  return null;
};

export const validateForm = (data: FormData, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  fields.forEach((field) => {
    if (field.validation && field.validation.length > 0) {
      const error = validateField(data[field.name], field.validation);
      if (error) errors[field.name] = error;
    }
  });
  return errors;
};

export const getPageFormFields = (): FormField[] => {
  const fields: FormField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );
  inputs.forEach((input) => {
    if (input.name || input.id) {
      fields.push({
        id: input.id || input.name,
        name: input.name || input.id,
        type: (input as HTMLInputElement).type || input.tagName.toLowerCase(),
        required: input.hasAttribute('required') || input.getAttribute('aria-required') === 'true',
        value: input.value,
      });
    }
  });
  return fields;
};

export const getCurrentFormData = (): Record<string, unknown> => {
  const formData: Record<string, unknown> = {};
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );
  inputs.forEach((input) => {
    const fieldName = input.name || input.id;
    if (fieldName) {
      if ((input as HTMLInputElement).type === 'checkbox') {
        formData[fieldName] = (input as HTMLInputElement).checked;
      } else if ((input as HTMLInputElement).type === 'radio') {
        if ((input as HTMLInputElement).checked) formData[fieldName] = input.value;
      } else {
        formData[fieldName] = input.value;
      }
    }
  });
  return formData;
};

export const formatFormDataForDisplay = (): string => {
  const formData = getCurrentFormData();
  const fields = getPageFormFields();
  let output = '📋 **Current Form Data:**\n\n';
  fields.forEach((field) => {
    const value = formData[field.name];
    const hasValue = value && String(value).trim() !== '';
    const requiredMark = field.required ? '⚠️ (Required)' : '✓';
    const statusIcon = hasValue ? '✅' : field.required ? '❌' : '⚪';
    output += `${statusIcon} **${field.name}** ${requiredMark}\n`;
    output += hasValue ? `   Value: \`${value}\`\n` : `   Value: _Empty_\n`;
  });
  const missingRequired = fields
    .filter((f) => f.required && (!formData[f.name] || String(formData[f.name]).trim() === ''))
    .map((f) => f.name);
  if (missingRequired.length > 0) {
    output += `\n⚠️ **Missing Required Fields:**\n`;
    missingRequired.forEach((field) => { output += `- ${field}\n`; });
  } else {
    output += `\n✨ **All required fields are filled!**\n`;
  }
  return output;
};

export const getFormSchema = (): string => {
  const fields = getPageFormFields();
  return fields
    .map((field) => {
      const req = field.required ? '(Required)' : '(Optional)';
      const val = field.value ? `Current: "${field.value}"` : 'Empty';
      return `- ${field.name} ${req} [Type: ${field.type}] - ${val}`;
    })
    .join('\n');
};

export const generateSampleData = (formType: string): FormData => {
  const samples: Record<string, FormData> = {
    student: {
      firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
      phone: '+1234567890', dateOfBirth: '2008-05-15', gender: 'Male',
      bloodGroup: 'O+', address: '123 Main Street', city: 'New York',
      state: 'NY', pincode: '10001',
      rollNumber: 'STU' + Math.floor(Math.random() * 10000),
      admissionDate: new Date().toISOString().split('T')[0],
    },
    teacher: {
      firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com',
      phone: '+1234567890', dateOfBirth: '1985-03-20', gender: 'Female',
      bloodGroup: 'A+', address: '456 Oak Avenue', city: 'Boston',
      state: 'MA', pincode: '02101',
      employeeId: 'EMP' + Math.floor(Math.random() * 10000),
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: 'M.Ed', specialization: 'Mathematics', experience: '5',
    },
    class: {
      name: 'Class', section: 'A', capacity: '40', roomNumber: '101',
    },
  };
  return samples[formType] || {};
};

// ⚠️ All selectors use data-vanthai-id (renamed from data-chatbot-id in ERP-SIH)
export const highlightFilledFields = (fieldNames: string[]): void => {
  fieldNames.forEach((fieldName) => {
    const input = document.querySelector<HTMLInputElement | HTMLSelectElement>(
      `[name="${fieldName}"], #${fieldName}`
    );
    if (input) {
      input.classList.add('bg-green-50', 'border-green-500');
      setTimeout(() => input.classList.remove('bg-green-50', 'border-green-500'), 2000);
    }
  });
};

// ── detectPageType ────────────────────────────────────────────────────────────
// ERP-SIH originals preserved; CloudCare + ITR cases added below.
export const detectPageType = (): string | null => {
  const path = window.location.pathname;

  // ERP-SIH originals (keep as-is)
  if (path.includes('/students/add'))  return 'student';
  if (path.includes('/teachers/add'))  return 'teacher';
  if (path.includes('/parents/add'))   return 'parent';
  if (path.includes('/classes/add'))   return 'class';
  if (path.includes('/subjects/add'))  return 'subject';
  if (path.includes('/years/add'))     return 'year';

  // CloudCare additions
  if (path.includes('/cloudcare/patient/appointments')) return 'cloudcare_appointment';
  if (path.includes('/cloudcare/patient/prescriptions')) return 'cloudcare_prescription_view';

  // ITR additions
  if (path.includes('/itr/personal'))    return 'itr_personal';
  if (path.includes('/itr/salary'))      return 'itr_salary';
  if (path.includes('/itr/deductions'))  return 'itr_deductions';
  if (path.includes('/itr/tax-paid'))    return 'itr_tax_paid';

  return null;
};

// ── FORM_DESCRIPTIONS ─────────────────────────────────────────────────────────
// ERP-SIH originals preserved; CloudCare + ITR added below.
export const FORM_DESCRIPTIONS: Record<string, string> = {
  student: `
**Student Registration Form Fields:**
- First Name*, Last Name*, Email*, Phone, Date of Birth, Gender, Blood Group
- Address, City, State, PIN Code
- Roll Number*, Admission Date*, Class*, Parent ID
`,
  teacher: `
**Teacher Registration Form Fields:**
- First Name*, Last Name*, Email*, Phone, Date of Birth, Gender, Blood Group
- Employee ID*, Joining Date*, Qualification, Specialization, Experience
`,
  class: `
**Class Creation Form Fields:**
- Name*, Section*, Capacity, Room Number, Class Teacher ID
`,

  // ── CloudCare form descriptors ─────────────────────────────────────────────
  cloudcare_appointment: `
**CloudCare — Book Appointment Form:**
Fields use data-vanthai-id="cloudcare-appointment-*" convention.
- Doctor (cloudcare-appointment-doctor): Select from your care team
- Hospital (cloudcare-appointment-hospital): Select facility
- Date (cloudcare-appointment-date): Appointment date — must be future
- Time: Preferred time slot
- Department: Medical department (Cardiology, General Medicine, etc.)
- Notes: Optional instructions for the doctor
`,
  cloudcare_prescription_view: `
**CloudCare — Prescriptions Page:**
Read-only view of active and past prescriptions.
No form fields to fill — AI can highlight specific prescriptions or explain dosage.
`,

  // ── ITR form descriptors ──────────────────────────────────────────────────
  itr_personal: `
**ITR-1 Personal Information (data-vanthai-id="itr-personal-*"):**
- PAN (itr-personal-pan): Required — format ABCDE1234F
- Full Name (itr-personal-name): As per PAN card
- Date of Birth (itr-personal-dob): DD/MM/YYYY
- Mobile Number: 10-digit Indian mobile
- Email Address: Valid email
- Aadhaar (optional): 12-digit Aadhaar number
- Address: Current residential address
`,
  itr_salary: `
**ITR-1 Salary Income (data-vanthai-id="itr-salary-*"):**
- Gross Salary (itr-salary-gross): Total CTC before deductions
- HRA Received (itr-salary-hra): House Rent Allowance received
- Standard Deduction: Fixed ₹50,000 (auto-calculated)
- Other Allowances: Taxable allowances
- Net Taxable Salary: Auto-calculated field
`,
  itr_deductions: `
**ITR-1 Deductions (data-vanthai-id="itr-deductions-*"):**
- 80C Investments (itr-deductions-80c): LIC, PPF, ELSS, PF — max ₹1,50,000
- 80D Health Insurance (itr-deductions-80d): Premium paid — max ₹25,000 (₹50,000 senior)
- Form 16A Reference (itr-deductions-form16a-field): TDS certificate number from employer
- 80G Donations: Charitable donations (if any)
`,
  itr_tax_paid: `
**ITR-1 Tax Paid (data-vanthai-id="itr-taxpaid-*"):**
- TDS by Employer (itr-taxpaid-tds-employer): From Form 16 Part B
- Advance Tax Paid: Self-assessment advance payments
- Self-Assessment Tax: If any remaining liability
- Submit Button (itr-taxpaid-submit-btn): Final submission trigger
`,
};
