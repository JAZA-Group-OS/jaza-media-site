# Partner With Us — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Partner With Us page as a 12-step single-question-per-screen qualification funnel, branded for JAZA Media, with deterministic routing to `/qualified` or `/not-qualified` outcome screens.

**Architecture:** App Router routes under `app/partner-with-us/` share a layout (Navbar + Footer + CopyrightBar). The funnel is a single client component that holds `answers` state, persists to `sessionStorage`, and uses URL search params (`?step=N`) for navigation so browser back/forward and refresh both work. Final NEXT runs a pure `qualify()` function and routes to the matching outcome page. No backend submission yet — the submit handler logs the payload to console; swapping in `fetch('/api/...')` later is a one-line change.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, TypeScript, Tailwind v4 (CSS-based config), `@base-ui/react` (RadioGroup primitives), `lucide-react` (icons). No new dependencies.

**Reference docs already verified:**
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` — **`useSearchParams` requires a `<Suspense>` boundary** in production builds; the funnel must be wrapped in one.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` — `useRouter` from `next/navigation`, `router.push`/`router.replace`.
- `node_modules/@base-ui/react/radio-group/RadioGroup.d.ts` — `RadioGroup<Value>({ value, onValueChange, name, ... })`.
- `node_modules/@base-ui/react/radio/root/RadioRoot.d.ts` — `Radio.Root({ value })` with `Radio.Indicator` child.

**Test strategy:** This repo has no test framework (only `next dev`/`build`/`start`/`lint` in `package.json`). Adding vitest+RTL+jsdom for Next 16 + Tailwind v4 is non-trivial and out of scope. Verification is via Playwright MCP walkthroughs of qualified/not-qualified/validation paths. The pure `qualify()` function is small and exhaustively walked by Playwright. If franco (QA) requires unit tests in the noxadevteam review pass, that's a follow-up.

---

## Task 1: Add the question schema

**Files:**
- Create: `lib/partner/questions.ts`

- [ ] **Step 1: Write the schema**

Create `lib/partner/questions.ts`:

