'use client';

import { CalendarDays, Check, Link2, Loader2, Mail, Phone, Plus, Trash2, Video, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import BookingCalendarView from './booking-calendar-view';

type Range = [string, string];
type Settings = {
  timezone: string;
  slot_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_days_ahead: number;
  weekly_hours: Record<string, Range[]>;
  host_email: string | null;
  google_calendar_id: string;
  google_account_email: string | null;
};
type Booking = {
  id: string;
  start_at: string;
  status: 'confirmed' | 'cancelled';
  full_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  description: string | null;
  meet_url: string | null;
};
type Data = { settings: Settings; googleConnected: boolean; googleConfigured: boolean; daysOff: string[]; bookings: Booking[] };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CARD = 'rounded-xl border border-adm-line bg-adm-surface p-5 sm:p-6';
const INPUT = 'rounded-lg border border-adm-line-strong bg-adm-bg px-3 py-2 text-sm text-adm-text focus:border-adm-accent focus:outline-none';
const BTN = 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50';

function fmt(iso: string, tz: string) {
  return new Date(iso).toLocaleString('en-PH', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function BookingManager() {
  const [data, setData] = useState<Data | null>(null);
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDayOff, setNewDayOff] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const [googleNotice] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const status = new URLSearchParams(window.location.search).get('booking_google');
    if (!status) return null;
    return (
      {
        connected: 'Google Calendar connected.',
        no_refresh_token: 'Google did not return a refresh token. Remove JAZA access at myaccount.google.com/permissions and connect again.',
        error: 'Google connection failed. Check the client ID, secret and redirect URI.',
        unauthorized: 'Log in as admin first.',
      }[status] ?? null
    );
  });

  const load = useCallback(async () => {
    const res = await fetch('/api/booking/admin', { cache: 'no-store' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error ?? 'Could not load booking data. Did you run the booking SQL in Supabase?');
    setData(json);
    setForm(json.settings);
  }, []);

  useEffect(() => {
    // Defer so the fetch's state updates never run synchronously in the effect.
    void Promise.resolve().then(load);
  }, [load]);

  async function action(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch('/api/booking/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setError(json.error ?? 'Action failed');
    await load();
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    const { google_account_email: _ignored, ...payload } = form;
    void _ignored;
    const res = await fetch('/api/booking/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, host_email: payload.host_email ?? '' }) });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(json.error ?? 'Save failed');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  }

  if (error && !data) return <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>;
  if (!data || !form) return <Loader2 className="size-6 animate-spin text-adm-accent-ink" />;

  const tz = data.settings.timezone;
  const list = data.bookings.filter((b) => (showPast ? true : Date.parse(b.start_at) >= now - 3600_000));
  const setHours = (d: number, ranges: Range[]) => setForm({ ...form, weekly_hours: { ...form.weekly_hours, [String(d)]: ranges } });
  const num = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: Number(e.target.value) });

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {/* Calendar */}
      <section className={CARD}>
        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-adm-text"><CalendarDays className="size-5 text-adm-accent-ink" /> Calendar</h2>
        <BookingCalendarView bookings={data.bookings} tz={tz} weeklyHours={data.settings.weekly_hours} slotMinutes={data.settings.slot_minutes} daysOff={data.daysOff} />
      </section>

      {/* Upcoming bookings */}
      <section className={CARD}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-adm-text"><CalendarDays className="size-5 text-adm-accent-ink" /> Discovery calls</h2>
          <label className="flex items-center gap-2 text-sm text-adm-muted">
            <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> Show past 7 days & cancelled
          </label>
        </div>
        {list.filter((b) => showPast || b.status === 'confirmed').length === 0 ? (
          <p className="text-sm text-adm-subtle">No upcoming calls.</p>
        ) : (
          <ul className="divide-y divide-adm-line">
            {list
              .filter((b) => showPast || b.status === 'confirmed')
              .map((b) => (
                <li key={b.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className={`font-medium ${b.status === 'cancelled' ? 'text-adm-subtle line-through' : 'text-adm-text'}`}>
                      {fmt(b.start_at, tz)} · {b.full_name}{b.company ? ` · ${b.company}` : ''}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-adm-muted">
                      <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1 hover:text-adm-accent-ink"><Mail className="size-3.5" />{b.email}</a>
                      {b.phone && <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 hover:text-adm-accent-ink"><Phone className="size-3.5" />{b.phone}</a>}
                      {b.meet_url && <a href={b.meet_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-adm-accent-ink"><Video className="size-3.5" />Meet</a>}
                    </p>
                    {b.description && <p className="mt-2 max-w-2xl text-sm whitespace-pre-line text-adm-subtle">{b.description}</p>}
                  </div>
                  {b.status === 'confirmed' && Date.parse(b.start_at) > now && (
                    cancelId === b.id ? (
                      <span className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => { setCancelId(null); action({ action: 'cancel_booking', id: b.id }); }} className={`${BTN} bg-red-500/20 text-red-300 hover:bg-red-500/30`}>Confirm cancel</button>
                        <button type="button" onClick={() => setCancelId(null)} className={`${BTN} border border-adm-line-strong text-adm-muted`}>Keep</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setCancelId(b.id)} className={`${BTN} shrink-0 border border-adm-line-strong text-adm-muted hover:border-red-500 hover:text-red-400`}><X className="size-4" />Cancel</button>
                    )
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Google */}
      <section className={CARD}>
        <h2 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-adm-text"><Link2 className="size-5 text-adm-accent-ink" /> Google Calendar</h2>
        {googleNotice && <p className="mb-3 text-sm text-adm-accent-ink">{googleNotice}</p>}
        {!data.googleConfigured ? (
          <p className="text-sm text-adm-muted">Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in Vercel, redeploy, then connect here.</p>
        ) : data.googleConnected ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-green-300"><Check className="size-4" /> Connected{data.settings.google_account_email ? ` as ${data.settings.google_account_email}` : ''}</span>
            <button type="button" onClick={() => action({ action: 'disconnect_google' })} className={`${BTN} border border-adm-line-strong text-adm-muted hover:border-red-500 hover:text-red-400`}>Disconnect</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-adm-muted">Not connected — slots ignore your Google events and calls get no Meet link.</p>
            <a href="/api/booking/google/connect" className={`${BTN} bg-adm-accent text-black hover:bg-white`}>Connect Google Calendar</a>
          </div>
        )}
      </section>

      {/* Availability */}
      <section className={CARD}>
        <h2 className="mb-4 text-[15px] font-semibold text-adm-text">Availability</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1 text-sm text-adm-muted">Timezone<input className={INPUT} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label>
          <label className="grid gap-1 text-sm text-adm-muted">Call length (minutes)<input type="number" className={INPUT} value={form.slot_minutes} onChange={num('slot_minutes')} /></label>
          <label className="grid gap-1 text-sm text-adm-muted">Buffer between calls (minutes)<input type="number" className={INPUT} value={form.buffer_minutes} onChange={num('buffer_minutes')} /></label>
          <label className="grid gap-1 text-sm text-adm-muted">Minimum notice (hours)<input type="number" className={INPUT} value={form.min_notice_hours} onChange={num('min_notice_hours')} /></label>
          <label className="grid gap-1 text-sm text-adm-muted">Bookable days ahead<input type="number" className={INPUT} value={form.max_days_ahead} onChange={num('max_days_ahead')} /></label>
          <label className="grid gap-1 text-sm text-adm-muted">Notification email<input type="email" className={INPUT} placeholder="admin@jazamedia.com" value={form.host_email ?? ''} onChange={(e) => setForm({ ...form, host_email: e.target.value })} /></label>
          <label className="grid gap-1 text-sm text-adm-muted">Google calendar ID<input className={INPUT} value={form.google_calendar_id} onChange={(e) => setForm({ ...form, google_calendar_id: e.target.value })} /></label>
        </div>

        <h3 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-adm-text-2 uppercase">Weekly hours</h3>
        <div className="space-y-2">
          {DAYS.map((name, d) => {
            const ranges = form.weekly_hours[String(d)] ?? [];
            return (
              <div key={name} className="flex flex-wrap items-center gap-3 rounded-lg border border-adm-line px-3 py-2">
                <label className="flex w-32 items-center gap-2 text-sm">
                  <input type="checkbox" checked={ranges.length > 0} onChange={(e) => setHours(d, e.target.checked ? [['09:00', '17:00']] : [])} />
                  {name}
                </label>
                {ranges.length === 0 ? (
                  <span className="text-sm text-adm-faint">Unavailable</span>
                ) : (
                  ranges.map((r, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <input type="time" className={INPUT} value={r[0]} onChange={(e) => setHours(d, ranges.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} />
                      <span className="text-adm-subtle">–</span>
                      <input type="time" className={INPUT} value={r[1]} onChange={(e) => setHours(d, ranges.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} />
                      {ranges.length > 1 && (
                        <button type="button" aria-label="Remove range" onClick={() => setHours(d, ranges.filter((_, j) => j !== i))} className="p-1 text-adm-subtle hover:text-red-400"><Trash2 className="size-4" /></button>
                      )}
                    </span>
                  ))
                )}
                {ranges.length > 0 && (
                  <button type="button" aria-label="Add time range" onClick={() => setHours(d, [...ranges, ['13:00', '17:00']])} className="p-1 text-adm-subtle hover:text-adm-accent-ink"><Plus className="size-4" /></button>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" onClick={save} disabled={saving} className={`${BTN} mt-5 bg-adm-accent text-black hover:bg-white`}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
          {saved ? 'Saved' : 'Save availability'}
        </button>
      </section>

      {/* Days off */}
      <section className={CARD}>
        <h2 className="mb-4 text-[15px] font-semibold text-adm-text">Days off</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" className={INPUT} value={newDayOff} onChange={(e) => setNewDayOff(e.target.value)} />
          <button type="button" disabled={!newDayOff} onClick={() => { action({ action: 'add_day_off', day: newDayOff }); setNewDayOff(''); }} className={`${BTN} bg-adm-accent/20 text-adm-accent-ink hover:bg-adm-accent/30`}><Plus className="size-4" />Add</button>
        </div>
        {data.daysOff.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {data.daysOff.map((d) => (
              <li key={d} className="inline-flex items-center gap-2 rounded-full border border-adm-line-strong px-3 py-1 text-sm">
                {new Date(`${d}T00:00:00Z`).toLocaleDateString('en-PH', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                <button type="button" aria-label={`Remove ${d}`} onClick={() => action({ action: 'remove_day_off', day: d })} className="text-adm-subtle hover:text-red-400"><X className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
