import { NextResponse } from 'next/server';

import { type Booking, db, getSettings } from '@/lib/booking/core';
import { emailInvitee } from '@/lib/booking/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called every 5 minutes by Supabase pg_cron (see the booking setup SQL) with
// `Authorization: Bearer <BOOKING_CRON_SECRET>`. Sends the 24h and 1h reminders once each.
export async function POST(request: Request) {
  const secret = process.env.BOOKING_CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cals = { 1: await getSettings(1), 2: await getSettings(2).catch(() => null) } as Record<number, Awaited<ReturnType<typeof getSettings>> | null>;
  const now = Date.now();
  const { data } = await db()
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gt('start_at', new Date(now).toISOString())
    .lte('start_at', new Date(now + 24 * 3600_000).toISOString());

  let sent = 0;
  for (const b of (data ?? []) as Booking[]) {
    const s = cals[b.calendar_id] ?? cals[1]!;
    const minsAway = (Date.parse(b.start_at) - now) / 60_000;
    // Skip the 24h reminder for calls booked less than ~2h before they start.
    const bookedLate = Date.parse(b.start_at) - Date.parse(b.created_at) < 2 * 3600_000;
    if (minsAway <= 60 && !b.reminder_1h_sent_at) {
      if (await emailInvitee('reminder_1h', b, s)) {
        await db().from('bookings').update({ reminder_1h_sent_at: new Date().toISOString(), reminder_24h_sent_at: b.reminder_24h_sent_at ?? new Date().toISOString() }).eq('id', b.id);
        sent++;
      }
    } else if (minsAway > 60 && !b.reminder_24h_sent_at && !bookedLate) {
      if (await emailInvitee('reminder_24h', b, s)) {
        await db().from('bookings').update({ reminder_24h_sent_at: new Date().toISOString() }).eq('id', b.id);
        sent++;
      }
    }
  }
  return NextResponse.json({ ok: true, sent });
}
