import { useCallback } from 'react';

/**
 * useForm18Filler - Processes Form 18 autofill and highlight actions
 * Handles filling form fields and highlighting elements for Form 18 sections
 */
export function useForm18Filler() {
  /**
   * Set input value by name attribute and trigger change event
   */
  const setInputByName = useCallback((name: string, value: string) => {
    // 1. Try to find if it's a radio group first
    const radios = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`);
    if (radios.length > 0) {
      radios.forEach(radio => {
        if (radio.value === value) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      return;
    }

    // 2. Handle standard inputs
    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `[name="${name}"]`
    );
    if (input) {
      // Use React's internal value setter for controlled components
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        'value'
      );
      if (descriptor && descriptor.set) {
        descriptor.set.call(input, value);
      } else {
        (input as any).value = value;
      }
      
      // Trigger change events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  /**
   * Highlight an element using spotlight (Driver.js)
   */
  const highlightElement = useCallback((elementId: string, popover?: any) => {
    const element = document.querySelector(`[data-vanthai-id="${elementId}"]`);
    if (!element) {
      console.warn(`Element with data-vanthai-id="${elementId}" not found`);
      return;
    }

    // Scroll into view
    (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight class to the element temporarily
    const highlightClass = 'spotlight-highlight';
    (element as HTMLElement).classList.add(highlightClass);

    // Optionally remove highlight after a timeout
    setTimeout(() => {
      (element as HTMLElement).classList.remove(highlightClass);
    }, 5000);
  }, []);

  const highlightSelector = useCallback((selector: string) => {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element with selector "${selector}" not found`);
      return;
    }

    (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    const highlightClass = 'spotlight-highlight';
    (element as HTMLElement).classList.add(highlightClass);
    setTimeout(() => {
      (element as HTMLElement).classList.remove(highlightClass);
    }, 5000);
  }, []);

  /**
   * Fill a form section with data
   */
  const fillFormSection = useCallback(
    (section: string, fillData: Record<string, string>) => {
      Object.entries(fillData).forEach(([fieldName, fieldValue]) => {
        setInputByName(fieldName, fieldValue);
      });
    },
    [setInputByName]
  );

  /**
   * Handle Form 18 action from backend
   */
  const handleForm18Action = useCallback(
    (action: any) => {
      if (action.action === 'autofill' && action.fill_data) {
        fillFormSection(action.section, action.fill_data);
      } else if (action.action === 'highlight' && action.selector) {
        highlightSelector(action.selector);
      } else if (action.action === 'highlight' && action.element) {
        highlightElement(action.element, action.popover);
      }
    },
    [fillFormSection, highlightElement, highlightSelector]
  );

  return {
    setInputByName,
    highlightElement,
    highlightSelector,
    fillFormSection,
    handleForm18Action
  };
}

export default useForm18Filler;