```ts
export type AnswerKey =
  | 'location'
  | 'fullName'
  | 'businessType'
  | 'description'
  | 'helpType'
  | 'monthlyRevenue'
  | 'willingToInvest'
  | 'budget'
  | 'challenge'
  | 'timeline'
  | 'phone'
  | 'email';

export type Answers = Partial<{
  location: 'philippines' | 'australia' | 'others';
  fullName: string;
  businessType: 'service' | 'brick_and_mortar' | 'ecommerce' | 'software' | 'e_learning' | 'other';
  description: string;
  helpType: 'advertising' | 'media_content' | 'marketing_mgmt' | 'branding' | 'web_dev' | 'audit_growth';
  monthlyRevenue: '0' | '10k_50k' | '50k_150k' | '150k_500k' | '500k_1m' | '1m_3m';
  willingToInvest: 'yes' | 'if_proven' | 'no';
  budget: '30k_50k' | '50k_80k' | '80k_150k' | '150k_200k' | '200k_500k' | '500k_plus';
  challenge: string;
  timeline: 'asap' | 'next_month' | 'just_exploring';
  phone: string;
  email: string;
}>;

type Option<V extends string> = { value: V; label: string };

type RadioQuestion<K extends AnswerKey, V extends string> = {
  id: K;
  type: 'radio';
  label: string;
  helper?: string;
  layout: 'card-grid' | 'row-stack';
  cols: 1 | 2 | 3;
  options: Option<V>[];
};

type TextQuestion<K extends AnswerKey> = {
  id: K;
  type: 'text' | 'textarea';
  label: string;
  helper?: string;
  placeholder?: string;
};

export type Question =
  | RadioQuestion<'location', 'philippines' | 'australia' | 'others'>
  | TextQuestion<'fullName'>
  | RadioQuestion<'businessType', NonNullable<Answers['businessType']>>
  | TextQuestion<'description'>
  | RadioQuestion<'helpType', NonNullable<Answers['helpType']>>
  | RadioQuestion<'monthlyRevenue', NonNullable<Answers['monthlyRevenue']>>
  | RadioQuestion<'willingToInvest', NonNullable<Answers['willingToInvest']>>
  | RadioQuestion<'budget', NonNullable<Answers['budget']>>
  | TextQuestion<'challenge'>
  | RadioQuestion<'timeline', NonNullable<Answers['timeline']>>
  | TextQuestion<'phone'>
  | TextQuestion<'email'>;

export const QUESTIONS: Question[] = [
  {
    id: 'location',
    type: 'radio',
    label: 'Where is your business based?',
    layout: 'card-grid',
    cols: 3,
    options: [
      { value: 'philippines', label: 'PHILIPPINES' },
      { value: 'australia', label: 'AUSTRALIA' },
      { value: 'others', label: 'OTHERS' },
    ],
  },
  {
    id: 'fullName',
    type: 'text',
    label: 'What should we call you?',
    placeholder: 'Full name',
  },
  {
    id: 'businessType',
    type: 'radio',
    label: 'What type of business do you have?',
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: 'service', label: 'Service' },
      { value: 'brick_and_mortar', label: 'Brick & Mortar' },
      { value: 'ecommerce', label: 'Ecommerce' },
      { value: 'software', label: 'Software' },
      { value: 'e_learning', label: 'E-Learning' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'description',
    type: 'textarea',
    label: 'Please describe your business in 1-3 sentences MAX?',
    helper: 'Ex: I help dentists get more patients using facebook ads for ₱2000 per month.',
  },
  {
    id: 'helpType',
    type: 'radio',
    label: 'How are we going to help your business?',
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: 'advertising', label: 'Advertising Management' },
      { value: 'media_content', label: 'Media Content & ADs' },
      { value: 'marketing_mgmt', label: 'Marketing Management' },
      { value: 'branding', label: 'Branding & Strategy' },
      { value: 'web_dev', label: 'Web Development' },
      { value: 'audit_growth', label: 'Business Audit & Growth Plan' },
    ],
  },
  {
    id: 'monthlyRevenue',
    type: 'radio',
    label: "What's your average monthly revenue?",
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: '0', label: '₱0' },
      { value: '10k_50k', label: '₱10k – ₱50k' },
      { value: '50k_150k', label: '₱50k – ₱150k' },
      { value: '150k_500k', label: '₱150k – ₱500k' },
      { value: '500k_1m', label: '₱500k – ₱1M' },
      { value: '1m_3m', label: '₱1M – ₱3M' },
    ],
  },
  {
    id: 'willingToInvest',
    type: 'radio',
    label: 'Are you willing to invest in marketing to grow your business?',
    layout: 'row-stack',
    cols: 1,
    options: [
      { value: 'yes', label: 'Yes, I have a marketing budget' },
      { value: 'if_proven', label: "I'm willing if the strategy is proven" },
      { value: 'no', label: "No, I'm not ready to invest yet" },
    ],
  },
  {
    id: 'budget',
    type: 'radio',
    label: "What budget range do you currently have available to invest if we determine that we're a good fit?",
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: '30k_50k', label: '₱30,000 – ₱50,000' },
      { value: '50k_80k', label: '₱50,000 – ₱80,000' },
      { value: '80k_150k', label: '₱80,000 – ₱150,000' },
      { value: '150k_200k', label: '₱150,000 – ₱200,000' },
      { value: '200k_500k', label: '₱200,000 – ₱500,000' },
      { value: '500k_plus', label: '₱500,000+' },
    ],
  },
  {
    id: 'challenge',
    type: 'textarea',
    label: "What's your biggest business challenge right now?",
    helper: 'We want to understand your current situation',
  },
  {
    id: 'timeline',
    type: 'radio',
    label: 'How soon do you want to start working on your growth strategy?',
    layout: 'row-stack',
    cols: 1,
    options: [
      { value: 'asap', label: 'ASAP (within 1-2 weeks)' },
      { value: 'next_month', label: 'Within the next month' },
      { value: 'just_exploring', label: 'Just exploring' },
    ],
  },
  {
    id: 'phone',
    type: 'text',
    label: 'Best Contact Number',
    helper: 'In case we need to reach you',
  },
  {
    id: 'email',
    type: 'text',
    label: 'Email Address',
    helper: 'For sending your audit & updates',
  },
];

export const TOTAL_STEPS = QUESTIONS.length;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors related to `lib/partner/questions.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/partner/questions.ts
git commit -m "feat(partner): add 12-question schema for qualification funnel"
```

---

## Task 2: Add the qualification rules

**Files:**
- Create: `lib/partner/qualify.ts`

- [ ] **Step 1: Write the rules**

Create `lib/partner/qualify.ts`:

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors related to `lib/partner/qualify.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/partner/qualify.ts
git commit -m "feat(partner): add qualification rules"
```

---

## Task 3: Add the funnel step card chrome

**Files:**
- Create: `components/partner/funnel-step-card.tsx`

- [ ] **Step 1: Write the component**

Create `components/partner/funnel-step-card.tsx`:

```tsx
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Props = {
  title: string;
  helper?: string;
  body: ReactNode;
  error?: string;
  onPrev?: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export function FunnelStepCard({
  title,
  helper,
  body,
  error,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border-[3px] border-brand-black bg-surface-grey shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)]">
      <div className="px-6 py-8 md:px-12 md:py-10">
        <h2 className="text-center font-heading text-xl font-black text-brand-black md:text-2xl">
          {title}
        </h2>
        {helper ? (
          <p className="mt-2 text-center text-sm text-blue-600 italic">
            ({helper})
          </p>
        ) : null}

        <div className="mt-6 md:mt-8">{body}</div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-sm font-semibold text-tag-red"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between bg-brand-yellow px-6 py-3 md:px-10">
        {isFirst ? (
          <span aria-hidden />
        ) : (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous step"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-wider text-brand-black uppercase transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Previous
          </button>
        )}

        <button
          type="submit"
          onClick={onNext}
          aria-label={isLast ? 'Submit application' : 'Next step'}
          className="inline-flex items-center gap-2 text-sm font-bold tracking-wider text-brand-black uppercase transition-opacity hover:opacity-70"
        >
          {isLast ? 'Submit' : 'Next'}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/partner/funnel-step-card.tsx
git commit -m "feat(partner): add funnel step card chrome"
```

---

## Task 4: Add the radio options component

**Files:**
- Create: `components/partner/radio-options.tsx`

- [ ] **Step 1: Write the component**

Create `components/partner/radio-options.tsx`:

```tsx
'use client';

import { RadioGroup } from '@base-ui/react/radio-group';
import { Radio } from '@base-ui/react/radio';
import { cn } from '@/lib/utils';

type Option = { value: string; label: string };

type Props = {
  name: string;
  ariaLabel: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  layout: 'card-grid' | 'row-stack';
  cols: 1 | 2 | 3;
};

const COL_CLASS: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
};

