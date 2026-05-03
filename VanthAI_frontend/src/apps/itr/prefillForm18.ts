type PrefillData = Partial<{
  taxYear: string;
  assessee: Record<string, string>;
  business: Record<string, string>;
  project: Record<string, string>;
}>;

function waitFor(fn: () => boolean, timeout = 5000, interval = 100) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      try {
        if (fn()) {
          clearInterval(t);
          resolve();
        } else if (Date.now() - start > timeout) {
          clearInterval(t);
          reject(new Error('timeout'));
        }
      } catch (err) {
        clearInterval(t);
        reject(err);
      }
    }, interval);
  });
}

function setInputValueByName(name: string, value: string) {
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`);
  if (!el) return false;
  (el as any).value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function clickButtonWithText(text: string) {
  const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
  const b = buttons.find(x => (x.textContent || '').trim().includes(text));
  if (!b) return false;
  b.click();
  return true;
}

function navigateTo(path: string) {
  if (window.location.pathname === path) return;
  window.location.assign(path);
}

export async function prefillForm18(userData: PrefillData = {}) {
  const data: PrefillData = {
    taxYear: '2026-27',
    assessee: {
      name: 'John Doe',
      address: '123 Example Street',
      pan: 'HVGPM1142B',
      status: 'Individual',
      email: 'john@example.com',
      contact: '9999999999',
      residentialStatus: 'Resident'
    },
    business: {
      businessName: 'Acme Housing LLP',
      country: 'India',
      flat: '12A',
      road: 'MG Road',
      pin: '560064',
      postOffice: 'Yelahanka S.O',
      area: 'Yelahanka',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      projectName: 'Acme Residency',
      projCountry: 'India',
      projFlat: 'Plot 1',
      projRoad: 'MG Road',
      projPin: '560064'
    },
    project: {
      country: 'India',
      flat: 'Plot 1',
      road: 'MG Road',
      pin: '560064',
      postOffice: 'Yelahanka S.O',
      area: 'Yelahanka',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      totalUnits: '10',
      rentableArea: '1000',
      earmarkedArea: '100'
    },
    ...userData
  };

  // Step 1: open file-form-18 and set tax year
  navigateTo('/itr/file-form-18');
  try {
    await waitFor(() => !!document.querySelector('[data-vanthai-id="file-form-18-root"]'), 6000);
  } catch (e) {
    throw new Error('File Form 18 page did not load');
  }

  // set taxYear select
  const tySet = setInputValueByName('taxYear', data.taxYear || '');
  if (!tySet) {
    // fallback: find the select inside form area
    const sel = document.querySelector<HTMLSelectElement>('[data-vanthai-id="file-form-18-root"] select');
    if (sel) {
      sel.value = data.taxYear || '';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // click Continue
  clickButtonWithText('Continue');

  // wait for sections page
  try {
    await waitFor(() => window.location.pathname.includes('/itr/form-18-sections'), 6000);
  } catch (e) {
    // still try to proceed
  }

  // Helper to visit, fill and save
  async function visitAndFill(path: string, fields: Record<string, string>) {
    navigateTo(path);
    // wait for a root element for that page
    const rootSelector = {
      '/itr/assessee-details': '[data-vanthai-id="assessee-details-root"]',
      '/itr/business-details': '[data-vanthai-id="business-details-root"]',
      '/itr/project-details': '[data-vanthai-id="project-details-root"]'
    }[path];

    if (!rootSelector) return;

    try {
      await waitFor(() => !!document.querySelector(rootSelector), 6000);
    } catch (e) {
      console.warn('Page root not found for', path);
    }

    // Fill fields by name
    for (const [k, v] of Object.entries(fields)) {
      setInputValueByName(k, v);
    }

    // Click Save
    clickButtonWithText('Save');

    // wait for navigate back (sections) or path change
    await waitFor(() => window.location.pathname.includes('/itr/form-18-sections') || window.location.pathname !== path, 6000).catch(() => {});
  }

  // Execute pages in the exact sequence requested
  await visitAndFill('/itr/assessee-details', data.assessee || {});
  await visitAndFill('/itr/business-details', data.business || {});
  await visitAndFill('/itr/project-details', data.project || {});

  // done
  return { success: true };
}

// expose for manual testing in browser console
;(window as any).prefillForm18 = prefillForm18;
export default prefillForm18;
