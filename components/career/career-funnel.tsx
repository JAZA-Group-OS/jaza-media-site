'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  QUESTIONS,
  TOTAL_STEPS,
  type Answers,
  type Question,
  type UploadedFile,
} from '@/lib/career/questions';
import { FunnelStepCard } from '@/components/partner/funnel-step-card';
import { RadioOptions } from '@/components/partner/radio-options';
import { FunnelTextInput } from '@/components/partner/funnel-text-input';
import { FunnelFileInput } from './funnel-file-input';

const STORAGE_KEY = 'careers-apply:answers';

const DISCLAIMER =
  'By providing your information today, you are giving consent for us or our partners to contact you by mail, phone, text, or email. We do not sell your personal information to other companies, and you can withdraw consent at any time. By submitting this form, you agree to our Privacy Policy and Terms of Service.';

function readAnswers(): Answers {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

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
    // no-op
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

function isAnswered(q: Question, value: unknown): boolean {
  if (q.type === 'radio') return typeof value === 'string' && value.length > 0;
  if (q.type === 'file') {
    return (
      !!value &&
      typeof value === 'object' &&
      typeof (value as UploadedFile).url === 'string'
    );
  }
  return typeof value === 'string' && value.trim().length > 0;
}

function firstIncompleteIndex(a: Answers): number {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    if (!isAnswered(q, a[q.id])) return i;
  }
  return QUESTIONS.length - 1;
}

function validate(question: Question, value: unknown): string | null {
  if (question.type === 'radio') {
    return typeof value === 'string' && value.length > 0
      ? null
      : 'Please select an option to continue.';
  }
  if (question.type === 'file') {
    return value && typeof value === 'object' && (value as UploadedFile).url
      ? null
      : 'Please upload a file to continue.';
  }

  const v = typeof value === 'string' ? value.trim() : '';

  if (question.id === 'fullName') {
    return v.length >= 2 ? null : 'Please enter your full name.';
  }
  if (question.id === 'description') {
    if (v.length < 10) return 'Please write at least one short sentence.';
    if (v.length > 1000) return 'Please keep this under 1000 characters.';
    return null;
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
  if (question.id === 'facebook') {
    return v.length >= 4 ? null : 'Please provide your Facebook profile.';
  }

  return null;
}

export function CareerFunnel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [answers, setAnswers] = useState<Answers>(() => readInitialAnswers());
  const [validation, setValidation] = useState<{
    step: number;
    message: string;
  } | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(
    null,
  );
  const [shakeKey, setShakeKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rawStep = searchParams.get('step');
  const parsed = rawStep ? Number.parseInt(rawStep, 10) : 1;
  const stepFromUrl =
    Number.isFinite(parsed) && parsed >= 1 && parsed <= TOTAL_STEPS
      ? parsed
      : 1;

  useEffect(() => {
    if (rawStep === null) return;
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > TOTAL_STEPS) {
      router.replace('/careers/apply?step=1');
      return;
    }
    const maxAllowed = firstIncompleteIndex(answers) + 1;
    if (parsed > maxAllowed) {
      router.replace(`/careers/apply?step=${maxAllowed}`);
    }
  }, [rawStep, parsed, answers, router]);

  const stepIndex = stepFromUrl - 1;
  const question = QUESTIONS[stepIndex];
  const currentValue = answers[question.id];
  const error = validation?.step === stepFromUrl ? validation.message : null;

  useEffect(() => {
    titleRef.current?.focus();
  }, [stepFromUrl]);

  useEffect(() => {
    if (!direction) return;
    const id = setTimeout(() => setDirection(null), 350);
    return () => clearTimeout(id);
  }, [direction]);

  const setAnswer = useCallback(
    <K extends keyof Answers>(id: K, value: Answers[K]) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value } as Answers;
        writeAnswers(next);
        return next;
      });
    },
    [],
  );

  const handleRadioChange = useCallback(
    (id: keyof Answers, value: string) => {
      setAnswer(id, value as Answers[keyof Answers]);
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = setTimeout(() => {
        if (stepFromUrl < TOTAL_STEPS) {
          setDirection('forward');
          router.push(`/careers/apply?step=${stepFromUrl + 1}`);
        }
      }, 350);
    },
    [setAnswer, router, stepFromUrl],
  );

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
    router.push(`/careers/apply?step=${stepFromUrl - 1}`);
  }, [router, stepFromUrl]);

  const submitApplication = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/career-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? 'Failed to submit application');
      }
      clearAnswers();
      router.push('/careers/apply/thank-you');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit application';
      setValidation({ step: stepFromUrl, message });
      setShakeKey((k) => k + 1);
      setSubmitting(false);
    }
  }, [answers, router, stepFromUrl, submitting]);

  const goNext = useCallback(() => {
    const value = answers[question.id];
    const err = validate(question, value);
    if (err) {
      setValidation({ step: stepFromUrl, message: err });
      setShakeKey((k) => k + 1);
      return;
    }
    if (stepFromUrl < TOTAL_STEPS) {
      setDirection('forward');
      router.push(`/careers/apply?step=${stepFromUrl + 1}`);
      return;
    }
    void submitApplication();
  }, [answers, question, router, stepFromUrl, submitApplication]);

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
    if (question.type === 'file') {
      return (
        <FunnelFileInput
          ariaLabel={question.label}
          value={currentValue as UploadedFile | undefined}
          onChange={(file) =>
            setAnswer(question.id, file as Answers[typeof question.id])
          }
          accept={question.accept}
          maxSizeBytes={question.maxSizeBytes}
          bucket={question.bucket}
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
        onChange={(v) =>
          setAnswer(question.id, v as Answers[typeof question.id])
        }
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
        maxLength={isPhone ? 20 : isDescription ? 1000 : undefined}
      />
    );
  }, [question, currentValue, setAnswer, handleRadioChange]);

  const progressPercent = (stepFromUrl / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl leading-tight font-black tracking-tight text-brand-black md:text-5xl">
          QUALIFICATION FORM
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
        <div className="relative">
          {stepFromUrl > 1 ? (
            <div
              aria-hidden
              className="absolute inset-y-4 -left-2 right-2 -z-10 rounded-2xl border border-neutral-200 bg-white shadow-md"
            />
          ) : null}
          {stepFromUrl < TOTAL_STEPS ? (
            <div
              aria-hidden
              className="absolute inset-y-4 left-2 -right-2 -z-10 rounded-2xl border border-neutral-200 bg-white shadow-md"
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
            />
          </div>
        </div>
      </form>

      <p className="sr-only">
        Step {stepFromUrl} of {TOTAL_STEPS}
      </p>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-text-muted">
        {DISCLAIMER}
      </p>
    </div>
  );
}