export function RadioOptions({
  name,
  ariaLabel,
  value,
  onChange,
  options,
  layout,
  cols,
}: Props) {
  return (
    <RadioGroup
      name={name}
      aria-label={ariaLabel}
      value={value ?? ''}
      onValueChange={(v) => onChange(v as string)}
      className={cn(
        'grid gap-3',
        layout === 'card-grid' ? COL_CLASS[cols] : 'grid-cols-1',
      )}
    >
      {options.map((opt) =>
        layout === 'card-grid' ? (
          <CardOption key={opt.value} option={opt} />
        ) : (
          <RowOption key={opt.value} option={opt} />
        ),
      )}
    </RadioGroup>
  );
}

function CardOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group relative flex aspect-[5/3] cursor-pointer flex-col items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-6 text-center transition-colors',
        'hover:border-neutral-500',
        'has-[[data-checked]]:border-brand-black has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-brand-black/20',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'absolute top-3 left-3 grid size-4 place-items-center rounded-full border border-neutral-400 bg-white',
          'data-[checked]:border-brand-black',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-brand-black opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="mt-1 text-sm font-medium text-brand-black md:text-base">
        {option.label}
      </span>
    </label>
  );
}

function RowOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-md border border-neutral-300 bg-white px-4 py-3 transition-colors',
        'hover:border-neutral-500',
        'has-[[data-checked]]:border-brand-black has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-brand-black/20',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'grid size-4 place-items-center rounded-full border border-neutral-400 bg-white',
          'data-[checked]:border-brand-black',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-brand-black opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="text-sm font-medium text-brand-black">
        {option.label}
      </span>
    </label>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/partner/radio-options.tsx
git commit -m "feat(partner): add radio options component (card grid + row stack)"
```

---

## Task 5: Add the funnel text input component

**Files:**
- Create: `components/partner/funnel-text-input.tsx`

- [ ] **Step 1: Write the component**

Create `components/partner/funnel-text-input.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';

type Props = {
  multiline?: boolean;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'email';
  type?: 'text' | 'tel' | 'email';
};

export function FunnelTextInput({
  multiline = false,
  value,
  onChange,
  ariaLabel,
  placeholder,
  inputMode,
  type = 'text',
}: Props) {
  const baseClass = cn(
    'w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm text-brand-black outline-none transition-colors',
    'placeholder:text-neutral-400',
    'focus:border-brand-black focus:ring-2 focus:ring-brand-black/20',
  );

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={cn(baseClass, 'resize-y')}
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
    />
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/partner/funnel-text-input.tsx
git commit -m "feat(partner): add funnel text input + textarea component"
```

---

## Task 6: Add the qualification funnel client component

**Files:**
- Create: `components/partner/qualification-funnel.tsx`

- [ ] **Step 1: Write the component**

Create `components/partner/qualification-funnel.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QUESTIONS, TOTAL_STEPS, type Answers, type Question } from '@/lib/partner/questions';
import { qualify } from '@/lib/partner/qualify';
import { FunnelStepCard } from './funnel-step-card';
import { RadioOptions } from './radio-options';
import { FunnelTextInput } from './funnel-text-input';

