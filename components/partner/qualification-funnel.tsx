'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QUESTIONS, TOTAL_STEPS, type Answers, type Question } from '@/lib/partner/questions';
import { qualify } from '@/lib/partner/qualify';
import { writePrefill } from '@/lib/partner/booking-prefill';
import { FunnelStepCard } from './funnel-step-card';
import { RadioOptions } from './radio-options';
import { FunnelTextInput } from './funnel-text-input';
import { ReviewAnswers } from './review-answers';

const STORAGE_KEY = 'partner-with-us:answers';

// Input caps for the free-text steps. Must stay at or below the caps in
// PartnerInquirySchema (lib/validations/partner-inquiry.ts).
const FIELD_MAX_LENGTH: Partial<Record<keyof Answers, number>> = {
  fullName: 100,
  email: 254,
  phone: 18,
  description: 500,
  challenge: 2000,
};

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

// Mount-time hydration: if the user is entering the funnel (no step param,
// or explicitly at step 1) we treat it as a fresh start and discard any
// stale answers from a prior session. Refreshing mid-funnel (?step=N for
// N >= 2) preserves their progress.
function readInitialAnswers(): Answers {
  if (typeof window === 'undefined') return {};
  const step = new URL(window.location.href).searchParams.get('step');
  if (step === null || step === '1') {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
    return {};
  }
  return readAnswers();
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

  // Lazy initializer. The component mounts client-only via next/dynamic
  // (see funnel-mount.tsx), so `window` is always available here. We
  // distinguish a fresh entry (?step=1 or no step) from a mid-funnel
  // refresh: fresh entries clear stale answers, mid-funnel refreshes
  // restore them so the user doesn't lose progress.
  const [answers, setAnswers] = useState<Answers>(() => readInitialAnswers());

  // Final-step submit guard: blocks double submits and drives the button's
  // busy state while the inquiry is being persisted.
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Validation is keyed to the step it ran on. When stepFromUrl changes,
  // the derived `error` below becomes null automatically — no effect needed.
  const [validation, setValidation] = useState<{ step: number; message: string } | null>(null);

  // Slide direction for the inter-step animation. Set right before navigation,
  // cleared once the animation finishes (cooperative — see effect below).
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(null);

  // Counter that increments on every validation failure. Passed to the card
  // as a key prop so the shake animation re-mounts and replays from frame 0.
  const [shakeKey, setShakeKey] = useState(0);

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

  // Clear slide direction shortly after the animation duration so a stale
  // direction doesn't leak into a subsequent unrelated re-render.
  useEffect(() => {
    if (!direction) return;
    const id = setTimeout(() => setDirection(null), 350);
    return () => clearTimeout(id);
  }, [direction]);

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
          setDirection('forward');
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
    setDirection('backward');
    router.push(`/partner-with-us?step=${stepFromUrl - 1}`);
  }, [router, stepFromUrl]);

  const goNext = useCallback(async () => {
    const value = answers[question.id];
    const err = validate(question, value);
    if (err) {
      setValidation({ step: stepFromUrl, message: err });
      setShakeKey((k) => k + 1);
      return;
    }
    if (stepFromUrl < TOTAL_STEPS) {
      setDirection('forward');
      router.push(`/partner-with-us?step=${stepFromUrl + 1}`);
      return;
    }
    // Final step → persist the inquiry, then qualify and route. The user is
    // NOT navigated until the API confirms the lead was saved — otherwise a
    // 4xx/5xx here would silently lose the inquiry.
    if (submitting) return;
    const outcome = qualify(answers);
    // Gate the dev log so production DevTools never sees PII (phone, email, name).
    if (process.env.NODE_ENV !== 'production') {
      console.log('partner-with-us submission', { outcome, answers });
    }
    setSubmitting(true);
    const failWith = (message: string) => {
      setSubmitting(false);
      setValidation({ step: stepFromUrl, message });
      setShakeKey((k) => k + 1);
    };
    try {
      const res = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        failWith(
          res.status === 429
            ? 'Too many submissions from your network right now. Please wait a few minutes and press Submit again — your answers are saved on this page.'
            : res.status === 400
              ? 'Some of your answers could not be accepted. Please go back, review them, and submit again.'
              : 'Something went wrong on our end and your submission was not received. Please press Submit to try again.',
        );
        return;
      }
      if (outcome === 'qualified') {
        // Mirror name/email/phone/description into the prefill blob so the
        // Calendly form on /book pre-populates without the user retyping.
        writePrefill(answers);
      }
      clearAnswers();
      // Deliberately leave `submitting` true on success so the button stays
      // disabled during the route transition.
      router.push(
        outcome === 'qualified'
          ? '/partner-with-us/book'
          : '/partner-with-us/not-qualified',
      );
    } catch {
      failWith(
        "We couldn't reach the server. Please check your connection and press Submit again — your answers are saved on this page.",
      );
    }
  }, [answers, question, router, stepFromUrl, submitting]);

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
    return (
      <FunnelTextInput
        multiline={isMultiline}
        ariaLabel={question.label}
        value={(currentValue as string | undefined) ?? ''}
        onChange={(v) => {
          // Phone field: keep digits + common separators (+, space, hyphen,
          // parens), drop anything else, and hard-cap length.
          const next = isPhone
            ? v.replace(/[^\d+()\-\s]/g, '').slice(0, 18)
            : v;
          setAnswer(question.id, next);
        }}
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
        // Hard caps mirror the server-side Zod schema (partner-inquiry.ts) so
        // a long paste can never pass client validation yet 400 at submit.
        // Phone's cap also bounds any ReDoS exposure on the regex.
        maxLength={FIELD_MAX_LENGTH[question.id]}
      />
    );
  }, [question, currentValue, setAnswer, handleRadioChange]);

  const progressPercent = (stepFromUrl / TOTAL_STEPS) * 100;

  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] text-white">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-gold/10 blur-[160px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />
    <div className="relative mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 uppercase backdrop-blur">
          <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
          Step {stepFromUrl} of {TOTAL_STEPS}
        </span>
        <h1 className="mt-6 font-serif text-[40px] leading-[1.04] tracking-[-0.03em] text-balance md:text-[60px]">
          <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">We</span>{' '}
          <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent italic">scale</em>{' '}
          <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">great companies.</span>
        </h1>
      </div>

      <div
        role="progressbar"
        aria-valuenow={stepFromUrl}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Step ${stepFromUrl} of ${TOTAL_STEPS}`}
        className="mt-10 h-1 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full bg-gradient-to-r from-[#a97a1f] via-gold to-[#fbe7a1] shadow-[0_0_12px_rgba(234,179,8,0.6)] transition-all duration-500 ease-out"
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
        <div className="relative">
          {stepFromUrl > 1 ? (
            <div
              aria-hidden
              className="absolute inset-y-4 -left-2 right-2 -z-10 rounded-3xl border border-white/5 bg-white/[0.02]"
            />
          ) : null}
          {stepFromUrl < TOTAL_STEPS ? (
            <div
              aria-hidden
              className="absolute inset-y-4 left-2 -right-2 -z-10 rounded-3xl border border-white/5 bg-white/[0.02]"
            />
          ) : null}

          <div
            key={`step-${stepFromUrl}`}
            className={
              direction === 'forward'
                ? 'relative animate-funnel-in-right'
                : direction === 'backward'
                  ? 'relative animate-funnel-in-left'
                  : 'relative'
            }
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
              shakeKey={shakeKey}
              submitting={submitting}
              onReview={() => setReviewOpen(true)}
            />
          </div>
        </div>
      </form>

      {reviewOpen ? (
        <ReviewAnswers
          answers={answers}
          submitting={submitting}
          onClose={() => setReviewOpen(false)}
          onEdit={(step) => {
            setReviewOpen(false);
            setDirection('backward');
            router.push(`/partner-with-us?step=${step}`);
          }}
          onSubmit={() => {
            setReviewOpen(false);
            goNext();
          }}
        />
      ) : null}

      {/* Screen-reader-only counter; sighted users get the same info from the
          STEP badge above and the visual progress bar. The progressbar above
          already carries an aria-valuenow + aria-label, so this paragraph is
          redundant for AT and is hidden visually as well. */}
      <p className="sr-only">
        Step {stepFromUrl} of {TOTAL_STEPS}
      </p>

      <details className="group mx-auto mt-10 max-w-2xl text-center">
        <summary className="mx-auto inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] tracking-[0.18em] text-white/55 uppercase transition hover:border-gold/40 hover:text-white [&::-webkit-details-marker]:hidden">
          Privacy &amp; consent
          <span aria-hidden className="text-gold transition-transform group-open:rotate-45">+</span>
        </summary>
        <p className="mt-4 text-[11px] leading-relaxed text-white/40">{DISCLAIMER}</p>
      </details>
    </div>
    </section>
  );
}
