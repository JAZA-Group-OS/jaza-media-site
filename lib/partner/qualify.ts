import type { Answers } from './questions';

export type Outcome = 'qualified' | 'not_qualified';

type Disqualifiers = {
  willingToInvest: ReadonlyArray<NonNullable<Answers['willingToInvest']>>;
  timeline: ReadonlyArray<NonNullable<Answers['timeline']>>;
  budget: ReadonlyArray<NonNullable<Answers['budget']>>;
  monthlyRevenue: ReadonlyArray<NonNullable<Answers['monthlyRevenue']>>;
};

const DISQUALIFIERS: Disqualifiers = {
  willingToInvest: ['no'],
  timeline: ['just_exploring'],
  budget: ['30k_50k'],
  monthlyRevenue: ['0'],
};

export function qualify(a: Answers): Outcome {
  if (a.willingToInvest && DISQUALIFIERS.willingToInvest.includes(a.willingToInvest)) return 'not_qualified';
  if (a.timeline && DISQUALIFIERS.timeline.includes(a.timeline)) return 'not_qualified';
  if (a.budget && DISQUALIFIERS.budget.includes(a.budget)) return 'not_qualified';
  if (a.monthlyRevenue && DISQUALIFIERS.monthlyRevenue.includes(a.monthlyRevenue)) return 'not_qualified';
  return 'qualified';
}
