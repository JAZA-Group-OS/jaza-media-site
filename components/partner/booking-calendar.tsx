'use client';

import { ChevronLeft, ChevronRight, Clock, Globe } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Day = { date: string; spots: string[] };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * JAZA-styled date & time picker. Shows the discovery call's real free slots
 * (from /api/partner/availability) and hands the chosen start time back.
 * Calls onUnavailable if availability can't be loaded, so the page can fall
 * back to the standard Calendly calendar.
 */
export function BookingCalendar({
  onPick,
  onUnavailable,
}: {
  onPick: (startTime: string) => void;
  onUnavailable: () => void;
}) {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila', []);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [cache, setCache] = useState<Record<string, Day[]>>({});
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const month = ym(cursor);
  const days = cache[month];
  const loading = !days && !error;

  useEffect(() => {
    if (cache[month]) return;
    let alive = true;
    fetch(`/api/partner/availability?month=${month}&tz=${encodeURIComponent(tz)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { days: Day[] }) => {
        if (!alive) return;
        setCache((c) => ({ ...c, [month]: d.days }));
        // first load: preselect the first available day
        setSelected((s) => s ?? d.days[0]?.date ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
        onUnavailable();
      });
    return () => {
      alive = false;
    };
  }, [month, tz, cache, onUnavailable]);

  const byDate = useMemo(() => new Map((days ?? []).map((d) => [d.date, d.spots])), [days]);
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const canPrev = cursor > thisMonth;

  const first = cursor.getDay();
  const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const spots = selected ? (byDate.get(selected) ?? []) : [];
  const selectedLabel = selected
    ? new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';
  const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz });
  const tzLabel = tz.replace(/_/g, ' ');

  const shift = (n: number) => {
    setSelected(null);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));
  };

  return (
    <div className="grid gap-0 text-white md:grid-cols-[1.25fr_1fr]">
      {/* month grid */}
      <div className="border-white/10 p-6 md:border-r md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[26px] leading-none">{monthLabel}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => shift(-1)}
              disabled={!canPrev}
              aria-label="Previous month"
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-gold/60 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Next month"
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-gold/60 hover:text-gold"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-2 text-[10.5px] tracking-[0.2em] text-white/40 uppercase">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const date = `${month}-${String(d).padStart(2, '0')}`;
            const available = byDate.has(date);
            const isSel = selected === date;
            return (
              <button
                key={i}
                type="button"
                disabled={!available}
                onClick={() => setSelected(date)}
                aria-pressed={isSel}
                aria-label={`${date}${available ? ', available' : ', unavailable'}`}
                className={`relative mx-auto grid aspect-square w-full max-w-[52px] place-items-center rounded-full text-[15px] transition ${
                  isSel
                    ? 'bg-gold font-semibold text-ink shadow-[0_0_18px_3px_rgba(234,179,8,0.45)]'
                    : available
                      ? 'border border-gold/40 bg-gold/[0.08] text-white hover:border-gold hover:bg-gold/20'
                      : 'cursor-default text-white/25'
                }`}
              >
                {d}
                {available && !isSel ? <span className="absolute bottom-1.5 size-1 rounded-full bg-gold" /> : null}
              </button>
            );
          })}
        </div>

        {loading ? <p className="mt-5 animate-pulse text-center text-sm text-white/50">Loading available dates…</p> : null}
        {days && !days.length ? (
          <p className="mt-5 text-center text-sm text-white/55">No open dates this month — try the next month.</p>
        ) : null}

        <p className="mt-6 flex items-center gap-2 text-[12.5px] text-white/50">
          <Globe className="size-3.5 text-gold" />
          Times shown in {tzLabel}
        </p>
      </div>

      {/* time slots */}
      <div className="flex flex-col border-t border-white/10 p-6 md:border-t-0 md:p-8">
        <p className="text-[10.5px] tracking-[0.28em] text-gold uppercase">Available times</p>
        <p className="mt-2 font-serif text-[22px] leading-tight">{selected ? selectedLabel : 'Select a date'}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-white/50">
          <Clock className="size-3.5" /> 30-minute call
        </p>
        <div className="mt-5 grid max-h-[340px] grid-cols-2 gap-2.5 overflow-y-auto pr-1">
          {spots.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="group rounded-xl border border-white/12 bg-white/[0.03] px-3 py-3 text-[14px] text-white/85 transition hover:border-gold hover:bg-gold hover:font-semibold hover:text-ink"
            >
              {timeFmt.format(new Date(t))}
            </button>
          ))}
        </div>
        {!selected && days?.length ? (
          <p className="mt-2 text-sm text-white/45">Pick a highlighted date to see open times.</p>
        ) : null}
      </div>
    </div>
  );
}
