import { NextResponse } from 'next/server';
import { z } from 'zod';

import { cancelBooking, getBookingByToken, publicView, rescheduleBooking } from '@/lib/booking/actions';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const b = await getBookingByToken(token);
  if (!b) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json(publicView(b), { headers: { 'Cache-Control': 'no-store' } });
}

const Schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), token: z.string() }),
  z.object({ action: z.literal('reschedule'), token: z.string(), start: z.string().datetime() }),
]);

export async function POST(request: Request) {
  const limit = await rateLimit(`booking-manage:${getClientIp(request)}`, { windowMs: 10 * 60_000, max: 10 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const b = await getBookingByToken(parsed.data.token);
  if (!b) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (Date.parse(b.start_at) < Date.now()) return NextResponse.json({ error: 'This call has already started.' }, { status: 400 });

  const res = parsed.data.action === 'cancel' ? await cancelBooking(b) : await rescheduleBooking(b, parsed.data.start);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(publicView(res.booking));
}
