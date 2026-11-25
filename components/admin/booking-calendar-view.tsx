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
  email?: string;
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
type Hours = Record<string, [string, string][]>;

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
const toHM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const hm12 = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
};

/** Every slot start (local HH:MM) for a calendar day, from the weekly hours. */
function daySlots(day: string, hours: Hours, slotMinutes: number): string[] {
  const wd = new Date(`${day}T00:00:00Z`).getUTCDay();
  const out: string[] = [];
  for (const [from, to] of hours[String(wd)] ?? []) {
    for (let t = toMin(from); t + slotMinutes <= toMin(to); t += slotMinutes) out.push(toHM(t));
  }
  return out;
}

export default function BookingCalendarView({
  bookings,
  tz,
  weeklyHours = {},
  slotMinutes = 30,
  daysOff = [],
}: {
  bookings: CalendarBooking[];
  tz: string;
  weeklyHours?: Hours;
  slotMinutes?: number;
  daysOff?: string[];
}) {
  const [today] = useState(() => dayKey(Date.now(), tz));
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState(today);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const b of bookings) {
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
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
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
                className={`relative flex min-h-[84px] flex-col items-start rounded-lg border p-1.5 text-left transition ${
                  isSel ? 'border-[#FFB829] bg-[#FFB829]/10' : calls.length ? 'border-[#FFB829]/30 bg-[#FFB829]/[0.04] hover:border-[#FFB829]/60' : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <span className={`grid size-6 place-items-center rounded-full text-xs ${isToday ? 'bg-[#FFB829] font-semibold text-black' : 'text-gray-300'}`}>{Number(k.slice(8))}</span>
                {calls.length > 0 && (
                  <span className="mt-1 flex w-full flex-col gap-1">
                    {calls.slice(0, 2).map((b) => (
                      <span key={b.id} className={`block w-full rounded-md px-1.5 py-1 text-left leading-tight ${b.status === 'cancelled' ? 'bg-white/5 opacity-60' : 'bg-[#FFB829]/15'}`}>
                        <span className={`block text-[10.5px] font-semibold ${b.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-[#FFB829]'}`}>{timeLabel(b.start_at, tz)}{b.status === 'cancelled' ? ' · cancelled' : ''}</span>
                        <span className="block truncate text-[11px] text-white">{b.full_name}</span>
                        {b.company && <span className="block truncate text-[10px] text-gray-400">{b.company}</span>}
                      </span>
                    ))}
                    {calls.length > 2 && <span className="text-[10px] text-[#FFB829]">+{calls.length - 2} more</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#FFB829]" />Meeting at the time the client chose</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gray-600" />Cancelled</span>
        </p>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] p-4">
        <p className="text-sm font-semibold">
          {new Date(`${selected}T00:00:00Z`).toLocaleDateString('en-PH', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {(() => {
          const localHM = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
          const isOff = daysOff.includes(selected);
          const slots = isOff ? [] : daySlots(selected, weeklyHours, slotMinutes);
          const atSlot = new Map<string, CalendarBooking[]>();
          for (const b of dayCalls) {
            const k = localHM(b.start_at);
            atSlot.set(k, [...(atSlot.get(k) ?? []), b]);
          }
          // bookings at a time that isn't a current slot (hours changed later) still show
          const rows = [...new Set([...slots, ...atSlot.keys()])].sort();
          if (rows.length === 0) return <p className="mt-3 text-sm text-gray-500">{isOff ? 'Day off — no slots.' : 'No available hours this day.'}</p>;
          return (
            <ul className="mt-3 max-h-[520px] divide-y [scrollbar-width:thin] [scrollbar-color:#333_transparent] divide-[#1a1a1a] overflow-y-auto rounded-lg border border-[#1a1a1a]">
              {rows.map((hm) => {
                const here = atSlot.get(hm) ?? [];
                const end = toHM(toMin(hm) + slotMinutes);
                const taken = here.some((b) => b.status === 'confirmed');
                return (
                  <li key={hm} className={`flex gap-3 px-3 py-2.5 ${taken ? 'bg-[#FFB829]/10' : ''}`}>
                    <span className={`w-[92px] shrink-0 pt-0.5 text-xs tabular-nums ${taken ? 'font-semibold text-[#FFB829]' : 'text-gray-400'}`}>
                      {hm12(hm)} – {hm12(end)}
                    </span>
                    <span className="min-w-0 flex-1">
                      {here.length === 0 ? (
                        <span className="text-xs text-gray-600">Open</span>
                      ) : (
                        here.map((b) => (
                          <span key={b.id} className={`block ${b.status === 'cancelled' ? 'opacity-50' : ''}`}>
                            <span className={`block truncate text-sm font-semibold uppercase ${b.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-white'}`}>{b.full_name}</span>
                            {b.company && <span className="block truncate text-xs text-gray-400">{b.company}</span>}
                            {b.status === 'cancelled' ? (
                              <span className="text-[11px] text-red-400">Cancelled</span>
                            ) : (
                              b.meet_url && (
                                <a href={b.meet_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#FFB829]">
                                  <Video className="size-3" /> Join Meet
                                </a>
                              )
                            )}
                          </span>
                        ))
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        })()}
        {dayCalls.filter((b) => b.status === 'confirmed').length > 1 && <p className="mt-3 text-xs text-amber-300">{dayCalls.filter((b) => b.status === 'confirmed').length} online meetings on this day.</p>}
      </div>
    </div>
  );
}