const STORAGE_KEY = 'partner-with-us:answers';

const DISCLAIMER =
  'By providing your information today, you are giving consent for us or our partners, to contact you by mail, phone, text, or email using automated telephone dialing systems to the data provided, even if the phone number is present on a state or national Do Not Call list. You further consent to receiving AI-generated autodialed and/or artificial or prerecorded voice calls or texts. We do not sell your personal information to other companies, and you can withdraw consent at any time. Consent is not a condition of any purchase. By submitting this form, you agree to our Privacy Policy and Terms of Service.';

function readAnswers(): Answers {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

function writeAnswers(a: Answers) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    // sessionStorage may be unavailable (private mode); silently no-op.
  }
}

function clearAnswers() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

function firstIncompleteIndex(a: Answers): number {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const v = a[q.id];
    if (v === undefined || v === '') return i;
  }
  return QUESTIONS.length - 1;
}

function validate(question: Question, value: unknown): string | null {
  if (question.type === 'radio') {
    return typeof value === 'string' && value.length > 0
      ? null
      : 'Please select an option to continue.';
  }

  const v = typeof value === 'string' ? value.trim() : '';

  if (question.id === 'fullName') {
    return v.length >= 2 ? null : 'Please enter your full name.';
  }
  if (question.id === 'description') {
    if (v.length < 10) return 'Please write at least one short sentence.';
    if (v.length > 500) return 'Please keep this under 500 characters.';
    return null;
  }
  if (question.id === 'challenge') {
    return v.length >= 5 ? null : 'Please describe your biggest challenge.';
  }
  if (question.id === 'phone') {
    return /^[+\d][\d\s()-]{6,}$/.test(v)
      ? null
      : 'Please enter a valid contact number.';
  }
  if (question.id === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? null
      : 'Please enter a valid email address.';
  }

  return null;
}

