# Partner With Us — Qualification Funnel

**Status:** Design approved (awaiting written-spec review)
**Date:** 2026-04-27
**Owner:** jaza.intern@gmail.com

## Goal

Ship the Partner With Us page as a 12-step qualification funnel modeled on `acquisition.com/apply`, branded for JAZA Media. Each question lives on its own screen with PREVIOUS/NEXT navigation. On final submit, route the user to `/qualified` or `/not-qualified` based on a deterministic rules function.

## Non-goals

- No backend submission. Final-step "submit" calls `console.log({ outcome, answers })` and routes to the outcome page. The form is structured so swapping in `fetch('/api/...')` later is a one-line change.
- No Calendly / booking integration on the qualified screen. A "Send Us Message" CTA reuses the footer link style.
- No analytics/tracking events.
- No i18n.

## Routes

```
app/partner-with-us/
  layout.tsx                ← Navbar + children + Footer + CopyrightBar
  page.tsx                  ← server, renders <QualificationFunnel />
  qualified/page.tsx        ← static outcome
  not-qualified/page.tsx    ← static outcome (Image #7)
```

The home page composes Navbar/Footer/CopyrightBar inline in `app/page.tsx`. For the funnel + two outcome pages we use a layout to avoid duplicating chrome on three routes. `AnnouncementBanner` stays home-only.

## Step navigation

URL search param: `/partner-with-us?step=1` through `?step=12`.

- NEXT: validate current answer → save → `router.push('?step=N+1')`.
- PREVIOUS: `router.push('?step=N-1')`. Hidden on Q1.
- Final NEXT (Q12): validate → run `qualify(answers)` → clear `sessionStorage` → `router.push('/partner-with-us/qualified' | '/partner-with-us/not-qualified')`.
- Browser back/forward works for free.
- Deep-linking to `?step=N` with earlier answers missing redirects to the first incomplete step.
- Refresh restores answers from `sessionStorage` and current step from URL.

## State

Single client component (`qualification-funnel.tsx`) with a typed `useState<Answers>` and a setter helper. Persist to `sessionStorage` (key `partner-with-us:answers`) on every change. Clear on successful submit.

```ts
type Answers = {
  location?: 'philippines' | 'australia' | 'others';
  fullName?: string;
  businessType?: 'service' | 'brick_and_mortar' | 'ecommerce' | 'software' | 'e_learning' | 'other';
  description?: string;
  helpType?: 'advertising' | 'media_content' | 'marketing_mgmt' | 'branding' | 'web_dev' | 'audit_growth';
  monthlyRevenue?: '0' | '10k_50k' | '50k_150k' | '150k_500k' | '500k_1m' | '1m_3m';
  willingToInvest?: 'yes' | 'if_proven' | 'no';
  budget?: '30k_50k' | '50k_80k' | '80k_150k' | '150k_200k' | '200k_500k' | '500k_plus';
  challenge?: string;
  timeline?: 'asap' | 'next_month' | 'just_exploring';
  phone?: string;
  email?: string;
};
```

## Question schema (`lib/partner/questions.ts`)

12 questions, each declaring `id`, `type` (`'radio' | 'text' | 'textarea'`), `label`, optional `helper`, `layout` (`'card-grid' | 'row-stack' | null`), `cols` (1 | 2 | 3), and `options` for radio types.

