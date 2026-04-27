'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // Lazy initializer reads sessionStorage on first render. This component
  // is wrapped in <Suspense> at app/partner-with-us/page.tsx, and per
  // Next.js 16 rules a useSearchParams client component renders only on
  // the client up to that boundary — so `window` is always available here.
  const [answers, setAnswers] = useState<Answers>(() => readAnswers());

  // Validation is keyed to the step it ran on. When stepFromUrl changes,
  // the derived `error` below becomes null automatically — no effect needed.
  const [validation, setValidation] = useState<{ step: number; message: string } | null>(null);

  // Heading ref for moving focus on step change (a11y).
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Pending auto-advance timer for radio steps. We schedule on radio change
  // and cleanup on step change so back-navigation, manual NEXT, or rapid
  // arrow-key navigation never produces a stale advance.
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rawStep = searchParams.get('step');
  const parsed = rawStep ? Number.parseInt(rawStep, 10) : 1;
  const stepFromUrl =
    Number.isFinite(parsed) && parsed >= 1 && parsed <= TOTAL_STEPS
      ? parsed
      : 1;

  // Redirect invalid steps and any deep-link past the first incomplete step.
  // Effect runs on URL/answer changes; router.replace is an external action,
  // not a setState, so this doesn't trigger the cascading-render lint rule.
  useEffect(() => {
    if (rawStep === null) return; // initial paint at /partner-with-us is fine.
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > TOTAL_STEPS) {
      router.replace('/partner-with-us?step=1');
      return;
    }
    const maxAllowed = firstIncompleteIndex(answers) + 1;
    if (parsed > maxAllowed) {
      router.replace(`/partner-with-us?step=${maxAllowed}`);
    }
  }, [rawStep, parsed, answers, router]);

  const stepIndex = stepFromUrl - 1;
  const question = QUESTIONS[stepIndex];
  const currentValue = answers[question.id];
  const error = validation?.step === stepFromUrl ? validation.message : null;

  // Move focus to the step heading when the URL step changes — predictable
  // for keyboard/screen-reader users and dismisses any previously open
  // virtual keyboard on mobile after a text-step advance.
  useEffect(() => {
    titleRef.current?.focus();
  }, [stepFromUrl]);

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

  // Auto-advance on radio selection (matches acquisition.com flow). Wraps
  // setAnswer and queues a step advance after a short delay so the user sees
  // the radio dot fill before the slide. The clear-and-reschedule pattern
  // means keyboard users arrowing through options don't trigger advance on
  // every keypress — only when they pause on their choice.
  const handleRadioChange = useCallback(
    (id: keyof Answers, value: string) => {
      setAnswer(id, value);
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = setTimeout(() => {
        // Defensive guard: all current radio questions are mid-funnel, but if
        // a radio ever lands on the final step we still want manual submit.
        if (stepFromUrl < TOTAL_STEPS) {
          router.push(`/partner-with-us?step=${stepFromUrl + 1}`);
        }
      }, 350);
    },
    [setAnswer, router, stepFromUrl],
  );

  // Cancel any pending auto-advance when the step changes for any reason
  // (manual NEXT, PREVIOUS, deep-link, browser back/forward).
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, [stepFromUrl]);

  const goPrev = useCallback(() => {
    if (stepFromUrl <= 1) return;
    router.push(`/partner-with-us?step=${stepFromUrl - 1}`);
  }, [router, stepFromUrl]);

  const goNext = useCallback(() => {
    const value = answers[question.id];
    const err = validate(question, value);
    if (err) {
      setValidation({ step: stepFromUrl, message: err });
      return;
    }
    if (stepFromUrl < TOTAL_STEPS) {
      router.push(`/partner-with-us?step=${stepFromUrl + 1}`);
      return;
    }
    // Final step → qualify and route.
    const outcome = qualify(answers);
    // Submission point: replace with `await fetch('/api/partner', ...)` when API exists.
    // Gate the dev log so production DevTools never sees PII (phone, email, name).
    if (process.env.NODE_ENV !== 'production') {
      console.log('partner-with-us submission', { outcome, answers });
    }
    clearAnswers();
    router.push(
      outcome === 'qualified'
        ? '/partner-with-us/qualified'
        : '/partner-with-us/not-qualified',
    );
  }, [answers, question, router, stepFromUrl]);

  // Dep on `currentValue` (not the whole `answers` object) so this memo doesn't
  // bust on every keystroke of an unrelated text field.
  const body = useMemo(() => {
    if (question.type === 'radio') {
      return (
        <RadioOptions
          name={question.id}
          ariaLabel={question.label}
          value={currentValue as string | undefined}
          onChange={(v) => handleRadioChange(question.id, v)}
          options={question.options}
          layout={question.layout}
          cols={question.cols}
        />
      );
    }
    const isMultiline = question.type === 'textarea';
    const isPhone = question.id === 'phone';
    const isEmail = question.id === 'email';
    const isDescription = question.id === 'description';
    return (
      <FunnelTextInput
        multiline={isMultiline}
        ariaLabel={question.label}
        value={(currentValue as string | undefined) ?? ''}
        onChange={(v) => setAnswer(question.id, v)}
        placeholder={question.placeholder}
        type={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
        inputMode={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
        autoComplete={
          isEmail
            ? 'email'
            : isPhone
              ? 'tel'
              : question.id === 'fullName'
                ? 'name'
                : undefined
        }
        // Phone gets a hard cap to bound any ReDoS exposure on the regex.
        // Description has its own 500-char content rule but cap input too.
        maxLength={isPhone ? 20 : isDescription ? 500 : undefined}
      />
    );
  }, [question, currentValue, setAnswer, handleRadioChange]);

  const progressPercent = (stepFromUrl / TOTAL_STEPS) * 100;

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

      <div
        role="progressbar"
        aria-valuenow={stepFromUrl}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Step ${stepFromUrl} of ${TOTAL_STEPS}`}
        className="mt-8 h-2 w-full overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full bg-brand-yellow transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <form
        className="mt-6"
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
          isFirst={stepFromUrl === 1}
          isLast={stepFromUrl === TOTAL_STEPS}
          titleRef={titleRef}
        />
      </form>

      {/* Screen-reader-only counter; sighted users get the same info from the
          STEP badge above and the visual progress bar. The progressbar above
          already carries an aria-valuenow + aria-label, so this paragraph is
          redundant for AT and is hidden visually as well. */}
      <p className="sr-only">
        Step {stepFromUrl} of {TOTAL_STEPS}
      </p>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-text-muted">
        {DISCLAIMER}
      </p>
    </div>
  );
}
