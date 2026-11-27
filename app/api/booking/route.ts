import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createBooking } from '@/lib/booking/actions';
import { db } from '@/lib/booking/core';
import { calendarForLead } from '@/lib/booking/leads';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const Schema = z.object({
  start: z.string().datetime(),
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  company: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: z.string().trim().max(40).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  timezone: z.string().max(64).optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  _hp: z.string().optional(),
});

export async function POST(request: Request) {
  const limit = await rateLimit(`booking:${getClientIp(request)}`, { windowMs: 10 * 60_000, max: 5 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the fields marked in red.', issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
      { status: 400 },
    );
  }
  // Honeypot filled → pretend success, store nothing.
  if (parsed.data._hp) return NextResponse.json({ ok: true });

  try {
    let calendarId = 1;
    if (parsed.data.leadId) {
      const routed = await calendarForLead(parsed.data.leadId);
      if (!routed) return NextResponse.json({ error: 'This booking link is not valid.' }, { status: 403 });
      if (routed.lead.booking_id) return NextResponse.json({ error: 'You already booked a call. Check your email to reschedule.' }, { status: 409 });
      calendarId = routed.calendarId;
    }
    const res = await createBooking({ ...parsed.data, calendarId });
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
    if (parsed.data.leadId) await db().from('booking_leads').update({ booking_id: res.booking.id }).eq('id', parsed.data.leadId);
    return NextResponse.json({ ok: true, manageToken: res.booking.manage_token, start: res.booking.start_at, meetUrl: res.booking.meet_url });
  } catch (err) {
    console.error('[api/booking]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
