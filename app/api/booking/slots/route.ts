import { NextResponse } from 'next/server';

import { computeSlots, getSettings } from '@/lib/booking/core';
import { getBookingByToken } from '@/lib/booking/actions';
import { calendarForLead } from '@/lib/booking/leads';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/booking/slots[?token=<manage token>]  → every open slot (UTC ISO).
// With a manage token the booking's own current slot counts as free (reschedule).
export async function GET(request: Request) {
  const limit = await rateLimit(`booking-slots:${getClientIp(request)}`, { windowMs: 60_000, max: 30 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  try {
    const params = new URL(request.url).searchParams;
    const token = params.get('token');
    const own = token ? await getBookingByToken(token) : null;
    // ?lead=<id> → the calendar that Book a Call lead was routed to.
    const leadId = params.get('lead');
    const routed = leadId ? await calendarForLead(leadId) : null;
    if (leadId && !routed) return NextResponse.json({ error: 'This booking link is not valid.' }, { status: 404 });
    const s = await getSettings(own?.calendar_id ?? routed?.calendarId ?? 1);
    const slots = await computeSlots(s, { ignoreBookingId: own?.id });
    return NextResponse.json(
      { slots, slotMinutes: s.slot_minutes, hostTimezone: s.timezone },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[api/booking/slots]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Booking is unavailable right now.' }, { status: 503 });
  }
}