export function QualificationFunnel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate answers from sessionStorage on mount.
  useEffect(() => {
    setAnswers(readAnswers());
    setHydrated(true);
  }, []);

  const rawStep = searchParams.get('step');
  const parsed = rawStep ? Number.parseInt(rawStep, 10) : 1;
  const stepFromUrl =
    Number.isFinite(parsed) && parsed >= 1 && parsed <= TOTAL_STEPS
      ? parsed
      : 1;

  // Redirect invalid steps and any deep-link past the first incomplete step.
  useEffect(() => {
    if (!hydrated) return;
    if (rawStep === null) return; // initial paint at /partner-with-us is fine.
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > TOTAL_STEPS) {
      router.replace('/partner-with-us?step=1');
      return;
    }
    const maxAllowed = firstIncompleteIndex(answers) + 1;
    if (parsed > maxAllowed) {
      router.replace(`/partner-with-us?step=${maxAllowed}`);
    }
  }, [hydrated, rawStep, parsed, answers, router]);

  // Reset error on step change.
  useEffect(() => {
    setError(null);
  }, [stepFromUrl]);

  const stepIndex = stepFromUrl - 1;
  const question = QUESTIONS[stepIndex];

  // Avoid a flash of the wrong step before sessionStorage hydrates.
  if (!hydrated) {
    return null;
  }

  const setAnswer = useCallback(
    (id: keyof Answers, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value } as Answers;
        writeAnswers(next);
        return next;
      });
    },
    [],
  );

  const goPrev = useCallback(() => {
    if (stepFromUrl <= 1) return;
    router.push(`/partner-with-us?step=${stepFromUrl - 1}`);
  }, [router, stepFromUrl]);

  const goNext = useCallback(() => {
    const value = answers[question.id];
    const err = validate(question, value);
    if (err) {
      setError(err);
      return;
    }
    if (stepFromUrl < TOTAL_STEPS) {
      router.push(`/partner-with-us?step=${stepFromUrl + 1}`);
      return;
    }
    // Final step → qualify and route.
    const outcome = qualify(answers);
    // Submission point: replace with `await fetch('/api/partner', ...)` when API exists.
    if (typeof console !== 'undefined') {
      console.log('partner-with-us submission', { outcome, answers });
    }
    clearAnswers();
    router.push(
      outcome === 'qualified'
        ? '/partner-with-us/qualified'
        : '/partner-with-us/not-qualified',
    );
  }, [answers, question, router, stepFromUrl]);

  const body = useMemo(() => {
    if (question.type === 'radio') {
      return (
        <RadioOptions
          name={question.id}
          ariaLabel={question.label}
          value={answers[question.id] as string | undefined}
          onChange={(v) => setAnswer(question.id, v)}
          options={question.options}
          layout={question.layout}
          cols={question.cols}
        />
      );
    }
    const isMultiline = question.type === 'textarea';
    const isPhone = question.id === 'phone';
    const isEmail = question.id === 'email';
    return (
      <FunnelTextInput
        multiline={isMultiline}
        ariaLabel={question.label}
        value={(answers[question.id] as string | undefined) ?? ''}
        onChange={(v) => setAnswer(question.id, v)}
        placeholder={question.placeholder}
        type={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
        inputMode={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
      />
    );
  }, [question, answers, setAnswer]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        <span className="inline-block rounded-md bg-brand-yellow px-5 py-1.5 font-heading text-sm font-black tracking-wider text-brand-black uppercase">
          Step {stepFromUrl}
        </span>
        <h1 className="mt-6 font-heading text-3xl leading-tight font-black tracking-tight text-brand-black md:text-5xl">
          WE{' '}
          <em className="font-black text-brand-yellow italic">SCALE</em>{' '}
          GREAT COMPANIES.
        </h1>
      </div>

      <form
        className="mt-10"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
      >
        <FunnelStepCard
          title={question.label}
          helper={question.helper}
          body={body}
          error={error ?? undefined}
          onPrev={goPrev}
          onNext={goNext}
          isFirst={stepFromUrl === 1}
          isLast={stepFromUrl === TOTAL_STEPS}
        />
      </form>

      <p
        aria-live="polite"
        className="mt-4 text-center text-xs font-medium text-text-muted"
      >
        Step {stepFromUrl} of {TOTAL_STEPS}
      </p>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-text-muted">
        {DISCLAIMER}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/partner/qualification-funnel.tsx
git commit -m "feat(partner): add qualification funnel client component"
```

---

## Task 7: Add the partner-with-us layout

**Files:**
- Create: `app/partner-with-us/layout.tsx`

- [ ] **Step 1: Write the layout**

Create `app/partner-with-us/layout.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CopyrightBar } from '@/components/copyright-bar';

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/partner-with-us/layout.tsx
git commit -m "feat(partner): add layout sharing navbar/footer/copyright"
```

---

## Task 8: Add the funnel page (with Suspense)

**Files:**
- Create: `app/partner-with-us/page.tsx`

The Next.js 16 docs are explicit: **client components using `useSearchParams` must be wrapped in `<Suspense>`** or production builds fail with the "Missing Suspense boundary with useSearchParams" error. Without this wrapper the page works in `next dev` but breaks `next build`.

- [ ] **Step 1: Write the page**

Create `app/partner-with-us/page.tsx`:

```tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { QualificationFunnel } from '@/components/partner/qualification-funnel';

export const metadata: Metadata = {
  title: 'Partner With Us — JAZA Media',
  description:
    'Apply to work with JAZA Media. Tell us about your business and we will determine if we are a fit to scale you.',
};

function FunnelFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="h-[600px] animate-pulse rounded-xl bg-surface-grey" />
    </div>
  );
}

