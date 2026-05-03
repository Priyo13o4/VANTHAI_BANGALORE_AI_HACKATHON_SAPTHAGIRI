// src/apps/itr/tours/index.ts — STUB (Phase 5)
import type { SpotlightStep } from '../../../components/guidance/spotlightStore';
import { registerSpotlightTours } from '../../../hooks/useSpotlight';

export const ITR_ALLOWED = new Set<string>([
  'itr-overview-start-btn',
  'itr-personal-pan',
  'itr-personal-name',
  'itr-personal-dob',
  'itr-salary-gross',
  'itr-salary-hra',
  'itr-salary-standard-deduction',
  'itr-deductions-80c',
  'itr-deductions-80d',
  'itr-deductions-form16a-field',
  'itr-taxpaid-tds-employer',
  'itr-taxpaid-submit-btn',
]);

// Tour configs — stubs, to be filled in Phase 5
const fillSalaryTour: SpotlightStep[] = [];   // TODO
const findForm16aTour: SpotlightStep[] = [];  // TODO

const ITR_TOURS: Record<string, SpotlightStep[]> = {
  'fill-salary': fillSalaryTour,
  'find-form16a': findForm16aTour,
};

registerSpotlightTours(ITR_TOURS);

export default ITR_TOURS;
