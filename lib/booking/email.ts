import 'server-only';

import { getSiteBaseUrl } from '@/lib/site-url';
import type { Booking, BookingSettings } from './core';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const SUPPORT_EMAIL = 'admin@jazamedia.com';

type Kind = 'confirmed' | 'rescheduled' | 'cancelled' | 'reminder_24h' | 'reminder_1h';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function formatWhen(iso: string, tz: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return `${date} · ${time}`;
}

function icsDate(iso: string) {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildIcs(b: Booking, s: BookingSettings, method: 'REQUEST' | 'CANCEL'): string {
  const host = s.host_email || SUPPORT_EMAIL;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JAZA Media//Booking//EN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${b.id}@jazamedia.com`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(new Date(b.start_at).toISOString())}`,
    `DTEND:${icsDate(new Date(b.end_at).toISOString())}`,
    'SUMMARY:JAZA Media — Discovery & Strategy Meeting',
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

const COPY: Record<Kind, { subject: string; heading: string; intro: string }> = {
  confirmed: {
    subject: "You're booked: JAZA Media Discovery Call",
    heading: "You're booked.",
    intro: 'Your discovery & strategy meeting with JAZA Media is confirmed.',
  },
  rescheduled: {
    subject: 'Rescheduled: JAZA Media Discovery Call',
    heading: 'Your call has moved.',
    intro: 'Your discovery & strategy meeting has been rescheduled to the new time below.',
  },
  cancelled: {
    subject: 'Cancelled: JAZA Media Discovery Call',
    heading: 'Your call is cancelled.',
    intro: "Your discovery call has been cancelled. Whenever you're ready, you can book a new time.",
  },
  reminder_24h: {
    subject: 'Tomorrow: JAZA Media Discovery Call',
    heading: 'See you tomorrow.',
    intro: 'A quick reminder that your discovery call with JAZA Media is coming up.',
  },
  reminder_1h: {
    subject: 'Starting in 1 hour: JAZA Media Discovery Call',
    heading: 'Starting in 1 hour.',
    intro: 'Your discovery call with JAZA Media starts soon. Use the button below to join.',
  },
};

function render(kind: Kind, b: Booking, tz: string) {
  const c = COPY[kind];
  const base = getSiteBaseUrl();
  const manage = `${base}/partner-with-us/manage?token=${b.manage_token}`;
  const when = formatWhen(b.start_at, tz);
  const cta =
    kind === 'cancelled'
      ? { href: `${base}/partner-with-us/book`, label: 'Book a new time' }
      : b.meet_url
        ? { href: b.meet_url, label: 'Join Google Meet' }
        : null;

  const text = [
    `Hi ${b.full_name},`,
    '',
    c.intro,
    '',
    `When: ${when}`,
    kind !== 'cancelled' && b.meet_url ? `Google Meet: ${b.meet_url}` : '',
    kind !== 'cancelled' ? `Need to reschedule or cancel? ${manage}` : `Book again: ${base}/partner-with-us/book`,
    '',
    '— The JAZA Media Team',
  ]
    .filter((l) => l !== '')
    .join('\n');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#0b0d0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0d0c;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141410;border:1px solid #4a3d14;border-radius:20px;">
<tr><td style="padding:36px 32px 8px;text-align:center;">
<div style="font-family:Georgia,serif;font-size:30px;letter-spacing:6px;color:#ffffff;">JAZA</div>
<div style="font-size:10px;letter-spacing:8px;color:#ffca26;margin-top:4px;">MEDIA</div>
</td></tr>
<tr><td style="padding:20px 32px 8px;text-align:center;">
<h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:32px;color:#ffffff;">${esc(c.heading)}</h1>
<p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#bdbdb5;">Hi ${esc(b.full_name)}, ${esc(c.intro.charAt(0).toLowerCase() + c.intro.slice(1))}</p>
</td></tr>
<tr><td style="padding:20px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1c1b15;border:1px solid #3a3216;border-radius:14px;">
<tr><td style="padding:18px 20px;">
<div style="font-size:10px;letter-spacing:3px;color:#ffca26;">WHEN</div>
<div style="margin-top:6px;font-size:16px;color:#ffffff;${kind === 'cancelled' ? 'text-decoration:line-through;color:#8a8a80;' : ''}">${esc(when)}</div>
<div style="margin-top:14px;font-size:10px;letter-spacing:3px;color:#ffca26;">WHERE</div>
<div style="margin-top:6px;font-size:15px;color:#ffffff;">Google Meet${b.meet_url && kind !== 'cancelled' ? ` · <a href="${esc(b.meet_url)}" style="color:#ffca26;">${esc(b.meet_url.replace(/^https?:\/\//, ''))}</a>` : ''}</div>
</td></tr></table>
</td></tr>
${cta ? `<tr><td style="padding:4px 32px 8px;text-align:center;"><a href="${esc(cta.href)}" style="display:inline-block;background:#ffca26;color:#0c0c0e;text-decoration:none;font-weight:600;font-size:12px;letter-spacing:2px;padding:14px 28px;border-radius:999px;">${esc(cta.label.toUpperCase())}</a></td></tr>` : ''}
${kind !== 'cancelled' ? `<tr><td style="padding:16px 32px 32px;text-align:center;font-size:13px;color:#8a8a80;">Need to change plans? <a href="${esc(manage)}" style="color:#ffca26;">Reschedule or cancel</a></td></tr>` : '<tr><td style="padding:16px"></td></tr>'}
</table>
<p style="margin:20px 0 0;font-size:12px;color:#6b6b63;">Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#8a8a80;">${SUPPORT_EMAIL}</a></p>
</td></tr></table></body></html>`;

  return { subject: c.subject, html, text };
}

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
  const { subject, html, text } = render(kind, b, tz);
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

/** Short notice to the host (in the host timezone). */
export async function emailHost(kind: 'confirmed' | 'rescheduled' | 'cancelled', b: Booking, s: BookingSettings) {
  const to = s.host_email || SUPPORT_EMAIL;
  const label = { confirmed: 'New booking', rescheduled: 'Rescheduled', cancelled: 'Cancelled' }[kind];
  const when = formatWhen(b.start_at, s.timezone);
  const text = [
    `${label}: ${b.full_name}`,
    `When: ${when}`,
    `Email: ${b.email}`,
    b.phone ? `Phone: ${b.phone}` : '',
    b.meet_url ? `Meet: ${b.meet_url}` : '',
    b.description ? `\nAbout the business:\n${b.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return send({
    to: [to],
    reply_to: b.email,
    subject: `${label}: ${b.full_name} — ${when}`,
    text,
    html: `<pre style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;white-space:pre-wrap">${esc(text)}</pre>`,
  });
}
