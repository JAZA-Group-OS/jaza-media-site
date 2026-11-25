'use client';

import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

export type CalendarBooking = {
  id: string;
  start_at: string;
  status: 'confirmed' | 'cancelled';
  full_name: string;
  company: string | null;
  meet_url: string | null;
};

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** YYYY-MM-DD of an instant in the given time zone. */
export function dayKey(iso: string | number | Date, tz: string) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: tz });
}

export function timeLabel(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString('en-PH', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
}

/** Month calendar of confirmed discovery calls; pick a day to see who and when. */
export default function BookingCalendarView({ bookings, tz }: { bookings: CalendarBooking[]; tz: string }) {
  const [today] = useState(() => dayKey(Date.now(), tz));
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState(today);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const b of bookings) {
      if (b.status !== 'confirmed') continue;
      const k = dayKey(b.start_at, tz);
      map.set(k, [...(map.get(k) ?? []), b]);
    }
    for (const list of map.values()) list.sort((a, b) => a.start_at.localeCompare(b.start_at));
    return map;
  }, [bookings, tz]);

  const first = new Date(Date.UTC(cursor.y, cursor.m, 1));
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
  ];
  const monthName = first.toLocaleDateString('en-PH', { timeZone: 'UTC', month: 'long', year: 'numeric' });
  const shift = (d: number) => setCursor(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  const dayCalls = byDay.get(selected) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"><ChevronLeft className="size-4" /></button>
          <p className="font-semibold">{monthName}</p>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"><ChevronRight className="size-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] tracking-wide text-gray-500 uppercase">
          {WEEK.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((k, i) => {
            if (!k) return <div key={`e${i}`} />;
            const calls = byDay.get(k) ?? [];
            const isToday = k === today;
            const isSel = k === selected;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                className={`relative flex min-h-[64px] flex-col items-start rounded-lg border p-1.5 text-left transition ${
                  isSel ? 'border-[#FFB829] bg-[#FFB829]/10' : calls.length ? 'border-[#FFB829]/30 bg-[#FFB829]/[0.04] hover:border-[#FFB829]/60' : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <span className={`grid size-6 place-items-center rounded-full text-xs ${isToday ? 'bg-[#FFB829] font-semibold text-black' : 'text-gray-300'}`}>{Number(k.slice(8))}</span>
                {calls.length > 0 && (
                  <span className="mt-auto w-full truncate text-[10.5px] text-[#FFB829]">
                    {calls.length === 1 ? timeLabel(calls[0].start_at, tz) : `${calls.length} calls`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] p-4">
        <p className="text-sm font-semibold">
          {new Date(`${selected}T00:00:00Z`).toLocaleDateString('en-PH', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {dayCalls.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No calls this day.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dayCalls.map((b) => (
              <li key={b.id} className="rounded-lg border border-[#1a1a1a] bg-black px-3 py-2">
                <p className="text-sm font-medium text-[#FFB829]">{timeLabel(b.start_at, tz)}</p>
                <p className="text-sm text-white">{b.full_name}{b.company ? ` · ${b.company}` : ''}</p>
                {b.meet_url && (
                  <a href={b.meet_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#FFB829]">
                    <Video className="size-3.5" /> Join Meet
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {dayCalls.length > 1 && <p className="mt-3 text-xs text-amber-300">{dayCalls.length} online meetings on this day.</p>}
      </div>
    </div>
  );
}
