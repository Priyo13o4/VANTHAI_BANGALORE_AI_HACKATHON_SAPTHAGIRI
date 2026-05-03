import prefillForm18 from './prefillForm18';

/**
 * Check if user message matches Form 18 prefill trigger
 */
export function isForm18PrefillTrigger(message: string): boolean {
  const normalized = message.toLowerCase().trim();
  const triggers = [
    'can you help me fill form 18',
    'help me fill form 18',
    'fill form 18',
    'prefill form 18',
    'auto fill form 18',
  ];
  return triggers.some(t => normalized.includes(t));
}

/**
 * Handler for Form 18 prefill trigger
 */
export async function handleForm18PrefillRequest(
  message: string,
  options?: { confirmFirst?: boolean; userData?: any }
): Promise<{ success: boolean; error?: string }> {
  const { confirmFirst = true, userData } = options || {};

  if (!isForm18PrefillTrigger(message)) {
    return { success: false, error: 'Message does not match Form 18 prefill trigger' };
  }

  if (confirmFirst) {
    const confirmed = confirm(
      'This will navigate through Form 18 sections and fill assessee, business, and project details. Continue?'
    );
    if (!confirmed) {
      return { success: false, error: 'User cancelled' };
    }
  }

  try {
    const result = await prefillForm18(userData);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export default handleForm18PrefillRequest;
