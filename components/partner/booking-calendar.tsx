'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { clearPrefill, readPrefill, type BookingPrefill } from '@/lib/partner/booking-prefill';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const INPUT =
  'w-full rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition focus:outline-none focus-visible:border-gold/60 focus-visible:ring-2 focus-visible:ring-gold/60';
const LABEL = 'mb-1.5 block text-[10.5px] font-medium tracking-[0.2em] text-white/70 uppercase';

function localTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function dayKey(iso: string, tz: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

function timeLabel(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
}

function longDate(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });
}

type Props =
  | { mode: 'book' }
  | { mode: 'reschedule'; token: string; onDone: (start: string) => void };

export function BookingCalendar(props: Props) {
  const router = useRouter();
  const [tz] = useState(localTz);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickedMonth, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [prefill] = useState<BookingPrefill>(() => (props.mode === 'book' ? readPrefill() : {}));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const q = props.mode === 'reschedule' ? `?token=${encodeURIComponent(props.token)}` : '';
      const res = await fetch(`/api/booking/slots${q}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load times');
      setSlots(json.slots);
      setSlotMinutes(json.slotMinutes);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load times');
    }
  }

  useEffect(() => {
    // Defer so the fetch's state updates never run synchronously in the effect.
    void Promise.resolve().then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of slots ?? []) {
      const k = dayKey(s, tz);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return map;
  }, [slots, tz]);

  // Open on the month of the first available day until the visitor pages.
  const month = useMemo(() => {
    if (pickedMonth || !slots) return pickedMonth;
    const first = slots[0] ? dayKey(slots[0], tz) : dayKey(new Date().toISOString(), tz);
    const [y, m] = first.split('-').map(Number);
    return { y, m: m - 1 };
  }, [pickedMonth, slots, tz]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: slot,
          fullName: String(fd.get('fullName') ?? ''),
          email: String(fd.get('email') ?? ''),
          phone: String(fd.get('phone') ?? '') || null,
          description: String(fd.get('description') ?? '') || null,
          timezone: tz,
          _hp: String(fd.get('_hp') ?? ''),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        clearPrefill();
        const params = new URLSearchParams({ start: json.start ?? slot });
        if (json.manageToken) params.set('token', json.manageToken);
        router.push(`/partner-with-us/booked?${params}`);
        return;
      }
      if (res.status === 409) {
        setSlot(null);
        await load();
      }
      const errs: Record<string, string> = {};
      for (const i of json.issues ?? []) errs[String(i.path[0])] = i.message;
      setFieldErrors(errs);
      setError(json.error ?? 'Something went wrong. Please try again.');
    } catch {
      setError('Could not reach our servers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmReschedule() {
    if (props.mode !== 'reschedule' || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule', token: props.token, start: slot }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return props.onDone(json.start);
      if (res.status === 409) {
        setSlot(null);
        await load();
      }
      setError(json.error ?? 'Something went wrong. Please try again.');
    } catch {
      setError('Could not reach our servers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- states ---------- */

  if (loadError) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-white/70">{loadError}</p>
        <p className="text-sm text-white/50">
          You can also email <a className="text-gold" href="mailto:admin@jazamedia.com">admin@jazamedia.com</a> and we&apos;ll set up your call.
        </p>
        <button type="button" onClick={() => { setLoadError(null); load(); }} className="rounded-full border border-gold/50 px-5 py-2.5 text-[12px] tracking-[0.14em] text-gold uppercase hover:bg-gold/10">
          Try again
        </button>
      </div>
    );
  }
  if (!slots || !month) {
    return (
      <div className="flex min-h-[420px] items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-gold" />
        <span className="sr-only">Loading available times</span>
      </div>
    );
  }

  /* ---------- details form (book mode, after a time is picked) ---------- */

  if (slot && props.mode === 'book') {
    return (
      <form onSubmit={submit} noValidate className="relative p-6 md:p-8">
        <button type="button" onClick={() => setSlot(null)} className="inline-flex items-center gap-2 text-[12px] tracking-[0.14em] text-gold uppercase hover:text-white">
          <ArrowLeft className="size-4" /> Change time
        </button>
        <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/[0.06] px-5 py-4">
          <p className="text-[10.5px] tracking-[0.3em] text-gold uppercase">Your call</p>
          <p className="mt-1.5 font-serif text-[24px] leading-tight text-white">
            {longDate(dayKey(slot, tz))} · {timeLabel(slot, tz)}
          </p>
          <p className="mt-1 text-[13px] text-white/55">
            {slotMinutes} minutes · Google Meet · {tz.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="fullName" required defaultValue={prefill.fullName} autoComplete="name" error={fieldErrors.fullName} />
          <Field label="Email" name="email" type="email" required defaultValue={prefill.email} autoComplete="email" error={fieldErrors.email} />
          <div className="sm:col-span-2">
            <Field label="Best contact number" name="phone" defaultValue={prefill.phone} autoComplete="tel" error={fieldErrors.phone} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={LABEL}>Tell us about your business</label>
            <textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={prefill.description} className={`${INPUT} resize-none`} />
          </div>
        </div>
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="careers-shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>
    );
  }

  /* ---------- calendar + times ---------- */

  const first = new Date(Date.UTC(month.y, month.m, 1));
  const daysInMonth = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(first.getUTCDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month.y}-${String(month.m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
  ];
  const keys = [...byDay.keys()];
  const firstKey = keys[0];
  const lastKey = keys[keys.length - 1];
  const monthKey = `${month.y}-${String(month.m + 1).padStart(2, '0')}`;
  const canPrev = firstKey ? firstKey.slice(0, 7) < monthKey : false;
  const canNext = lastKey ? lastKey.slice(0, 7) > monthKey : false;
  const shift = (n: number) => {
    const d = new Date(Date.UTC(month.y, month.m + n, 1));
    setMonth({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
    setDay(null);
  };
  const times = day ? byDay.get(day) ?? [] : [];

  return (
    <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_220px] md:p-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[26px] text-white">
            {first.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous month" disabled={!canPrev} onClick={() => shift(-1)} className="grid size-10 place-items-center rounded-full border border-white/12 text-white/80 transition hover:border-gold/50 hover:text-gold disabled:opacity-30">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => shift(1)} className="grid size-10 place-items-center rounded-full border border-white/12 text-white/80 transition hover:border-gold/50 hover:text-gold disabled:opacity-30">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {keys.length === 0 ? (
          <p className="mt-10 text-center text-white/60">
            No open times right now. Email <a className="text-gold" href="mailto:admin@jazamedia.com">admin@jazamedia.com</a> and we&apos;ll fit you in.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label="Choose a date">
            {WEEKDAYS.map((w) => (
              <span key={w} className="pb-2 text-[10.5px] tracking-[0.2em] text-white/40 uppercase">{w}</span>
            ))}
            {cells.map((k, i) => {
              if (!k) return <span key={`e${i}`} />;
              const open = byDay.has(k);
              const selected = day === k;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!open}
                  aria-pressed={selected}
                  aria-label={`${longDate(k)}${open ? '' : ', unavailable'}`}
                  onClick={() => setDay(k)}
                  className={`relative mx-auto grid aspect-square w-full max-w-[52px] place-items-center rounded-full text-[15px] transition ${
                    selected
                      ? 'bg-gold font-semibold text-ink shadow-[0_0_18px_-2px_rgba(255,202,38,0.6)]'
                      : open
                        ? 'bg-gold/10 font-medium text-gold hover:bg-gold/20'
                        : 'text-white/25'
                  }`}
                >
                  {Number(k.slice(8))}
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-white/50">
          <Globe className="size-3.5" /> Times shown in {tz.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="md:border-l md:border-white/[0.08] md:pl-6">
        {day ? (
          <>
            <p className="text-[10.5px] tracking-[0.3em] text-gold uppercase">{longDate(day)}</p>
            <ul className="mt-4 grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-1">
              {times.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => setSlot(t)}
                    aria-pressed={slot === t}
                    className={`w-full rounded-xl border px-4 py-3 text-[14px] font-medium transition ${
                      slot === t ? 'border-gold bg-gold text-ink' : 'border-gold/35 text-white hover:border-gold hover:bg-gold/10'
                    }`}
                  >
                    {timeLabel(t, tz)}
                  </button>
                </li>
              ))}
            </ul>
            {props.mode === 'reschedule' && slot && (
              <button
                type="button"
                onClick={confirmReschedule}
                disabled={submitting}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase hover:bg-white disabled:opacity-60"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Move my call here
              </button>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
          </>
        ) : (
          <p className="text-[14px] leading-[1.7] text-white/50">Pick a highlighted date to see open times.</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue} autoComplete={autoComplete} className={INPUT} />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