export default function PartnerWithUsPage() {
  return (
    <Suspense fallback={<FunnelFallback />}>
      <QualificationFunnel />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/partner-with-us/page.tsx
git commit -m "feat(partner): add funnel page with Suspense boundary"
```

---

## Task 9: Add the qualified outcome page

**Files:**
- Create: `app/partner-with-us/qualified/page.tsx`

- [ ] **Step 1: Write the page**

Create `app/partner-with-us/qualified/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "You're a Fit — JAZA Media",
};

export default function QualifiedPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:py-24">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
        Thanks — you're a{' '}
        <em className="font-black text-brand-yellow italic">fit</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-neutral-700 md:text-base">
        We'll be in touch within 48 hours to schedule your strategy call.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-bold tracking-wider text-brand-black uppercase transition-transform hover:scale-[1.02]"
      >
        Back to Home
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/partner-with-us/qualified/page.tsx
git commit -m "feat(partner): add qualified outcome page"
```

---

## Task 10: Add the not-qualified outcome page

**Files:**
- Create: `app/partner-with-us/not-qualified/page.tsx`

- [ ] **Step 1: Inspect the existing `MarketingTemplatesCard`**

Run: `cat components/marketing-templates-card.tsx | head -40`
This is to confirm the export name and any required props before reusing it. Verify it default-exports or named-exports a usable component, and confirm whether it self-styles or expects a wrapper.

If the component does not look right for the not-qualified screen as-is (e.g. it's tightly coupled to the homepage layout), inline the equivalent JSX directly in this page rather than forcing reuse. Note the choice in the commit message.

- [ ] **Step 2: Write the page**

Create `app/partner-with-us/not-qualified/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { MarketingTemplatesCard } from '@/components/marketing-templates-card';

export const metadata: Metadata = {
  title: 'Application Update — JAZA Media',
};

export default function NotQualifiedPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:py-20">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
        Sorry! You're{' '}
        <em className="font-black text-brand-yellow italic">NOT</em> Yet
        Qualified
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-sm text-neutral-700 md:text-base">
        Thank you for your interest in working with JAZA Media. After reviewing
        your details, it seems you're not quite ready to move forward with us
        at this time.
      </p>

      <p className="mt-6 font-heading text-lg font-black text-brand-black md:text-xl">
        Stay Connected with Us!
      </p>

      <div className="mt-8">
        <MarketingTemplatesCard />
      </div>

      <p className="mx-auto mt-8 max-w-xl text-sm text-neutral-700 md:text-base">
        We appreciate your interest in JAZA Media and wish you continued success
        on your journey. While you work toward meeting the requirements above,
        you may download the JAZA Media Marketing Template for FREE. This
        template will help you stay updated on market trends and serve as a
        practical guide to improving and growing your business.
      </p>
    </div>
  );
}
```

If Step 1 found that `MarketingTemplatesCard` is unsuitable for direct reuse here, inline the relevant JSX in place of `<MarketingTemplatesCard />` and remove the import. Do not modify `components/marketing-templates-card.tsx` itself in this task.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/partner-with-us/not-qualified/page.tsx
git commit -m "feat(partner): add not-qualified outcome page"
```

---

## Task 11: Wire navbar + footer "Partner With Us" links

**Files:**
- Modify: `components/navbar.tsx:1-7`
- Modify: `components/footer.tsx:1-7`

Both `NAV_LINKS` arrays currently have `{ label: 'Partner With Us', href: '#' }`. Update only that entry's href in both files.

- [ ] **Step 1: Update navbar link**

In `components/navbar.tsx`, change:
```ts
{ label: "Partner With Us", href: "#" },
```
to:
```ts
{ label: "Partner With Us", href: "/partner-with-us" },
```

- [ ] **Step 2: Update footer link**

In `components/footer.tsx`, change:
```ts
{ label: "Partner With Us", href: "#" },
```
to:
```ts
{ label: "Partner With Us", href: "/partner-with-us" },
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/navbar.tsx components/footer.tsx
git commit -m "feat(partner): link navbar + footer entries to /partner-with-us"
```

---

## Task 12: Verify with Playwright — qualified path (happy path)

**Files:**
- None modified.

The user has Playwright MCP installed. Note from user memory: **clean up `.playwright-mcp/` and any `*.png` artifacts the tool drops in the project root after the session.**

- [ ] **Step 1: Start the dev server**

Run in background: `cd /c/Users/regid/Desktop/jaza-media-site && npm run dev`
Wait for "Ready" or "started server on" line. Note the port (default 3000).

- [ ] **Step 2: Navigate to /partner-with-us**

Use `mcp__plugin_playwright_playwright__browser_navigate` to `http://localhost:3000/partner-with-us`.

Expected: header shows "STEP 1" + "WE SCALE GREAT COMPANIES.", card shows "Where is your business based?" with three card-grid options, NEXT visible (no PREVIOUS), counter "Step 1 of 12", disclaimer below.

- [ ] **Step 3: Walk the qualified path**

Click through with these answers (each click should advance the URL `?step=`):

| Step | Action |
|------|--------|
| 1    | Click PHILIPPINES card → NEXT |
| 2    | Type "Test User" → NEXT |
| 3    | Click Service → NEXT |
| 4    | Type "I help local restaurants get more bookings via Instagram ads." → NEXT |
| 5    | Click Advertising Management → NEXT |
| 6    | Click ₱150k – ₱500k → NEXT |
| 7    | Click "Yes, I have a marketing budget" → NEXT |
| 8    | Click ₱150,000 – ₱200,000 → NEXT |
| 9    | Type "We can't keep our pipeline full." → NEXT |
| 10   | Click ASAP → NEXT |
| 11   | Type "+63 917 123 4567" → NEXT |
| 12   | Type "test@example.com" → SUBMIT |

Expected: lands on `/partner-with-us/qualified`. Header shows "Thanks — you're a fit." Page shows JAZA logo block + 48-hour message + Back to Home button.

Verify console output via `mcp__plugin_playwright_playwright__browser_console_messages`: should see one log line `partner-with-us submission { outcome: 'qualified', answers: { ... all 12 ... } }`.

