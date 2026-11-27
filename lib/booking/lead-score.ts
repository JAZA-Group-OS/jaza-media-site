// Book a Call lead scoring — shared by the form (options) and the server (routing).
// Edit the options or the rules here; nothing else needs to change.

export const SERVICES = ['Website', 'Systems / IT', 'CRM', 'Marketing'] as const;
export const SIZES = ['Student / personal project', 'Just me', '2–10 people', '11–50 people', '51+ people'] as const;
export const BUDGETS = ['No budget yet', 'Under ₱50k', '₱50k–₱150k', '₱150k–₱500k', '₱500k+'] as const;
export const STARTS = ['This month', 'In 1–3 months', 'Just exploring'] as const;
export const DECISION = ['Yes', 'I decide with others', 'No'] as const;

export type LeadAnswers = {
  service: (typeof SERVICES)[number];
  companySize: (typeof SIZES)[number];
  budget: (typeof BUDGETS)[number];
  start: (typeof STARTS)[number];
  decisionMaker: (typeof DECISION)[number];
};

export type Tier = 'ceo' | 'sales' | 'nurture';

/** Calendar row for each bookable tier (booking_settings.id). */
export const TIER_CALENDAR: Record<Exclude<Tier, 'nurture'>, 1 | 2> = { ceo: 1, sales: 2 };

const BUDGET_PTS = [0, 1, 2, 4, 6];
const SIZE_PTS = [0, 0, 1, 2, 3];
const START_PTS = [3, 2, 0];
const DECISION_PTS = [3, 1, 0];

export function scoreLead(a: LeadAnswers): { score: number; tier: Tier } {
  const budget = BUDGETS.indexOf(a.budget);
  const size = SIZES.indexOf(a.companySize);
  const start = STARTS.indexOf(a.start);
  const decision = DECISION.indexOf(a.decisionMaker);
  const score = BUDGET_PTS[budget] + SIZE_PTS[size] + START_PTS[start] + DECISION_PTS[decision];

  // No call: students, people just exploring, or no budget.
  if (size === 0 || a.start === 'Just exploring' || budget === 0) return { score, tier: 'nurture' };

  // CEO: big budget, the decision-maker, wants to start soon. Kept small on purpose.
  //   ₱500k+ starting within 3 months, or ₱150k–₱500k starting this month.
  const bigBudget = a.budget === '₱500k+' || (a.budget === '₱150k–₱500k' && a.start === 'This month');
  if (bigBudget && a.decisionMaker === 'Yes') return { score, tier: 'ceo' };

  // Everyone else who qualifies talks to the sales team.
  return { score, tier: 'sales' };
}
