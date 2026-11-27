// Server-only core for the built-in booking system: settings, timezone math,
// Google Calendar (OAuth refresh token, free/busy, events + Meet) and slots.
import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type WeeklyHours = Record<string, [string, string][]>;

export type BookingSettings = {
  id: number;
  label: string | null;
  timezone: string;
  slot_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_days_ahead: number;
  weekly_hours: WeeklyHours;
  host_email: string | null;
  google_refresh_token: string | null;
  google_calendar_id: string;
  google_account_email: string | null;
};

export type Booking = {
  id: string;
  start_at: string;
  end_at: string;
  status: 'confirmed' | 'cancelled';
  full_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  description: string | null;
  invitee_timezone: string | null;
  manage_token: string;
  calendar_id: number;
  lead_id: string | null;
  google_event_id: string | null;
  meet_url: string | null;
  reminder_24h_sent_at: string | null;
  reminder_1h_sent_at: string | null;
  created_at: string;
};

// The generated Database type doesn't know these tables yet; use a loose client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function db(): any {
  return createAdminClient();
}

/** Calendar settings: 1 = CEO (also used by Partner With Us), 2 = Sales team. */
export async function getSettings(calendarId: number = 1): Promise<BookingSettings> {
  const { data, error } = await db().from('booking_settings').select('*').eq('id', calendarId).single();
  if (error || !data) throw new Error(`booking settings unavailable: ${error?.message ?? 'no row'}`);
  return data as BookingSettings;
}

export async function getDaysOff(): Promise<string[]> {
  const { data } = await db().from('booking_days_off').select('day');
  return ((data ?? []) as { day: string }[]).map((d) => d.day);
}

/* ---------------- timezone helpers (no library) ---------------- */

/** Offset in ms of `tz` at instant `utcMs` (local = utc + offset). */
function tzOffset(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - (utcMs - (utcMs % 1000));
}

/** Wall-clock `YYYY-MM-DD` + `HH:MM` in `tz` → UTC ms. */
export function zonedToUtc(day: string, time: string, tz: string): number {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let utc = guess - tzOffset(guess, tz);
  utc = guess - tzOffset(utc, tz);
  return utc;
}

/** UTC ms → `YYYY-MM-DD` in `tz`. */
export function dayInZone(utcMs: number, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(utcMs),
  );
}

