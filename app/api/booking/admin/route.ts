import { NextResponse } from 'next/server';
import { z } from 'zod';

import { cancelBooking } from '@/lib/booking/actions';
import { isAdminRequest } from '@/lib/booking/admin-auth';
import { type Booking, db, getDaysOff, getSettings, googleConfigured } from '@/lib/booking/core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const calOf = (request: Request) => (new URL(request.url).searchParams.get('cal') === '2' ? 2 : 1);

const deny = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return deny();
  const cal = calOf(request);
  const s = await getSettings(cal);
  const { data: bookings } = await db()
    .from('bookings')
    .select('*')
    .eq('calendar_id', cal)
    .gte('start_at', new Date(Date.now() - 7 * 86400_000).toISOString())
    .order('start_at', { ascending: true })
    .limit(300);
  const { google_refresh_token, ...settings } = s;
  return NextResponse.json({
    settings,
    googleConnected: Boolean(google_refresh_token),
    googleConfigured: googleConfigured(),
    daysOff: (await getDaysOff()).sort(),
    bookings: bookings ?? [],
  });
}

const TIME = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const SettingsSchema = z.object({
  timezone: z.string().min(1).max(64),
  slot_minutes: z.number().int().min(10).max(240),
  buffer_minutes: z.number().int().min(0).max(120),
  min_notice_hours: z.number().int().min(0).max(336),
  max_days_ahead: z.number().int().min(1).max(180),
  weekly_hours: z.record(z.string().regex(/^[0-6]$/), z.array(z.tuple([TIME, TIME]).refine(([a, b]) => a < b, 'End must be after start'))),
  host_email: z.string().email().nullable().or(z.literal('')),
  google_calendar_id: z.string().min(1).max(200),
});

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return deny();
  const parsed = SettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid settings' }, { status: 400 });
  try {
    new Intl.DateTimeFormat('en', { timeZone: parsed.data.timezone });
  } catch {
    return NextResponse.json({ error: 'Unknown timezone' }, { status: 400 });
  }
  const { error } = await db()
    .from('booking_settings')
    .update({ ...parsed.data, host_email: parsed.data.host_email || null, updated_at: new Date().toISOString() })
    .eq('id', calOf(request));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

const ActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add_day_off'), day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().max(200).optional() }),
  z.object({ action: z.literal('remove_day_off'), day: z.string() }),
  z.object({ action: z.literal('cancel_booking'), id: z.string().uuid() }),
  z.object({ action: z.literal('disconnect_google') }),
]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return deny();
  const parsed = ActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const a = parsed.data;
  if (a.action === 'add_day_off') {
    await db().from('booking_days_off').upsert({ day: a.day, note: a.note ?? null });
  } else if (a.action === 'remove_day_off') {
    await db().from('booking_days_off').delete().eq('day', a.day);
  } else if (a.action === 'disconnect_google') {
    await db().from('booking_settings').update({ google_refresh_token: null, google_account_email: null }).eq('id', calOf(request));
  } else {
    const { data } = await db().from('bookings').select('*').eq('id', a.id).maybeSingle();
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const res = await cancelBooking(data as Booking);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