- [ ] **Step 4: Verify sessionStorage was cleared**

Run via `mcp__plugin_playwright_playwright__browser_evaluate`:
```js
() => window.sessionStorage.getItem('partner-with-us:answers')
```
Expected: `null`.

- [ ] **Step 5: Document the result**

If anything failed, do not proceed — fix and re-walk before moving to the next task.

---

## Task 13: Verify with Playwright — not-qualified path

**Files:**
- None modified.

- [ ] **Step 1: Reset to /partner-with-us**

Use `mcp__plugin_playwright_playwright__browser_navigate` to `http://localhost:3000/partner-with-us`.

- [ ] **Step 2: Walk a path that triggers a disqualifier**

| Step | Action |
|------|--------|
| 1    | PHILIPPINES → NEXT |
| 2    | "Jane" → NEXT |
| 3    | Service → NEXT |
| 4    | "Just trying to figure out marketing for my new shop." → NEXT |
| 5    | Branding & Strategy → NEXT |
| 6    | ₱0 → NEXT |
| 7    | Yes I have a marketing budget → NEXT |
| 8    | ₱150,000 – ₱200,000 → NEXT |
| 9    | "I have no idea where to start." → NEXT |
| 10   | ASAP → NEXT |
| 11   | "+63 917 999 8888" → NEXT |
| 12   | "jane@example.com" → SUBMIT |

Expected: lands on `/partner-with-us/not-qualified`. Page shows "Sorry! You're NOT Yet Qualified" heading, JAZA branding, MarketingTemplatesCard.

Console message should show `outcome: 'not_qualified'`.

- [ ] **Step 3: Walk a second disqualifier path** (timeline = just exploring)

Reset to `/partner-with-us`. Repeat with: PH / "Jane" / Service / "Just exploring at the moment." / Web Development / ₱150k–₱500k / Yes / ₱200k–₱500k / "Still figuring it out." / **Just exploring** / "+63 917 999 0000" / "jane2@example.com".

Expected: lands on `/not-qualified` again. Confirms the timeline disqualifier works.

---

## Task 14: Verify with Playwright — validation, refresh, deep-link

**Files:**
- None modified.

- [ ] **Step 1: Validation error appears for empty step**

Navigate to `/partner-with-us`. Click NEXT without selecting an option.
Expected: red error text "Please select an option to continue." appears above the yellow nav bar. URL unchanged.

Click PHILIPPINES, click NEXT.
Expected: error clears, advances to `?step=2`.

- [ ] **Step 2: Validation for text fields**

On `?step=2`, click NEXT with empty input.
Expected: "Please enter your full name."

Type "A" → NEXT.
Expected: "Please enter your full name." (still — min 2 chars).

Type "Al" → NEXT.
Expected: advances to `?step=3`.

- [ ] **Step 3: Refresh persistence**

On `?step=3`, click "Service". Refresh the page.
Expected: stays on `?step=3`, card shows "What type of business do you have?", "Service" appears selected (selected radio shows the inner dot).

- [ ] **Step 4: Deep-link past incomplete step**

Navigate to `http://localhost:3000/partner-with-us?step=10`.
Expected: redirects to `?step=4` (next incomplete step) since steps 1–3 are filled.

- [ ] **Step 5: Invalid `?step` value**

Navigate to `http://localhost:3000/partner-with-us?step=foo`.
Expected: redirects to `?step=1`.

Navigate to `?step=99`.
Expected: redirects to `?step=1`.

- [ ] **Step 6: Browser back from outcome page**

Walk to qualified or not-qualified, then click browser back.
Expected: lands on `/partner-with-us` with `?step=1` (or no step), starts fresh — sessionStorage was cleared on submit.

- [ ] **Step 7: Document the result**

If any check fails, fix the underlying logic in `components/partner/qualification-funnel.tsx` and re-verify.

---

## Task 15: Production build check

**Files:**
- None modified.

This is the gate that catches the `useSearchParams` Suspense issue, since `next dev` doesn't enforce it but `next build` does.

- [ ] **Step 1: Stop the dev server**

If still running, stop the background `npm run dev` process.

- [ ] **Step 2: Run production build**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npm run build`
Expected: build completes without errors. Output should list `/partner-with-us`, `/partner-with-us/qualified`, `/partner-with-us/not-qualified` among the routes.

If you see "Missing Suspense boundary with useSearchParams", revisit Task 8 — the page must wrap `<QualificationFunnel />` in `<Suspense>`.

- [ ] **Step 3: Lint pass**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && npm run lint`
Expected: no errors. Warnings are acceptable but should be reviewed.

---

## Task 16: Cleanup Playwright artifacts