function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function weekday(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/* ---------------- Google Calendar ---------------- */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GCAL = 'https://www.googleapis.com/calendar/v3';

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

async function googleAccessToken(s: BookingSettings): Promise<string | null> {
  if (!s.google_refresh_token || !googleConfigured()) return null;
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: s.google_refresh_token,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[booking/google] token refresh failed', res.status);
    return null;
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Busy intervals from the host's Google Calendar. Returns [] when not connected. */
async function googleBusy(s: BookingSettings, fromMs: number, toMs: number): Promise<[number, number][]> {
  const token = await googleAccessToken(s);
  if (!token) return [];
  const res = await fetch(`${GCAL}/freeBusy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: new Date(fromMs).toISOString(),
      timeMax: new Date(toMs).toISOString(),
      items: [{ id: s.google_calendar_id }],
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[booking/google] freeBusy failed', res.status);
    return [];
  }
  const json = (await res.json()) as { calendars: Record<string, { busy: { start: string; end: string }[] }> };
  const busy = json.calendars?.[s.google_calendar_id]?.busy ?? [];
  return busy.map((b) => [Date.parse(b.start), Date.parse(b.end)]);
}

export async function googleCreateEvent(
  s: BookingSettings,
  b: Pick<Booking, 'id' | 'start_at' | 'end_at' | 'full_name' | 'email' | 'phone' | 'description'>,
): Promise<{ eventId: string; meetUrl: string | null } | null> {
  const token = await googleAccessToken(s);
  if (!token) return null;
  const description = [
    `Discovery & Strategy Meeting booked via jazamedia site.`,
    ``,
    `Name: ${b.full_name}`,
    `Email: ${b.email}`,
    b.phone ? `Phone: ${b.phone}` : '',
    b.description ? `\nAbout the business:\n${b.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const res = await fetch(
    `${GCAL}/calendars/${encodeURIComponent(s.google_calendar_id)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `JAZA Media Discovery Call — ${b.full_name}`,
        description,
        start: { dateTime: b.start_at },
        end: { dateTime: b.end_at },
        attendees: [{ email: b.email, displayName: b.full_name }],
        conferenceData: { createRequest: { requestId: b.id, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
        reminders: { useDefault: true },
      }),
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    console.error('[booking/google] create event failed', res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const ev = (await res.json()) as { id: string; hangoutLink?: string };
  return { eventId: ev.id, meetUrl: ev.hangoutLink ?? null };
}

export async function googleMoveEvent(s: BookingSettings, eventId: string, startIso: string, endIso: string) {
  const token = await googleAccessToken(s);
  if (!token) return false;
  const res = await fetch(
    `${GCAL}/calendars/${encodeURIComponent(s.google_calendar_id)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ start: { dateTime: startIso }, end: { dateTime: endIso } }),
      cache: 'no-store',
    },
  );
  if (!res.ok) console.error('[booking/google] move event failed', res.status);
  return res.ok;
}

export async function googleDeleteEvent(s: BookingSettings, eventId: string) {
  const token = await googleAccessToken(s);
  if (!token) return false;
  const res = await fetch(
    `${GCAL}/calendars/${encodeURIComponent(s.google_calendar_id)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  );
  if (!res.ok && res.status !== 410) console.error('[booking/google] delete event failed', res.status);
  return res.ok;
}

/* ---------------- slots ---------------- */

/**
 * Every bookable slot start (UTC ISO) between today and max_days_ahead,
 * respecting weekly hours, days off, minimum notice, existing bookings and
 * Google busy time (each padded by the buffer).
 * `ignoreBookingId` lets a reschedule treat its own current slot as free.
 */
export async function computeSlots(s: BookingSettings, opts: { ignoreBookingId?: string } = {}): Promise<string[]> {
  const now = Date.now();
  const earliest = now + s.min_notice_hours * 3600_000;
  const today = dayInZone(now, s.timezone);
  const lastDay = addDays(today, s.max_days_ahead);
  const rangeEnd = zonedToUtc(addDays(lastDay, 1), '00:00', s.timezone);
  const slotMs = s.slot_minutes * 60_000;
  const bufMs = s.buffer_minutes * 60_000;

  const [daysOff, existing, busy] = await Promise.all([
    getDaysOff(),
    db()
      .from('bookings')
      .select('id,start_at,end_at')
      .eq('status', 'confirmed')
      .eq('calendar_id', s.id)
      .gte('end_at', new Date(now).toISOString())
      .then((r: { data: { id: string; start_at: string; end_at: string }[] | null }) => r.data ?? []),
    googleBusy(s, now, rangeEnd),
  ]);

  const blocked: [number, number][] = [
    ...existing
      .filter((b: { id: string }) => b.id !== opts.ignoreBookingId)
      .map((b: { start_at: string; end_at: string }) => [Date.parse(b.start_at), Date.parse(b.end_at)] as [number, number]),
    ...busy,
  ];
  const off = new Set(daysOff);
  const out: string[] = [];

  for (let day = today; day <= lastDay; day = addDays(day, 1)) {
    if (off.has(day)) continue;
    for (const [from, to] of s.weekly_hours[String(weekday(day))] ?? []) {
      const winStart = zonedToUtc(day, from, s.timezone);
      const winEnd = zonedToUtc(day, to, s.timezone);
      for (let t = winStart; t + slotMs <= winEnd; t += slotMs) {
        if (t < earliest) continue;
        const clash = blocked.some(([bs, be]) => t < be + bufMs && t + slotMs > bs - bufMs);
        if (!clash) out.push(new Date(t).toISOString());
      }
    }
  }
  return out;
}

export function newToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
}
