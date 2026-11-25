import 'server-only';

import { getSiteBaseUrl } from '@/lib/site-url';
import type { Booking, BookingSettings } from './core';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const SUPPORT_EMAIL = 'admin@jazamedia.com';
const MEETING = 'Discovery & Strategy Meeting';

type Kind = 'confirmed' | 'rescheduled' | 'cancelled' | 'reminder_24h' | 'reminder_1h';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------------- formatting ---------------- */

export function bookingRef(b: Pick<Booking, 'id'>) {
  return `JZ-${b.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

function parts(iso: string, tz: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleString('en-US', { timeZone: tz, ...o });
  return {
    weekdayShort: f({ weekday: 'short' }).toUpperCase(),
    day: f({ day: 'numeric' }),
    monthYear: f({ month: 'short', year: 'numeric' }).toUpperCase(),
    time: f({ hour: 'numeric', minute: '2-digit' }),
    short: f({ weekday: 'short', month: 'short', day: 'numeric' }),
    tzName: f({ timeZoneName: 'short' }).split(' ').pop() ?? '',
  };
}

export function formatWhen(iso: string, tz: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return `${date} · ${time}`;
}

function stamp(iso: string, tz: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })}`;
}

function minutesBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 60_000);
}

function firstName(full: string) {
  return full.trim().split(/\s+/)[0] || full;
}

/* ---------------- calendar links ---------------- */

function gDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function calendarLinks(b: Booking) {
  const base = getSiteBaseUrl();
  const title = `JAZA Media — ${MEETING}`;
  const details = `${b.meet_url ? `Join: ${b.meet_url}\n` : ''}Manage: ${base}/partner-with-us/manage?token=${b.manage_token}`;
  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${gDate(b.start_at)}/${gDate(b.end_at)}`,
    details,
    location: b.meet_url ?? 'Google Meet',
  })}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    startdt: new Date(b.start_at).toISOString(),
    enddt: new Date(b.end_at).toISOString(),
    body: details,
    location: b.meet_url ?? 'Google Meet',
  })}`;
  const ics = `${base}/api/booking/ics?token=${encodeURIComponent(b.manage_token)}`;
  return { google, outlook, ics };
}

function icsDate(iso: string) {
  return gDate(iso);
}