| # | id              | type     | label                                                                       | layout      | cols | options                                                                                                                                |
|---|-----------------|----------|-----------------------------------------------------------------------------|-------------|------|----------------------------------------------------------------------------------------------------------------------------------------|
| 1 | location        | radio    | Where is your business based?                                               | card-grid   | 3    | PHILIPPINES, AUSTRALIA, OTHERS                                                                                                         |
| 2 | fullName        | text     | What should we call you?                                                    | —           | —    | placeholder "Full name"                                                                                                                |
| 3 | businessType    | radio    | What type of business do you have?                                          | card-grid   | 2    | Service, Brick & Mortar, Ecommerce, Software, E-Learning, Other                                                                        |
| 4 | description     | textarea | Please describe your business in 1-3 sentences MAX?                         | —           | —    | helper "Ex: I help dentists get more patients using facebook ads for ₱2000 per month."                                                 |
| 5 | helpType        | radio    | How are we going to help your business?                                     | card-grid   | 2    | Advertising Management, Media Content & ADs, Marketing Management, Branding & Strategy, Web Development, Business Audit & Growth Plan |
| 6 | monthlyRevenue  | radio    | What's your average monthly revenue?                                        | card-grid   | 2    | ₱0, ₱10k–₱50k, ₱50k–₱150k, ₱150k–₱500k, ₱500k–₱1M, ₱1M–₱3M                                                                             |
| 7 | willingToInvest | radio    | Are you willing to invest in marketing to grow your business?               | row-stack   | 1    | Yes I have a marketing budget; I'm willing if the strategy is proven; No I'm not ready to invest yet                                   |
| 8 | budget          | radio    | What budget range do you currently have available to invest if we determine that we're a good fit? | card-grid | 2 | ₱30,000–₱50,000, ₱50,000–₱80,000, ₱80,000–₱150,000, ₱150,000–₱200,000, ₱200,000–₱500,000, ₱500,000+ |
| 9 | challenge       | textarea | What's your biggest business challenge right now?                           | —           | —    | helper "We want to understand your current situation"                                                                                  |
| 10| timeline        | radio    | How soon do you want to start working on your growth strategy?              | row-stack   | 1    | ASAP (within 1-2 weeks); Within the next month; Just exploring                                                                         |
| 11| phone           | text     | Best Contact Number                                                         | —           | —    | helper "In case we need to reach you"                                                                                                  |
| 12| email           | text     | Email Address                                                               | —           | —    | helper "For sending your audit & updates"                                                                                              |

**Cosmetic fixes applied to mockup:**
- Q6 "150k - 100k" → "150k–500k" (typo).
- Q6 monthly revenue values prefixed with ₱ for consistency with Q8.

**Q5 is single-select (radio).** Phrasing reads plural but the mockup shows radio dots; matching the visual. Multi-select is treated as a follow-up (see Edge cases).

## Components

```
components/partner/
  qualification-funnel.tsx     ← "use client", state, step routing, nav, sessionStorage sync
  funnel-step-card.tsx         ← card chrome (gray body, black border, yellow nav bar, header, body)
  radio-options.tsx            ← grid (1/2/3 cols) of radio cards or row stack — controlled by `layout` prop
  funnel-text-input.tsx        ← single component for text input + textarea (multiline prop)
```

`radio-options.tsx` and `funnel-text-input.tsx` each combine two visually similar variants behind a prop to avoid duplication. Each unit takes a question schema entry + value + onChange.

## Visual treatment

- **Above card:** yellow `STEP N` pill (`bg-brand-yellow text-brand-black`, `rounded-md`, bold uppercase). Below it, heading "WE *SCALE* GREAT COMPANIES." (`font-heading text-3xl md:text-5xl font-black`) with `SCALE` in italic yellow (`<em class="text-brand-yellow not-italic font-black italic">`). The badge advances per step.
- **Card:** `bg-surface-grey` body, ~3px solid `border-brand-black`, ~10px corners, drop shadow. Centered title in `font-heading font-black`. Optional helper text under title in italic blue (`text-blue-600 italic text-sm`). Footer is a solid `bg-brand-yellow` band with PREVIOUS (left, hidden on Q1) and NEXT (right) — `font-bold uppercase tracking-wider text-brand-black` with `lucide-react` `ArrowLeft`/`ArrowRight` icons.
- **Card-grid radio (Q1, Q3, Q5, Q6, Q8):** `grid grid-cols-1 md:grid-cols-{cols}`, gap-3. Each option = white-bg card with thin neutral border, radio dot top-left, label centered. Hover: subtle border darken. Selected: border becomes `brand-black`, radio dot fills.
- **Row-stack radio (Q7, Q10):** stacked rows, white bg, thin neutral border, radio dot left + label right with px-4 py-3.
- **Text input (Q2, Q11, Q12):** full-width, white bg, thin border, py-3 px-4. Helper text above (italic blue) when present.
- **Textarea (Q4, Q9):** same treatment, ~120px tall. Helper text above.
- **Below card:** small muted "Step X of 12" counter (`aria-live="polite"`, `text-text-muted text-xs`), then consent disclaimer paragraph copied verbatim from Image #1 (`text-text-muted text-xs leading-relaxed max-w-2xl mx-auto`).
- **Mobile:** all radio grids collapse to 1 col; heading scales `text-3xl → text-5xl`; card padding compresses (`p-6 → p-10`).

