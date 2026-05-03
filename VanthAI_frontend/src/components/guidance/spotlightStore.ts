/**
 * src/components/guidance/spotlightStore.ts
 * Lightweight global state for the Spotlight overlay.
 * Uses useSyncExternalStore pattern — no Context provider needed.
 */

export interface SpotlightStep {
  id?: string;
  target: string;   // CSS selector e.g. '[data-vanthai-id="cloudcare-appointment-date"]'
  title: string;
  text: string;
}

export interface SpotlightState {
  active: boolean;
  steps: SpotlightStep[];
  currentStep: number;
  /** Single-element highlight (non-tour) */
  singleHighlight: {
    selector: string;
    title?: string;
    description?: string;
  } | null;
}

let state: SpotlightState = {
  active: false,
  steps: [],
  currentStep: 0,
  singleHighlight: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getSpotlightState(): SpotlightState {
  return state;
}

export function subscribeSpotlight(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function startSpotlightTour(steps: SpotlightStep[]): void {
  if (steps.length === 0) return;
  state = { active: true, steps, currentStep: 0, singleHighlight: null };
  notify();
}

export function nextStep(): void {
  if (!state.active) return;
  if (state.currentStep < state.steps.length - 1) {
    state = { ...state, currentStep: state.currentStep + 1 };
    notify();
  } else {
    endSpotlight();
  }
}

export function prevStep(): void {
  if (!state.active || state.currentStep <= 0) return;
  state = { ...state, currentStep: state.currentStep - 1 };
  notify();
}

export function endSpotlight(): void {
  state = { active: false, steps: [], currentStep: 0, singleHighlight: null };
  notify();
}

export function showSingleHighlight(
  selector: string,
  title?: string,
  description?: string,
): void {
  state = {
    active: true,
    steps: [{ target: selector, title: title ?? '', text: description ?? '' }],
    currentStep: 0,
    singleHighlight: { selector, title, description },
  };
  notify();
}
