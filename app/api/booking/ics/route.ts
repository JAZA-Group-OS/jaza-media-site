import { getBookingByToken } from '@/lib/booking/actions';
import { getSettings } from '@/lib/booking/core';
import { buildIcs } from '@/lib/booking/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/booking/ics?token=…  → downloadable calendar file ("Apple (.ics)" link in emails).
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const b = await getBookingByToken(token);
  if (!b || b.status !== 'confirmed') return new Response('Booking not found', { status: 404 });
  const ics = buildIcs(b, await getSettings(), 'PUBLISH');
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="jaza-media-call.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
