'use client';

import { ArrowLeft, ArrowRight, Check, Copy, Crown, Loader2, ShieldCheck, Users } from 'lucide-react';
import Image from 'next/image';
import { useState, type FormEvent } from 'react';

import { BookingCalendar } from '@/components/partner/booking-calendar';
import { GCASH } from '@/lib/booking/gcash';
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

const INPUT =
  'w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-black/35 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/40';
const LABEL = 'mb-1.5 block text-[11px] font-medium tracking-[0.2em] text-black/55 uppercase';

export function BookACallFlow() {
  const [path, setPath] = useState<'ceo' | 'sales' | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<LeadAnswers>>({});
  const [contact, setContact] = useState<Contact>({ fullName: '', email: '', phone: '', company: '' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // CEO: payment → contact. Sales team: 5 questions → contact.
  const total = path === 'ceo' ? 2 : QUESTIONS.length + 1;
  const onContact = step === total - 1;
  const onPayment = path === 'ceo' && step === 0;
  const q = path === 'sales' ? QUESTIONS[step] : undefined;

  function next() {
    setError(null);
    setFieldErrors({});
    if (q && !answers[q.key]) return setError('Pick one to continue.');
    if (onPayment && paymentRef.trim().length < 6) {
      setFieldErrors({ paymentRef: 'Enter the GCash reference number' });
      return setError('Enter your GCash reference number to continue.');
    }
    setStep((s) => s + 1);
  }

  function back() {
    setError(null);
    setFieldErrors({});
    if (step === 0) return setPath(null);
    setStep((s) => s - 1);
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
        body: JSON.stringify({ path, ...(path === 'ceo' ? { paymentRef } : answers), ...contact, _hp: String(new FormData(e.currentTarget).get('_hp') ?? '') }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errs: Record<string, string> = {};
        for (const i of json.issues ?? []) errs[String(i.path[0])] = i.message;
        setFieldErrors(errs);
        if (errs.paymentRef) setStep(0);
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
          <p className="text-[11px] font-medium tracking-[0.3em] text-gold-deep uppercase">{result.tier === 'ceo' ? 'Reference saved' : 'You\u2019re a fit'}</p>
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

  if (!path) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl md:text-4xl">Who would you like to talk to?</h2>
        <p className="mx-auto mt-3 max-w-lg text-[16px] text-black/60">Pick one to get started.</p>
        <div className="mt-12 grid gap-5 text-left sm:grid-cols-2">
          {(
            [
              {
                id: 'sales',
                Icon: Users,
                tag: 'Complimentary · 30 min',
                title: 'Book with our Sales team',
                body: 'Answer five quick questions so we come prepared, then choose a time that suits you.',
                points: ['Tailored to your goals', 'Google Meet invite by email'],
              },
              {
                id: 'ceo',
                Icon: Crown,
                tag: '',
                title: 'Book with our CEO',
                body: 'A one-on-one strategy session with our CEO. Secure your slot via GCash, then pick a time.',
                points: ['Direct access to the CEO', 'Priority scheduling'],
              },
            ] as const
          ).map(({ id, Icon, tag, title, body, points }) => {
            const dark = id === 'ceo';
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPath(id);
                  setStep(0);
                  setError(null);
                }}
                className={`group relative flex flex-col overflow-hidden rounded-[28px] border p-8 transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 md:p-9 ${
                  dark
                    ? 'border-gold/25 bg-[linear-gradient(160deg,#1b1914_0%,#0e0e0f_70%)] text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] hover:shadow-[0_50px_90px_-40px_rgba(0,0,0,0.8)]'
                    : 'border-gold bg-gold text-ink shadow-[0_30px_60px_-35px_rgba(184,144,42,0.6)] hover:shadow-[0_40px_80px_-35px_rgba(184,144,42,0.7)]'
                }`}
              >
                {dark ? <span aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" /> : null}
                <span className="flex items-center justify-between">
                  <span
                    className={`grid size-11 place-items-center rounded-full ring-1 ${
                      dark ? 'bg-gold/10 text-gold ring-gold/40' : 'bg-white/40 text-ink ring-ink/15'
                    }`}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  {tag ? <span className={`text-[10.5px] font-medium tracking-[0.24em] uppercase ${dark ? 'text-gold' : 'text-ink/70'}`}>{tag}</span> : null}
                </span>
                <span className="mt-7 font-display text-[28px] leading-tight">{title}</span>
                <span className={`mt-3 text-[15px] leading-relaxed ${dark ? 'text-white/60' : 'text-ink/70'}`}>{body}</span>
                <span className={`mt-6 space-y-2 border-t pt-5 ${dark ? 'border-white/10' : 'border-ink/15'}`}>
                  {points.map((pt) => (
                    <span key={pt} className={`flex items-center gap-2.5 text-[14px] ${dark ? 'text-white/75' : 'text-ink/80'}`}>
                      <Check className={`size-4 ${dark ? 'text-gold' : 'text-ink'}`} strokeWidth={2} />
                      {pt}
                    </span>
                  ))}
                </span>
                <span
                  className={`careers-shine mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[12px] font-semibold tracking-[0.22em] uppercase transition duration-300 ${
                    dark
                      ? 'bg-gold text-ink group-hover:bg-[#f7d24a] group-hover:shadow-[0_12px_30px_-10px_rgba(234,179,8,0.55)]'
                      : 'bg-ink text-white group-hover:bg-black group-hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  Continue
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={`mx-auto ${onPayment ? 'max-w-3xl' : 'max-w-2xl'}`}>
      <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-gold-deep transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <p className={`text-center text-[11px] tracking-[0.3em] text-black/45 uppercase ${onPayment ? 'mt-2.5' : 'mt-4'}`}>
        Step {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>

      <div className="mt-4 rounded-3xl border border-black/5 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
        <div className={onPayment ? 'p-5 md:px-8 md:py-6' : 'p-6 md:p-10'}>
          {onPayment ? (
            <div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-3 text-[10.5px] font-medium tracking-[0.3em] text-gold-deep uppercase">
                  <span aria-hidden className="h-px w-6 bg-gold-deep/50" />
                  CEO strategy session
                  <span aria-hidden className="h-px w-6 bg-gold-deep/50" />
                </p>
                <h2 className="mt-2 font-display text-[26px] leading-tight md:text-[30px]">Secure your session</h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[200px_1fr]">
                {/* QR pass */}
                <div className="relative overflow-hidden rounded-[20px] border border-gold/25 bg-[linear-gradient(160deg,#1b1914_0%,#0e0e0f_75%)] p-4 text-center text-white shadow-[0_30px_60px_-35px_rgba(0,0,0,0.7)]">
                  <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                  <p className="text-[10px] tracking-[0.3em] text-gold uppercase">Scan to pay</p>
                  <div className="relative mx-auto mt-3 aspect-square w-full max-w-[160px] rounded-xl bg-white">
                    <Image src={GCASH.qrSrc} alt="GCash QR code" fill sizes="160px" className="object-contain p-2" />
                  </div>
                  <p className="mt-3 text-[11.5px] text-white/50">Open GCash › Pay QR</p>
                </div>

                {/* details */}
                <div className="flex flex-col rounded-[20px] border border-black/[0.07] bg-[#fcfaf5] px-5 py-4">
                  <p className="text-[10.5px] tracking-[0.24em] text-black/45 uppercase">Amount due</p>
                  <p className="mt-1 font-display text-[34px] leading-none text-ink">{GCASH.amount}</p>
                  <dl className="mt-3 divide-y divide-black/[0.07] border-y border-black/[0.07] text-[14px]">
                    <div className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="whitespace-nowrap text-black/50">GCash number</dt>
                      <dd className="flex items-center gap-2 whitespace-nowrap font-medium tracking-wide text-ink">
                        {GCASH.number}
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(GCASH.number.replace(/\s/g, '')).then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1600);
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium tracking-[0.12em] text-black/60 uppercase transition hover:border-gold-deep hover:text-gold-deep"
                        >
                          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-black/50">Account name</dt>
                      <dd className="font-medium text-ink">{GCASH.name}</dd>
                    </div>
                  </dl>
                  <ol className="mt-3 space-y-1.5 text-[13px] text-black/60">
                    {['Scan the QR or send to the number', 'Pay the exact amount', 'Enter your reference number below'].map((t, i) => (
                      <li key={t} className="flex items-center gap-3">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <label className="mt-4 block">
                <span className={LABEL}>GCash reference number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="e.g. 1234 567 890123"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className={`${INPUT} text-[16px] tracking-[0.08em]`}
                />
                {fieldErrors.paymentRef ? <span className="mt-1 block text-xs text-red-600">{fieldErrors.paymentRef}</span> : null}
              </label>
              <p className="mt-2 flex items-start gap-2 text-[12px] leading-relaxed text-black/45">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-deep" strokeWidth={1.75} />
                Every payment is verified before your session.
              </p>
            </div>
          ) : q ? (
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
            onClick={back}
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] text-black/55 uppercase transition hover:text-ink"
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