## Validation

Required-checks. Error appears inline above the yellow nav bar on NEXT click. Never disable the NEXT button — opaque to users. Errors clear on next change.

| Q     | Rule                                                  |
|-------|-------------------------------------------------------|
| radio | one option selected                                   |
| 2     | name length ≥ 2                                       |
| 4     | description length 10–500                             |
| 9     | challenge length ≥ 5                                  |
| 11    | phone matches `/^[+\d][\d\s()-]{6,}$/` (≥7 digits)    |
| 12    | email matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`          |

## Qualification rules (`lib/partner/qualify.ts`)

```ts
export function qualify(a: Answers): 'qualified' | 'not_qualified' {
  if (a.willingToInvest === 'no') return 'not_qualified';
  if (a.timeline === 'just_exploring') return 'not_qualified';
  if (a.budget === '30k_50k') return 'not_qualified';
  if (a.monthlyRevenue === '0') return 'not_qualified';
  return 'qualified';
}
```

Top-of-file `DISQUALIFIERS` const so non-engineers can read/edit the rules without touching the function body.

## Outcome screens

**`/partner-with-us/qualified`** — centered: JAZA logo block, "Thanks — you're a fit." heading, subhead "We'll be in touch within 48 hours.", "Send Us Message" CTA reusing footer button style. No booking link.

**`/partner-with-us/not-qualified`** — matches Image #7 verbatim: JAZA logo block, "Sorry! You're NOT Yet Qualified" heading (NOT in brand-yellow), thank-you paragraph, "Stay Connected with Us!" subhead, reuse of `MarketingTemplatesCard` for the download CTA, closing paragraph.

## Accessibility

- Each step is a `<form>` with `onSubmit` for NEXT (Enter key advances).
- Radios use `@base-ui/react/radio-group` with proper `aria-labelledby` on the group bound to the question heading.
- Inputs have associated `<label>` (visually shown via the question heading; semantic `<label>` connects to input).
- Focus moves to the first interactive element on step change.
- Step counter is `aria-live="polite"`.
- PREV/NEXT buttons have `aria-label` including the step direction ("Previous step", "Next step", "Submit").

## Edge cases

- **Refresh mid-funnel:** restore `answers` from `sessionStorage`; restore step from URL.
- **Deep-link to `?step=10` without earlier answers:** redirect to first incomplete step.
- **Back button from `/qualified` or `/not-qualified`:** `sessionStorage` cleared on submit, so user lands on `?step=1` with empty state.
- **Invalid `?step` param** (`?step=foo`, `?step=99`): redirect to `?step=1`.
- **Q5 multi-select toggle:** if requested later, fork a parallel `checkbox-options.tsx` against `@base-ui/react/checkbox-group` and change Q5's `type` to `'checkbox'`. Not in this scope.

## Review gate

Per user instruction: after implementation, dispatch `/noxadevteam` (or the relevant subset: `jazelei`, `gemini`, `custodio`, `franco`, `manny`, `bryl`) to review the feature. Address feedback before declaring done.
