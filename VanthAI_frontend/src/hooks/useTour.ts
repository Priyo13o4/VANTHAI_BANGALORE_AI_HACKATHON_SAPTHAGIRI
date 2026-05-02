/**
 * src/hooks/useTour.ts
 * Vanilla Shepherd.js wrapper — NO react-shepherd.
 * react-shepherd has documented React 19 incompatibilities.
 *
 * Shepherd.js 15.x button API:
 *   buttons take string action names ('next', 'back', 'complete') — NOT function references.
 */
import { useCallback, useRef } from 'react';
import Shepherd, { type Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration type (aligned with Shepherd.js 15.x API)
export interface TourStepConfig {
  attachTo?: { element: string; on: string };
  title?: string;
  text: string;
  buttons?: Array<{
    text: string;
    action: 'next' | 'back' | 'complete' | 'cancel';  // string names — NOT functions
    classes?: string;
  }>;
  id?: string;
}

export interface UseTourReturn {
  startTour: (tourName: string) => void;
  endTour: () => void;
}

// Tour registry is injected from each app's tours/index.ts
// This hook looks up the global registry at call time.
const GLOBAL_TOUR_REGISTRY: Record<string, TourStepConfig[]> = {};

export function registerTours(tours: Record<string, TourStepConfig[]>): void {
  Object.assign(GLOBAL_TOUR_REGISTRY, tours);
}

export function useTour(_app: 'cloudcare' | 'itr'): UseTourReturn {
  const tourRef = useRef<Tour | null>(null);

  const endTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.complete();
      tourRef.current = null;
    }
  }, []);

  const startTour = useCallback(
    (tourName: string) => {
      const steps = GLOBAL_TOUR_REGISTRY[tourName];
      if (!steps || steps.length === 0) {
        console.warn(`[useTour] Tour "${tourName}" not found in registry`);
        return;
      }

      // Cancel any existing tour first
      endTour();

      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          cancelIcon: { enabled: true },
          scrollTo: { behavior: 'smooth', block: 'center' },
        },
      });

      steps.forEach((stepConfig, index) => {
        tour.addStep({
          id: stepConfig.id ?? `step-${index}`,
          attachTo: stepConfig.attachTo
            ? { element: stepConfig.attachTo.element, on: stepConfig.attachTo.on as import('shepherd.js').PopperPlacement }
            : undefined,
          title: stepConfig.title,
          text: stepConfig.text,
          buttons: (stepConfig.buttons ?? []).map((btn) => ({
            text: btn.text,
            classes: btn.classes ?? 'shepherd-button-primary',
            action: (tour[btn.action] as () => void).bind(tour),
          })),
        });
      });

      tourRef.current = tour;
      tour.start();
    },
    [endTour]
  );

  return { startTour, endTour };
}
