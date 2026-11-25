import 'server-only';

import {
  type Booking,
  computeSlots,
  db,
  getSettings,
  googleCreateEvent,
  googleDeleteEvent,
  googleMoveEvent,
  newToken,
} from './core';
import { emailHost, emailInvitee } from './email';

export type ActionResult = { ok: true; booking: Booking } | { ok: false; status: number; error: string };

const SLOT_TAKEN = 'That time was just taken. Please pick another slot.';

export async function createBooking(input: {
  start: string;
  fullName: string;
  email: string;
  phone?: string | null;
  description?: string | null;
  timezone?: string | null;
}): Promise<ActionResult> {
  const s = await getSettings();
  const start = new Date(input.start).toISOString();
  const slots = await computeSlots(s);
  if (!slots.includes(start)) return { ok: false, status: 409, error: SLOT_TAKEN };

  const end = new Date(Date.parse(start) + s.slot_minutes * 60_000).toISOString();
  const { data, error } = await db()
    .from('bookings')
    .insert({
      start_at: start,
      end_at: end,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone || null,
      description: input.description || null,
      invitee_timezone: input.timezone || null,
      manage_token: newToken(),
    })
    .select('*')
    .single();
  if (error) {
    // 23P01 = exclusion violation → someone booked an overlapping slot first.
    if (error.code === '23P01') return { ok: false, status: 409, error: SLOT_TAKEN };
    console.error('[booking] insert failed', error.code, error.message);
    return { ok: false, status: 500, error: 'Could not save your booking. Please try again.' };
  }
  let booking = data as Booking;

  const ev = await googleCreateEvent(s, booking);
  if (ev) {
    const { data: upd } = await db()
      .from('bookings')
      .update({ google_event_id: ev.eventId, meet_url: ev.meetUrl })
      .eq('id', booking.id)
      .select('*')
      .single();
    if (upd) booking = upd as Booking;
  }

  await Promise.allSettled([emailInvitee('confirmed', booking, s), emailHost('confirmed', booking, s)]);
  return { ok: true, booking };
}

export async function getBookingByToken(token: string): Promise<Booking | null> {
  if (!token || token.length < 20) return null;
  const { data } = await db().from('bookings').select('*').eq('manage_token', token).maybeSingle();
  return (data as Booking) ?? null;
}

export async function rescheduleBooking(b: Booking, startIso: string): Promise<ActionResult> {
  if (b.status !== 'confirmed') return { ok: false, status: 400, error: 'This booking is cancelled.' };
  const s = await getSettings();
  const start = new Date(startIso).toISOString();
  const slots = await computeSlots(s, { ignoreBookingId: b.id });
  if (!slots.includes(start)) return { ok: false, status: 409, error: SLOT_TAKEN };
  const end = new Date(Date.parse(start) + s.slot_minutes * 60_000).toISOString();

  const { data, error } = await db()
    .from('bookings')
    .update({ start_at: start, end_at: end, reminder_24h_sent_at: null, reminder_1h_sent_at: null })
    .eq('id', b.id)
    .select('*')
    .single();
  if (error) {
    if (error.code === '23P01') return { ok: false, status: 409, error: SLOT_TAKEN };
    return { ok: false, status: 500, error: 'Could not reschedule. Please try again.' };
  }
  const booking = data as Booking;
  if (booking.google_event_id) await googleMoveEvent(s, booking.google_event_id, start, end);
  await Promise.allSettled([emailInvitee('rescheduled', booking, s), emailHost('rescheduled', booking, s)]);
  return { ok: true, booking };
}

export async function cancelBooking(b: Booking): Promise<ActionResult> {
  if (b.status === 'cancelled') return { ok: true, booking: b };
  const s = await getSettings();
  const { data, error } = await db()
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', b.id)
    .select('*')
    .single();
  if (error) return { ok: false, status: 500, error: 'Could not cancel. Please try again.' };
  const booking = data as Booking;
  if (booking.google_event_id) await googleDeleteEvent(s, booking.google_event_id);
  await Promise.allSettled([emailInvitee('cancelled', booking, s), emailHost('cancelled', booking, s)]);
  return { ok: true, booking };
}

/** Public-safe view of a booking for the manage page. */
export function publicView(b: Booking) {
  return { start: b.start_at, end: b.end_at, status: b.status, fullName: b.full_name, meetUrl: b.meet_url };
}
