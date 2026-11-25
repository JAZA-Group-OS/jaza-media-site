'use client';

import { CalendarX, Loader2, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BookingCalendar } from '@/components/partner/booking-calendar';

type View = { start: string; end: string; status: 'confirmed' | 'cancelled'; fullName: string; meetUrl: string | null };

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export function ManageBooking({ token }: { token: string }) {
  const [b, setB] = useState<View | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<'view' | 'reschedule'>('view');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch(`/api/booking/manage?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (r) => (r.ok ? setB(await r.json()) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [token]);

  async function cancel() {
    if (!confirming) return setConfirming(true);
    setBusy(true);
    setError(null);
    const res = await fetch('/api/booking/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', token }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setB(json);
      setNotice('Your call is cancelled. A confirmation is on its way to your inbox.');
    } else setError(json.error ?? 'Could not cancel. Please try again.');
  }

  const past = b ? Date.parse(b.start) < now : false;

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#0b0d0c] px-4 py-14 text-white md:py-20">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-gold/10 blur-[170px]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.03em] md:text-[56px]">
          Manage your <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">call.</em>
        </h1>

        {notFound && (
          <p className="mt-8 text-white/65">
            We couldn&apos;t find this booking. Check the link in your email, or contact{' '}
            <a className="text-gold" href="mailto:admin@jazamedia.com">admin@jazamedia.com</a>.
          </p>
        )}
        {!b && !notFound && <Loader2 className="mx-auto mt-10 size-6 animate-spin text-gold" />}

        {b && (
          <div className="mt-10 rounded-[24px] border border-gold/30 bg-[linear-gradient(180deg,#1a1913_0%,#0f0f10_80%)] p-7 text-left">
            <p className="text-[10.5px] tracking-[0.3em] text-gold uppercase">
              {b.status === 'cancelled' ? 'Cancelled' : past ? 'Past call' : 'Upcoming call'}
            </p>
            <p className={`mt-2 font-serif text-[28px] leading-tight ${b.status === 'cancelled' ? 'text-white/40 line-through' : ''}`}>{fmt(b.start)}</p>
            <p className="mt-1 text-[14px] text-white/55">Discovery &amp; Strategy Meeting · {b.fullName}</p>
            {notice && <p className="mt-4 text-sm text-gold">{notice}</p>}
            {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}

            {b.status === 'confirmed' && !past && mode === 'view' && (
              <div className="mt-6 flex flex-wrap gap-3">
                {b.meetUrl && (
                  <a href={b.meetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase hover:bg-white">
                    <Video className="size-4" /> Join Google Meet
                  </a>
                )}
                <button type="button" onClick={() => setMode('reschedule')} className="rounded-full border border-gold/50 px-6 py-3 text-[12px] tracking-[0.14em] uppercase hover:bg-gold/10">
                  Reschedule
                </button>
                <button type="button" onClick={cancel} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[12px] tracking-[0.14em] text-white/70 uppercase hover:border-red-400/60 hover:text-red-300 disabled:opacity-60">
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <CalendarX className="size-4" />} {confirming ? 'Tap again to confirm' : 'Cancel call'}
                </button>
              </div>
            )}
            {b.status === 'cancelled' && (
              <Link href="/partner-with-us/book" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase hover:bg-white">
                Book a new time
              </Link>
            )}
          </div>
        )}

        {b && mode === 'reschedule' && (
          <div className="mt-6 rounded-[28px] bg-gradient-to-b from-gold/50 via-white/10 to-white/[0.03] p-px text-left">
            <div className="rounded-[27px] bg-[linear-gradient(180deg,#171612_0%,#0f0f10_80%)]">
              <BookingCalendar
                mode="reschedule"
                token={token}
                onDone={(start) => {
                  setB({ ...b, start });
                  setMode('view');
                  setNotice('Done — your call has moved. We emailed you the updated invite.');
                }}
              />
            </div>
            <button type="button" onClick={() => setMode('view')} className="mt-3 w-full text-center text-[12px] tracking-[0.14em] text-white/50 uppercase hover:text-white">
              Keep my current time
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
