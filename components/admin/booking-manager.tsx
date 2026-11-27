'use client';

import { CalendarDays, Check, ChevronDown, Link2, Loader2, Mail, Phone, Plus, Settings2, Trash2, Video, X } from 'lucide-react';
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
  const [cal, setCal] = useState<1 | 2>(1);
  const [data, setData] = useState<Data | null>(null);
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDayOff, setNewDayOff] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    const res = await fetch(`/api/booking/admin?cal=${cal}`, { cache: 'no-store' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error ?? 'Could not load booking data. Did you run the booking SQL in Supabase?');
    setData(json);
    setForm(json.settings);
  }, [cal]);

  useEffect(() => {
    // Defer so the fetch's state updates never run synchronously in the effect.
    void Promise.resolve().then(load);
  }, [load]);

  async function action(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/booking/admin?cal=${cal}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
    const res = await fetch(`/api/booking/admin?cal=${cal}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, host_email: payload.host_email ?? '' }) });
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
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Calendar" className="inline-flex rounded-xl border border-adm-line-strong p-1">
          {([[1, 'CEO calendar'], [2, 'Sales team calendar']] as const).map(([id, name]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={cal === id}
              onClick={() => {
                setData(null);
                setForm(null);
                setCal(id);
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${cal === id ? 'bg-adm-accent text-black' : 'text-adm-muted hover:text-adm-text'}`}
            >
              {name}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-adm-subtle">
          {cal === 1 ? 'Big-budget, ready-now leads from Book a Call + Partner With Us bookings.' : 'Qualified mid-budget leads from Book a Call.'}
        </span>
      </div>
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

      {/* Settings — hidden behind one button to keep the page clean */}
      <section className={`${CARD} !p-0 overflow-hidden`}>
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          aria-expanded={showSettings}
          aria-controls="booking-settings"
          className="flex w-full flex-wrap items-center gap-4 p-5 text-left transition hover:bg-adm-raised/50 sm:p-6"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-adm-accent text-[#141414]">
            <Settings2 className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-adm-text">Booking settings</span>
            <span className="mt-0.5 block truncate text-[13px] text-adm-subtle">Weekly hours, booking rules, Google Calendar &amp; notifications, days off</span>
            <span className="mt-2.5 flex flex-wrap gap-1.5">
              <Chip>{daysSummary(data.settings.weekly_hours)}</Chip>
              <Chip>{data.settings.slot_minutes} min calls · {data.settings.buffer_minutes} min buffer</Chip>
              <Chip tone={data.googleConnected ? 'ok' : 'warn'}>{data.googleConnected ? 'Google connected' : 'Google not connected'}</Chip>
              {data.daysOff.length > 0 && <Chip>{data.daysOff.length} day{data.daysOff.length === 1 ? '' : 's'} off</Chip>}
            </span>
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-adm-line-strong px-3.5 py-2 text-[13px] font-medium text-adm-text">
            {showSettings ? 'Hide settings' : 'Edit settings'}
            <ChevronDown className={`size-4 transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </section>

      {showSettings && (
      <div id="booking-settings" className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className={CARD}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-adm-text">Weekly hours</h2>
              <p className="text-sm text-adm-subtle">When clients can book a call ({form.timezone}).</p>
            </div>
            <button type="button" onClick={save} disabled={saving} className={`${BTN} bg-adm-accent text-black hover:bg-white`}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
          {saved ? 'Saved' : 'Save settings'}
        </button>
          </div>
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
        </section>

        <div className="space-y-6">
          <section className={CARD}>
            <h2 className="mb-4 text-[15px] font-semibold text-adm-text">Booking rules</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-adm-muted">Call length (min)<input type="number" className={INPUT} value={form.slot_minutes} onChange={num('slot_minutes')} /></label>
              <label className="grid gap-1 text-sm text-adm-muted">Buffer between calls (min)<input type="number" className={INPUT} value={form.buffer_minutes} onChange={num('buffer_minutes')} /></label>
              <label className="grid gap-1 text-sm text-adm-muted">Minimum notice (hours)<input type="number" className={INPUT} value={form.min_notice_hours} onChange={num('min_notice_hours')} /></label>
              <label className="grid gap-1 text-sm text-adm-muted">Bookable days ahead<input type="number" className={INPUT} value={form.max_days_ahead} onChange={num('max_days_ahead')} /></label>
              <label className="grid gap-1 text-sm text-adm-muted sm:col-span-2">Timezone<input className={INPUT} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label>
            </div>
            <p className="mt-3 text-xs text-adm-faint">Saved with “Save settings” (Weekly hours card).</p>
          </section>

          <section className={CARD}>
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-adm-text"><Link2 className="size-5 text-adm-accent-ink" /> Google Calendar &amp; notifications</h2>
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
            <a href={`/api/booking/google/connect?cal=${cal}`} className={`${BTN} bg-adm-accent text-black hover:bg-white`}>Connect Google Calendar</a>
          </div>
        )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-adm-muted">Notification email<input type="email" className={INPUT} placeholder="admin@jazamedia.com" value={form.host_email ?? ''} onChange={(e) => setForm({ ...form, host_email: e.target.value })} /></label>
              <label className="grid gap-1 text-sm text-adm-muted">Google calendar ID<input className={INPUT} value={form.google_calendar_id} onChange={(e) => setForm({ ...form, google_calendar_id: e.target.value })} /></label>
            </div>
          </section>

          <section className={CARD}>
            <h2 className="mb-1 text-[15px] font-semibold text-adm-text">Days off</h2>
            <p className="mb-4 text-sm text-adm-subtle">Dates nobody can book.</p>
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
      </div>
      )}
    </div>
  );
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function to12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const hh = h % 12 || 12;
  return `${hh}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
}

/** e.g. "Mon–Fri · 9am–5pm" (or a day count when hours differ). */
function daysSummary(hours: Record<string, [string, string][]>) {
  const open = DAY_SHORT.map((_, i) => i).filter((i) => (hours[String(i)] ?? []).length > 0);
  if (!open.length) return 'No open days';
  const first = hours[String(open[0])][0];
  const same = open.every((i) => hours[String(i)].length === 1 && hours[String(i)][0][0] === first[0] && hours[String(i)][0][1] === first[1]);
  const consecutive = open.every((d, i) => i === 0 || d === open[i - 1] + 1);
  const days = consecutive && open.length > 2 ? `${DAY_SHORT[open[0]]}–${DAY_SHORT[open[open.length - 1]]}` : open.map((i) => DAY_SHORT[i]).join(', ');
  return same ? `${days} · ${to12(first[0])}–${to12(first[1])}` : `${open.length} days a week`;
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: 'ok' | 'warn' }) {
  const cls = tone === 'ok' ? 'bg-green-500/15 text-green-300' : tone === 'warn' ? 'bg-red-500/10 text-red-300' : 'bg-adm-raised text-adm-text-2';
  return <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-medium ${cls}`}>{children}</span>;
}
