'use client';

import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { BookingCalendar } from '@/components/partner/booking-calendar';
import { BUDGETS, DECISION, SERVICES, SIZES, STARTS, type LeadAnswers } from '@/lib/booking/lead-score';

type Contact = { fullName: string; email: string; phone: string; company: string };
type Result = { tier: 'ceo' | 'sales'; leadId: string } | { tier: 'nurture' };

const QUESTIONS: { key: keyof LeadAnswers; title: string; options: readonly string[] }[] = [
  { key: 'service', title: 'Which service do you need?', options: SERVICES },
  { key: 'companySize', title: "What's your company size?", options: SIZES },
  { key: 'budget', title: "What's your budget range?", options: BUDGETS },
  { key: 'start', title: 'When do you want to start?', options: STARTS },
  { key: 'decisionMaker', title: 'Are you the decision-maker?', options: DECISION },
];
const TOTAL = QUESTIONS.length + 1;

const INPUT =
  'w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-black/35 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/40';
const LABEL = 'mb-1.5 block text-[11px] font-medium tracking-[0.2em] text-black/55 uppercase';

export function BookACallFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<LeadAnswers>>({});
  const [contact, setContact] = useState<Contact>({ fullName: '', email: '', phone: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onContact = step === QUESTIONS.length;
  const q = QUESTIONS[step];

  function next() {
    setError(null);
    if (q && !answers[q.key]) return setError('Pick one to continue.');
    setStep((s) => s + 1);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!onContact) return next();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch('/api/book-a-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, ...contact, _hp: String(new FormData(e.currentTarget).get('_hp') ?? '') }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errs: Record<string, string> = {};
        for (const i of json.issues ?? []) errs[String(i.path[0])] = i.message;
        setFieldErrors(errs);
        setError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setResult(json as Result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Could not reach our servers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.tier === 'nurture') {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] md:p-12">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-gold/15 text-gold-deep">
          <Check className="size-6" />
        </span>
        <h2 className="mt-5 font-display text-3xl">Thanks, {contact.fullName.split(' ')[0]}.</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-black/60">
          We sent a thank-you to <strong className="text-ink">{contact.email}</strong>. Our team will look over your details and follow up with ideas
          and next steps that fit where you are right now.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.3em] text-gold-deep uppercase">You&apos;re a fit</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">
            {result.tier === 'ceo' ? 'Book a call with our CEO' : 'Book a call with our team'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[16px] text-black/60">Pick a time below. The Google Meet link goes straight to your inbox.</p>
        </div>
        <div className="booking-light mt-10">
          <BookingCalendar
            mode="book"
            leadId={result.leadId}
            prefill={{ fullName: contact.fullName, email: contact.email, phone: contact.phone }}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl">
      <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-gold-deep transition-all duration-500" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
      </div>
      <p className="mt-4 text-center text-[11px] tracking-[0.3em] text-black/45 uppercase">
        Step {String(step + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
      </p>

      <div className="mt-4 rounded-3xl border border-black/5 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
        <div className="p-6 md:p-10">
          {q ? (
            <fieldset>
              <legend className="w-full text-center font-display text-2xl md:text-3xl">{q.title}</legend>
              <div className="mt-7 grid gap-3">
                {q.options.map((opt) => {
                  const on = answers[q.key] === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-[15px] transition ${
                        on ? 'border-gold-deep bg-gold/10' : 'border-black/12 hover:border-black/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.key}
                        value={opt}
                        checked={on}
                        onChange={() => {
                          setAnswers((a) => ({ ...a, [q.key]: opt }));
                          setError(null);
                        }}
                        className="size-4 accent-[#b8902a]"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <div>
              <h2 className="text-center font-display text-2xl md:text-3xl">Where should we send the details?</h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['fullName', 'Full name', 'text', 'name', true],
                    ['email', 'Email', 'email', 'email', true],
                    ['phone', 'Phone', 'tel', 'tel', false],
                    ['company', 'Company', 'text', 'organization', false],
                  ] as const
                ).map(([key, label, type, auto, required]) => (
                  <label key={key} className="block">
                    <span className={LABEL}>
                      {label}
                      {required ? '' : ' (optional)'}
                    </span>
                    <input
                      type={type}
                      autoComplete={auto}
                      required={required}
                      value={contact[key]}
                      onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
                      className={INPUT}
                    />
                    {fieldErrors[key] ? <span className="mt-1 block text-xs text-red-600">{fieldErrors[key]}</span> : null}
                  </label>
                ))}
              </div>
              <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            </div>
          )}
          {error ? <p className="mt-5 text-center text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex items-center justify-between border-t border-black/5 px-6 py-4 md:px-10">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] text-black/55 uppercase transition hover:text-ink disabled:invisible"
          >
            <ArrowLeft className="size-4" /> Previous
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-[12px] font-semibold tracking-[0.2em] text-white uppercase transition hover:bg-black/80 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {onContact ? 'Continue' : 'Next'}
            {!submitting ? <ArrowRight className="size-4" /> : null}
          </button>
        </div>
      </div>
    </form>
  );
}
