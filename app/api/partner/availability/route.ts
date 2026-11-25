import { NextResponse } from 'next/server';

// Reads the free days/times of the JAZA discovery-call event from Calendly's
// public booking data (the same data calendly.com's own booking page loads).
// Not an official Calendly API — if it fails, the booking page falls back to
// the regular Calendly embed, so booking never breaks.

const PROFILE = 'jazamediaph';
const EVENT = 'discovery-call';
const BASE = 'https://calendly.com/api/booking';

type RangeDay = { date: string; status: string; spots?: { start_time: string; status?: string }[] };

let cachedUuid: string | null = null;

async function eventUuid(): Promise<string> {
  if (cachedUuid) return cachedUuid;
  const r = await fetch(`${BASE}/event_types/lookup?event_type_slug=${EVENT}&profile_slug=${PROFILE}`, {
    next: { revalidate: 3600 },
  });
  if (!r.ok) throw new Error(`lookup ${r.status}`);
  const d = (await r.json()) as { uuid?: string };
  if (!d.uuid) throw new Error('no uuid');
  cachedUuid = d.uuid;
  return d.uuid;
}

function isValidTz(tz: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') ?? '';
  const tzParam = searchParams.get('tz') ?? 'Asia/Manila';
  const tz = tzParam.length < 64 && isValidTz(tzParam) ? tzParam : 'Asia/Manila';
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: 'month must be YYYY-MM' }, { status: 400 });
  }

  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = `${month}-${String(last).padStart(2, '0')}`;

  try {
    const uuid = await eventUuid();
    const url =
      `${BASE}/event_types/${uuid}/calendar/range?timezone=${encodeURIComponent(tz)}` +
      `&diagnostics=false&range_start=${start}&range_end=${end}`;
    const r = await fetch(url, { next: { revalidate: 60 } });
    if (!r.ok) throw new Error(`range ${r.status}`);
    const d = (await r.json()) as { days?: RangeDay[] };
    const days = (d.days ?? [])
      .filter((day) => day.status === 'available' && day.spots?.length)
      .map((day) => ({
        date: day.date,
        spots: day.spots!.filter((s) => !s.status || s.status === 'available').map((s) => s.start_time),
      }))
      .filter((day) => day.spots.length);
    return NextResponse.json(
      { month, timezone: tz, days },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } },
    );
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
}