export function buildIcs(b: Booking, s: BookingSettings, method: 'REQUEST' | 'CANCEL' | 'PUBLISH'): string {
  const host = s.host_email || SUPPORT_EMAIL;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JAZA Media//Booking//EN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${b.id}@jazamedia.com`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(b.start_at)}`,
    `DTEND:${icsDate(b.end_at)}`,
    `SUMMARY:JAZA Media — ${MEETING}`,
    `DESCRIPTION:${b.meet_url ? `Join: ${b.meet_url}\\n` : ''}Manage: ${getSiteBaseUrl()}/partner-with-us/manage?token=${b.manage_token}`,
    b.meet_url ? `LOCATION:${b.meet_url}` : 'LOCATION:Google Meet',
    `ORGANIZER;CN=JAZA Media:mailto:${host}`,
    `ATTENDEE;CN=${b.full_name.replace(/[;,]/g, ' ')};RSVP=TRUE:mailto:${b.email}`,
    `STATUS:${method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'SEQUENCE:' + Math.floor(Date.now() / 1000),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/* ---------------- shared HTML shell (light default + dark mode) ---------------- */

// Light colours are inline (works everywhere). Clients that support
// prefers-color-scheme (Apple Mail, Outlook apps, iOS/Android mail) switch to
// the dark palette via the .d-* classes below.
const DARK_CSS = `
:root{color-scheme:light dark;supported-color-schemes:light dark}
@media (prefers-color-scheme:dark){
 .d-bg{background:#0B0D0C!important}
 .d-card{background:#151511!important;border-color:#3a3216!important}
 .d-panel{background:#1c1b15!important;border-color:#3a3216!important}
 .d-tip{background:#1f1c11!important;border-color:#3a3216!important}
 .d-ink{color:#ffffff!important}
 .d-body{color:#c9c6bd!important}
 .d-mute{color:#9e9b92!important}
 .d-gold{color:#FFCA26!important}
 .d-line{border-color:#2a2820!important}
 .d-dateblk{background:#FFCA26!important;color:#141414!important}
 .d-dateblk-x{background:#24231d!important;color:#8c897f!important}
 .d-ok{background:#12301c!important;color:#7fdc9c!important}
 .d-bad{background:#3a1a16!important;color:#f2a497!important}
 .d-hdr{background:#000000!important}
 a.d-link{color:#FFCA26!important}
}`;

function shell(preheader: string, inner: string, footer: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>JAZA Media</title><style>${DARK_CSS}</style></head>
<body class="d-bg" style="margin:0;padding:0;background:#F4F1EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="d-bg" style="background:#F4F1EA;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td class="d-card" style="background:#FFFFFF;border:1px solid #E7E1D3;border-radius:20px;overflow:hidden;">${inner}</td></tr>
<tr><td class="d-mute" style="padding:20px 0 0;text-align:center;font-size:12px;line-height:1.7;color:#7a766d;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function logoRow(badge: { label: string; tone: 'ok' | 'bad' | 'gold' }) {
  const tone =
    badge.tone === 'ok'
      ? { cls: 'd-ok', bg: '#EAF6EC', fg: '#1E6B34', dot: '#2F9E52' }
      : badge.tone === 'bad'
        ? { cls: 'd-bad', bg: '#FBECEA', fg: '#A23A2C', dot: '#C9503F' }
        : { cls: '', bg: '#FFCA26', fg: '#141414', dot: '#141414' };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="padding:28px 32px 0;line-height:1;">
  <div class="d-ink" style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:6px;color:#141414;">JAZA</div>
  <div class="d-gold" style="font-size:9px;letter-spacing:7px;color:#9A6F00;margin-top:4px;padding-left:5px;">MEDIA</div>
</td>
<td align="right" style="padding:28px 32px 0;">
  <span class="${tone.cls}" style="display:inline-block;border-radius:999px;background:${tone.bg};color:${tone.fg};font-size:11px;font-weight:700;letter-spacing:1.5px;padding:7px 12px;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${tone.dot};margin-right:6px;vertical-align:1px;"></span>${badge.label}</span>
</td></tr></table>`;
}

function dateBlock(b: Booking, tz: string, crossed: boolean, extra: string) {
  const p = parts(b.start_at, tz);
  const end = parts(b.end_at, tz);
  const mins = minutesBetween(b.start_at, b.end_at);
  const strike = crossed ? 'text-decoration:line-through;' : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="d-panel" style="border:1px solid #E7E1D3;border-radius:16px;overflow:hidden;background:#FCFAF5;"><tr>
<td width="118" class="${crossed ? 'd-dateblk-x' : 'd-dateblk'}" style="width:118px;background:${crossed ? '#E9E5DB' : '#141414'};color:${crossed ? '#6b6760' : '#ffffff'};text-align:center;padding:18px 0;">
  <div style="font-size:11px;letter-spacing:3px;font-weight:700;${crossed ? '' : 'color:#FFCA26;'}" class="${crossed ? '' : 'd-ink'}">${p.weekdayShort}</div>
  <div style="font-family:Georgia,serif;font-size:50px;line-height:1;margin-top:4px;${strike}">${p.day}</div>
  <div style="font-size:11px;letter-spacing:2px;margin-top:4px;opacity:.8;">${p.monthYear}</div>
</td>
<td style="padding:16px 20px;">
  <div class="${crossed ? 'd-mute' : 'd-ink'}" style="font-size:22px;font-weight:600;color:${crossed ? '#7a766d' : '#141414'};${strike}">${p.time} – ${end.time}</div>
  <div class="d-mute" style="font-size:13px;color:#6b6760;margin-top:4px;">${esc(tz.replace(/_/g, ' '))} (${p.tzName}) · ${mins} minutes</div>
  ${extra}
</td></tr></table>`;
}

function detailsGrid(rows: [string, string][]) {
  const cells = rows
    .map(
      ([k, v]) =>
        `<td width="50%" valign="top" style="padding:0 12px 14px 0;font-size:13.5px;"><div class="d-mute" style="color:#7a766d;font-size:12px;">${esc(k)}</div><div class="d-ink" style="margin-top:3px;color:#141414;font-weight:500;word-break:break-word;">${v}</div></td>`,
    );
  const trs: string[] = [];
  for (let i = 0; i < cells.length; i += 2) trs.push(`<tr>${cells[i]}${cells[i + 1] ?? '<td></td>'}</tr>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${trs.join('')}</table>`;
}

function sectionLabel(t: string) {
  return `<p class="d-gold" style="margin:0 0 12px;font-size:10.5px;letter-spacing:3px;color:#9A6F00;font-weight:700;">${t}</p>`;
}

function button(href: string, label: string) {
  return `<a href="${esc(href)}" style="display:block;background:#FFCA26;color:#141414;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:2px;padding:16px 0;border-radius:999px;text-align:center;">${esc(label.toUpperCase())}</a>`;
}

const PREP_TIPS = [
  'Have your monthly sales and ad spend on hand.',
  'Note your biggest growth challenge right now.',
  'Join from a quiet place with a stable connection.',
];

/* ---------------- client emails ---------------- */

const COPY: Record<Kind, { subject: (b: Booking) => string; heading: (b: Booking) => string; intro: string; badge: { label: string; tone: 'ok' | 'bad' | 'gold' } }> = {
  confirmed: {
    subject: () => `You're booked: JAZA Media ${MEETING}`,
    heading: (b) => `You&#39;re booked, <em class="d-gold" style="color:#9A6F00;">${esc(firstName(b.full_name))}.</em>`,
    intro: `Your <strong>${MEETING}</strong> with JAZA Media is confirmed. Here are your details.`,
    badge: { label: 'CONFIRMED', tone: 'ok' },
  },
  rescheduled: {
    subject: () => `Rescheduled: JAZA Media ${MEETING}`,
    heading: (b) => `New time, <em class="d-gold" style="color:#9A6F00;">${esc(firstName(b.full_name))}.</em>`,
    intro: `Your <strong>${MEETING}</strong> has moved to the time below. Your calendar invite has been updated.`,
    badge: { label: 'RESCHEDULED', tone: 'gold' },
  },
  cancelled: {
    subject: () => `Cancelled: JAZA Media ${MEETING}`,
    heading: () => 'Your call is cancelled.',
    intro: `Your <strong>${MEETING}</strong> has been cancelled and removed from the calendar. Whenever you&#39;re ready, pick a new time — it only takes a minute.`,
    badge: { label: 'CANCELLED', tone: 'bad' },
  },
  reminder_24h: {
    subject: () => `Tomorrow: JAZA Media ${MEETING}`,
    heading: (b) => `See you tomorrow, <em class="d-gold" style="color:#9A6F00;">${esc(firstName(b.full_name))}.</em>`,
    intro: `A quick reminder that your <strong>${MEETING}</strong> with JAZA Media is coming up.`,
    badge: { label: 'TOMORROW', tone: 'gold' },
  },
  reminder_1h: {
    subject: () => `Starting in 1 hour: JAZA Media ${MEETING}`,
    heading: () => 'Starting in 1 hour.',
    intro: `Your <strong>${MEETING}</strong> with JAZA Media starts soon. Use the button below to join.`,
    badge: { label: 'IN 1 HOUR', tone: 'gold' },
  },
};

function renderInvitee(kind: Kind, b: Booking, tz: string) {
  const c = COPY[kind];
  const base = getSiteBaseUrl();
  const manage = `${base}/partner-with-us/manage?token=${b.manage_token}`;
  const cancelled = kind === 'cancelled';
  const p = parts(b.start_at, tz);
  const cal = calendarLinks(b);

  const meetLine =
    !cancelled && b.meet_url
      ? `<div class="d-ink" style="margin-top:8px;font-size:13px;color:#141414;">Google Meet · <a class="d-link" href="${esc(b.meet_url)}" style="color:#8a6400;">${esc(b.meet_url.replace(/^https?:\/\//, ''))}</a></div>`
      : cancelled
        ? `<div style="margin-top:6px;font-size:13px;color:#A23A2C;" class="d-bad">Cancelled on ${esc(stamp(new Date().toISOString(), tz))}</div>`
        : `<div class="d-mute" style="margin-top:8px;font-size:13px;color:#6b6760;">Google Meet — link coming by email</div>`;

  const details: [string, string][] = [['Booked by', esc(b.full_name)]];
  if (b.company) details.push(['Company', esc(b.company)]);
  if (!cancelled) {
    details.push(['Email', esc(b.email)]);
    if (b.phone) details.push(['Phone', esc(b.phone)]);
  }
  details.push(['Booking reference', `<span style="font-family:ui-monospace,Menlo,monospace;">${bookingRef(b)}</span>`]);
  details.push([cancelled ? 'Originally booked on' : 'Booked on', esc(stamp(b.created_at, tz))]);

  const cta = cancelled
    ? button(`${base}/partner-with-us/book`, 'Book a new time')
    : b.meet_url
      ? button(b.meet_url, 'Join Google Meet')
      : button(manage, 'View my booking');

  const calRow = cancelled
    ? ''
    : `<p class="d-mute" style="margin:12px 0 0;font-size:12.5px;color:#6b6760;text-align:center;">Add to calendar: <a class="d-link" href="${esc(cal.google)}" style="color:#8a6400;">Google</a> · <a class="d-link" href="${esc(cal.outlook)}" style="color:#8a6400;">Outlook</a> · <a class="d-link" href="${esc(cal.ics)}" style="color:#8a6400;">Apple (.ics)</a></p>`;

  const prep =
    kind === 'confirmed' || kind === 'rescheduled' || kind === 'reminder_24h'
      ? `<tr><td style="padding:22px 32px 0;"><div class="d-tip" style="background:#FBF6E6;border:1px solid #F1E6C4;border-radius:14px;padding:18px 20px;">${sectionLabel('HOW TO PREPARE')}${PREP_TIPS.map(
          (t, i) =>
            `<div class="d-body" style="font-size:13.5px;line-height:1.5;color:#3d3a34;margin-top:${i ? 8 : 0}px;"><span class="d-gold" style="color:#9A6F00;font-weight:700;margin-right:10px;">${i + 1}</span>${t}</div>`,
        ).join('')}</div></td></tr>`
      : '';

  const bottom = cancelled
    ? `Didn&#39;t cancel this? Reply to this email and we&#39;ll sort it out.`
    : `Need to change plans? <a class="d-link" href="${esc(manage)}" style="color:#8a6400;">Reschedule</a> or <a class="d-link" href="${esc(manage)}" style="color:#8a6400;">cancel</a>`;

  const inner = `
<div style="height:4px;background:${cancelled ? '#C9C3B4' : '#FFCA26'};"></div>
${logoRow(c.badge)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:24px 32px 0;">
  <h1 class="d-ink" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:34px;line-height:1.15;color:#141414;">${c.heading(b)}</h1>
  <p class="d-body" style="margin:12px 0 0;font-size:15px;line-height:1.65;color:#4a4740;">Hi ${esc(firstName(b.full_name))}, ${c.intro.charAt(0).toLowerCase() + c.intro.slice(1)}</p>
</td></tr>
<tr><td style="padding:22px 32px 0;">${dateBlock(b, tz, cancelled, meetLine)}</td></tr>
<tr><td style="padding:22px 32px 0;">${cta}${calRow}</td></tr>
<tr><td style="padding:24px 32px 0;"><div class="d-line" style="border-top:1px solid #EEE9DD;padding-top:20px;">${sectionLabel('BOOKING DETAILS')}${detailsGrid(details)}</div></td></tr>
${prep}
<tr><td class="d-mute" style="padding:22px 32px 28px;text-align:center;font-size:13px;color:#6b6760;">${bottom}</td></tr>
</table>`;

  const preheader = cancelled
    ? `Your call on ${p.short} has been cancelled`
    : `Your call with JAZA Media — ${p.short} · ${p.time}`;
  const footer = `JAZA Media · Business Scaling<br>Questions? Just reply to this email.`;

  const text = [
    `Hi ${firstName(b.full_name)},`,
    '',
    c.intro.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'"),
    '',
    `When: ${formatWhen(b.start_at, tz)} (${minutesBetween(b.start_at, b.end_at)} min)`,
    !cancelled && b.meet_url ? `Google Meet: ${b.meet_url}` : '',
    `Booked by: ${b.full_name}${b.company ? ` (${b.company})` : ''}`,
    `Reference: ${bookingRef(b)}`,
    `Booked on: ${stamp(b.created_at, tz)}`,
    '',
    cancelled ? `Book again: ${base}/partner-with-us/book` : `Reschedule or cancel: ${manage}`,
    '',
    '— The JAZA Media Team',
  ]
    .filter((l) => l !== '')
    .join('\n');

  return { subject: c.subject(b), html: shell(preheader, inner, footer), text };
}

/* ---------------- admin alert ---------------- */

function renderHost(kind: 'confirmed' | 'rescheduled' | 'cancelled', b: Booking, s: BookingSettings) {
  const tz = s.timezone;
  const p = parts(b.start_at, tz);
  const end = parts(b.end_at, tz);
  const base = getSiteBaseUrl();
  const label = { confirmed: 'NEW BOOKING', rescheduled: 'RESCHEDULED', cancelled: 'CANCELLED' }[kind];
  const who = `${b.full_name}${b.company ? ` · ${b.company}` : ''}`;
  const hours = Math.round((Date.parse(b.start_at) - Date.now()) / 3600_000);
  const startsIn = hours >= 48 ? `${Math.round(hours / 24)} days` : hours >= 1 ? `${hours} hours` : 'under 1 hour';
  const strike = kind === 'cancelled' ? 'text-decoration:line-through;' : '';

  const tile = (k: string, v: string) =>
    `<td width="33%" style="padding:0 5px;"><div class="d-panel" style="border:1px solid #E7E1D3;border-radius:12px;padding:12px 14px;background:#FCFAF5;"><div class="d-mute" style="font-size:10.5px;color:#7a766d;letter-spacing:1px;">${k}</div><div class="d-ink" style="margin-top:4px;font-size:15px;font-weight:600;color:#141414;${strike}">${v}</div></div></td>`;

  const btn = (href: string, text: string, primary: boolean) =>
    `<td style="padding:0 5px;"><a href="${esc(href)}" style="display:block;text-align:center;${primary ? 'background:#FFCA26;color:#141414;' : 'border:1px solid #D8D2C3;color:#4a4740;'}text-decoration:none;font-weight:700;font-size:11.5px;letter-spacing:1.5px;padding:13px 0;border-radius:999px;" class="${primary ? '' : 'd-ink'}">${text}</a></td>`;

  const details: [string, string][] = [
    ['Email', `<a class="d-link" href="mailto:${esc(b.email)}" style="color:#8a6400;">${esc(b.email)}</a>`],
    ['Phone', b.phone ? `<a class="d-link" href="tel:${esc(b.phone)}" style="color:#8a6400;">${esc(b.phone)}</a>` : '—'],
    ['Their timezone', esc((b.invitee_timezone || tz).replace(/_/g, ' '))],
    ['Booking reference', `<span style="font-family:ui-monospace,Menlo,monospace;">${bookingRef(b)}</span>`],
    ['Booked on', esc(stamp(b.created_at, tz))],
    ['Source', 'Partner With Us form'],
  ];

  const inner = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="d-hdr" style="background:#141414;padding:22px 28px;line-height:1;">
  <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:5px;color:#ffffff;">JAZA</div>
  <div style="font-size:8px;letter-spacing:6px;color:#FFCA26;margin-top:4px;padding-left:4px;">ADMIN</div>
</td>
<td class="d-hdr" align="right" style="background:#141414;padding:22px 28px;"><span style="display:inline-block;border-radius:999px;background:${kind === 'cancelled' ? '#C9503F' : '#FFCA26'};color:${kind === 'cancelled' ? '#ffffff' : '#141414'};font-size:11px;font-weight:700;letter-spacing:1.5px;padding:7px 12px;">${label}</span></td>
</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:24px 28px 0;">
  <p class="d-gold" style="margin:0;font-size:11px;letter-spacing:2px;color:#9A6F00;font-weight:700;">${MEETING.toUpperCase()}</p>
  <h1 class="d-ink" style="margin:8px 0 0;font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.15;color:#141414;">${esc(who)}</h1>
</td></tr>
<tr><td style="padding:18px 23px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  ${tile('DATE', p.short)}${tile(`TIME (${p.tzName})`, `${p.time} – ${end.time}`)}${tile(kind === 'cancelled' ? 'STATUS' : 'STARTS IN', kind === 'cancelled' ? 'Cancelled' : startsIn)}
</tr></table></td></tr>
<tr><td style="padding:18px 23px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  ${kind !== 'cancelled' && b.meet_url ? btn(b.meet_url, 'JOIN MEET', true) : ''}
  ${btn(`mailto:${b.email}`, `REPLY TO ${esc(firstName(b.full_name).toUpperCase())}`, kind === 'cancelled' || !b.meet_url)}
  ${btn(`${base}/admin/dashboard`, 'OPEN ADMIN', false)}
</tr></table></td></tr>
<tr><td style="padding:22px 28px 0;"><div class="d-line" style="border-top:1px solid #EEE9DD;padding-top:18px;">${sectionLabel('CONTACT')}${detailsGrid(details)}</div></td></tr>
${
  b.description
    ? `<tr><td style="padding:6px 28px 0;"><div class="d-tip" style="background:#FBF6E6;border:1px solid #F1E6C4;border-radius:14px;padding:16px 18px;">${sectionLabel('ABOUT THE BUSINESS')}<div class="d-body" style="font-size:14px;line-height:1.65;color:#3d3a34;white-space:pre-line;">${esc(b.description)}</div></div></td></tr>`
    : ''
}
<tr><td style="padding:0 0 26px;"></td></tr>
</table>`;

  const subject = `${label === 'NEW BOOKING' ? 'New booking' : label === 'RESCHEDULED' ? 'Rescheduled' : 'Cancelled'}: ${who} — ${p.short} · ${p.time}`;
  const text = [
    subject,
    `Email: ${b.email}`,
    b.phone ? `Phone: ${b.phone}` : '',
    b.meet_url ? `Meet: ${b.meet_url}` : '',
    `Reference: ${bookingRef(b)}`,
    `Booked on: ${stamp(b.created_at, tz)}`,
    b.description ? `\nAbout the business:\n${b.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject,
    html: shell(subject, inner, 'Sent to the notification email set in Admin › Discovery Calls.'),
    text,
  };
}

/* ---------------- send ---------------- */

async function send(payload: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('[booking/email] RESEND_API_KEY / RESEND_FROM_EMAIL missing');
    return false;
  }
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, ...payload }),
  });
  if (!res.ok) console.error('[booking/email] send failed', res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

/** Email to the lead (in their timezone) with the .ics attached. */
export async function emailInvitee(kind: Kind, b: Booking, s: BookingSettings) {
  const tz = b.invitee_timezone || s.timezone;
  const { subject, html, text } = renderInvitee(kind, b, tz);
  const attach = kind === 'confirmed' || kind === 'rescheduled' || kind === 'cancelled';
  return send({
    to: [b.email],
    reply_to: s.host_email || SUPPORT_EMAIL,
    subject,
    html,
    text,
    ...(attach
      ? {
          attachments: [
            {
              filename: 'invite.ics',
              content: Buffer.from(buildIcs(b, s, kind === 'cancelled' ? 'CANCEL' : 'REQUEST')).toString('base64'),
            },
          ],
        }
      : {}),
  });
}

/** Designed alert to the host (in the host timezone). */
export async function emailHost(kind: 'confirmed' | 'rescheduled' | 'cancelled', b: Booking, s: BookingSettings) {
  const { subject, html, text } = renderHost(kind, b, s);
  return send({ to: [s.host_email || SUPPORT_EMAIL], reply_to: b.email, subject, html, text });
}
