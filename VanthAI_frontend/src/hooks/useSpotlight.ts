/**
 * src/hooks/useSpotlight.ts
 * Replaces useTour.ts — wraps the spotlight store with tour registry lookup.
 * Same API surface as useTour for easy migration.
 */
import { useCallback } from 'react';
import {
  startSpotlightTour,
  endSpotlight,
  showSingleHighlight,
} from '../components/guidance/spotlightStore';
import type { SpotlightStep } from '../components/guidance/spotlightStore';

// ── Tour Registry (populated by each app's tours/index.ts) ────────────────
const SPOTLIGHT_REGISTRY: Record<string, SpotlightStep[]> = {};

export function registerSpotlightTours(tours: Record<string, SpotlightStep[]>): void {
  Object.assign(SPOTLIGHT_REGISTRY, tours);
}

export interface UseSpotlightReturn {
  startTour: (tourName: string) => void;
  endTour: () => void;
  highlight: (selector: string, title?: string, description?: string) => void;
  clearHighlight: () => void;
}

export function useSpotlight(_app: 'cloudcare' | 'itr'): UseSpotlightReturn {
  const startTour = useCallback((tourName: string) => {
    const steps = SPOTLIGHT_REGISTRY[tourName];
    if (!steps || steps.length === 0) {
      console.warn(`[useSpotlight] Tour "${tourName}" not found in registry`);
      return;
    }
    startSpotlightTour(steps);
  }, []);

  const endTour = useCallback(() => {
    endSpotlight();
  }, []);

  const highlight = useCallback((selector: string, title?: string, description?: string) => {
    showSingleHighlight(selector, title, description);
  }, []);

  const clearHighlight = useCallback(() => {
    endSpotlight();
  }, []);

  return { startTour, endTour, highlight, clearHighlight };
}
