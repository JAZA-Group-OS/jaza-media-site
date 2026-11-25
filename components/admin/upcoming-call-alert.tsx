'use client';

import { BellRing, Video, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { dayKey, timeLabel, type CalendarBooking } from './booking-calendar-view';

const SOON_MIN = 60; // highlight a call starting within the next hour
const NOTIFY_MIN = 15; // browser notification this many minutes before

/**
 * Admin-wide alert: shows today's remaining discovery calls on every dashboard
 * tab, highlights one that starts soon, and (if allowed) pops a browser
 * notification 15 minutes before each call. Refreshes every minute.
 */
export default function UpcomingCallAlert({ onOpen }: { onOpen: () => void }) {
  const [calls, setCalls] = useState<CalendarBooking[]>([]);
  const [tz, setTz] = useState('Asia/Manila');
  const [now, setNow] = useState(() => Date.now());
  const [hidden, setHidden] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
  );
  const notified = useRef(new Set<string>());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const res = await fetch('/api/booking/admin', { cache: 'no-store' }).catch(() => null);
      if (!res?.ok || !alive) return;
      const json = await res.json();
      setTz(json.settings?.timezone ?? 'Asia/Manila');
      setCalls(json.bookings ?? []);
      setNow(Date.now());
    };
    void Promise.resolve().then(load);
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const today = dayKey(now, tz);
  const todays = calls
    .filter((b) => b.status === 'confirmed' && dayKey(b.start_at, tz) === today && Date.parse(b.start_at) > now - 30 * 60_000)
    .sort((a, b) => a.start_at.localeCompare(b.start_at));
  const next = todays.find((b) => Date.parse(b.start_at) > now - 5 * 60_000);
  const minsToNext = next ? Math.round((Date.parse(next.start_at) - now) / 60_000) : null;
  const soon = minsToNext !== null && minsToNext <= SOON_MIN;

  useEffect(() => {
    if (perm !== 'granted') return;
    for (const b of todays) {
      const mins = (Date.parse(b.start_at) - now) / 60_000;
      if (mins <= NOTIFY_MIN && mins > -5 && !notified.current.has(b.id)) {
        notified.current.add(b.id);
        new Notification('Discovery call soon', { body: `${b.full_name} at ${timeLabel(b.start_at, tz)}`, tag: b.id });
      }
    }
  }, [todays, now, perm, tz]);

  if (hidden || todays.length === 0) return null;

  return (
    <div className={`mb-6 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${soon ? 'border-[#FFB829] bg-[#FFB829]/10' : 'border-[#FFB829]/30 bg-[#FFB829]/[0.04]'}`}>
      <div className="flex items-start gap-3">
        <BellRing className={`mt-0.5 size-5 shrink-0 text-[#FFB829] ${soon ? 'animate-pulse' : ''}`} />
        <div className="text-sm">
          <p className="font-semibold text-white">
            {todays.length === 1 ? '1 discovery call today' : `${todays.length} discovery calls today`}
            {next && minsToNext !== null && (
              <span className="text-[#FFB829]">
                {' · '}next {minsToNext <= 0 ? 'starting now' : minsToNext < 60 ? `in ${minsToNext} min` : `at ${timeLabel(next.start_at, tz)}`}
              </span>
            )}
          </p>
          <p className="mt-0.5 text-gray-400">
            {todays.map((b) => `${timeLabel(b.start_at, tz)} ${b.full_name}`).join('  ·  ')}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {soon && next?.meet_url && (
          <a href={next.meet_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFB829] px-3 py-1.5 text-xs font-semibold text-black hover:bg-white">
            <Video className="size-3.5" /> Join
          </a>
        )}
        {perm === 'default' && (
          <button type="button" onClick={() => Notification.requestPermission().then(setPerm)} className="rounded-lg border border-[#FFB829]/40 px-3 py-1.5 text-xs text-[#FFB829] hover:bg-[#FFB829]/10">
            Enable reminders
          </button>
        )}
        <button type="button" onClick={onOpen} className="rounded-lg border border-[#262626] px-3 py-1.5 text-xs text-gray-300 hover:border-[#FFB829]">View</button>
        <button type="button" aria-label="Dismiss" onClick={() => setHidden(true)} className="p-1 text-gray-500 hover:text-white"><X className="size-4" /></button>
      </div>
    </div>
  );
}