**Files:**
- Delete (if present): `.playwright-mcp/`, any `*.png` that the Playwright tool dropped in the project root during this session.

Per user memory: clean up `.playwright-mcp/` and screenshot PNGs the tool drops into the project root after every Playwright session.

- [ ] **Step 1: List artifacts**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && ls -la .playwright-mcp 2>/dev/null; ls *.png 2>/dev/null`
Note anything that exists.

- [ ] **Step 2: Remove them**

Run: `cd /c/Users/regid/Desktop/jaza-media-site && rm -rf .playwright-mcp && rm -f desktop-*.png mobile-*.png faq-*.png vercel-*.png 2>/dev/null; git status --short`
Only delete files in the project root, not in subdirectories. Confirm `git status` shows them gone if they were tracked, or simply gone if untracked.

(Existing screenshots in `/c/Users/regid/Desktop/` outside this project are not yours to clean.)

---

## Task 17: Dispatch noxadevteam review pass

**Files:**
- None modified by this task itself; follow-up commits address review feedback.

User instructed: "make sure this changes was approve in the respected agent in /noxadevteam to finish this feature."

- [ ] **Step 1: Spawn relevant specialists in parallel**

The specialists most relevant to this feature:
- **jazelei** (Frontend Engineer) — React 19, Tailwind v4, accessibility, design quality
- **gemini** (UI/UX Designer) — visual polish vs the mockups
- **custodio** (Security Engineer) — PII handling on phone/email, sessionStorage exposure, XSS via the `console.log` payload, redirect safety
- **franco** (QA Engineer) — validation edge cases, browser-back/refresh, missing-test-coverage call-out
- **manny** (Product Manager) — feature completeness vs spec, copy
- **bryl** (PM/Team Lead) — scope/risk, follow-ups for noxadevteam

Use the Agent tool to dispatch them in parallel (single message, multiple Agent calls). Each prompt must:
1. State the goal (review the Partner With Us qualification funnel feature).
2. Point at the spec (`docs/superpowers/specs/2026-04-27-partner-with-us-design.md`) and plan (`docs/superpowers/plans/2026-04-27-partner-with-us.md`).
3. List the files added/modified in this feature (paste the file list from this plan's Tasks 1–11).
4. Ask for a verdict (approved / approved-with-suggestions / blocking-issues) plus a punch list under 200 words.

- [ ] **Step 2: Consolidate feedback**

Collect verdicts. If any are "blocking-issues", create new tasks to address each blocker before declaring the feature done.

- [ ] **Step 3: Address blocking feedback**

For each blocking item, make the fix as a focused commit, then re-verify with Playwright if it touches behavior.

- [ ] **Step 4: Final commit + summary**

Once all blockers are cleared and verifiers pass, summarize for the user: routes added, key files, total commits, and any non-blocking suggestions deferred to follow-ups.

---

## Self-review checklist (run before handing off)

**Spec coverage:**
- 12 questions schema → Task 1 ✓
- Qualification rules → Task 2 ✓
- Card chrome with yellow nav bar → Task 3 ✓
- Card-grid + row-stack radio → Task 4 ✓
- Text input + textarea → Task 5 ✓
- Funnel client component (state, sessionStorage, URL nav, validation, qualify, route) → Task 6 ✓
- Layout sharing Navbar/Footer/CopyrightBar → Task 7 ✓
- Page with Suspense → Task 8 ✓
- Qualified outcome page → Task 9 ✓
- Not-qualified outcome page (Image #7) → Task 10 ✓
- Navbar/footer link wiring → Task 11 ✓
- Refresh/deep-link/invalid-step edge cases → Task 14 ✓
- Production-build gate (catches Suspense issue) → Task 15 ✓
- Playwright cleanup → Task 16 ✓
- noxadevteam review gate → Task 17 ✓

**Type consistency:**
- `Answers` type defined in Task 1, used in Tasks 2, 6, 12, 13.
- `qualify(a: Answers)` returns `'qualified' | 'not_qualified'`; outcome string drives `router.push` to matching route paths in Task 6.
- `QUESTIONS` array index = step - 1 throughout.

**Placeholders:** none — every step has either runnable code, an exact command, or a concrete user action.

**Files inventory (final):**
- `lib/partner/questions.ts`, `lib/partner/qualify.ts`
- `components/partner/funnel-step-card.tsx`, `radio-options.tsx`, `funnel-text-input.tsx`, `qualification-funnel.tsx`
- `app/partner-with-us/layout.tsx`, `page.tsx`, `qualified/page.tsx`, `not-qualified/page.tsx`
- Modifications: `components/navbar.tsx`, `components/footer.tsx`
