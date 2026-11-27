import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db, getSettings } from '@/lib/booking/core';
import { emailNurtureHost, emailNurtureLead } from '@/lib/booking/email';
import { BUDGETS, DECISION, SERVICES, SIZES, STARTS, scoreLead } from '@/lib/booking/lead-score';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const Schema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(120).optional().nullable(),
  service: z.enum(SERVICES),
  companySize: z.enum(SIZES),
  budget: z.enum(BUDGETS),
  start: z.enum(STARTS),
  decisionMaker: z.enum(DECISION),
  _hp: z.string().optional(),
});

// POST /api/book-a-call → score the answers, save the lead, route it.
// Returns { tier: 'ceo' | 'sales', leadId } (then the calendar), or { tier: 'nurture' }.
export async function POST(request: Request) {
  const limit = await rateLimit(`book-a-call:${getClientIp(request)}`, { windowMs: 10 * 60_000, max: 8 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the fields marked in red.', issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
      { status: 400 },
    );
  }
  const a = parsed.data;
  if (a._hp) return NextResponse.json({ tier: 'nurture' });

  const { score, tier } = scoreLead(a);
  const row = {
    full_name: a.fullName,
    email: a.email,
    phone: a.phone || null,
    company: a.company || null,
    service: a.service,
    company_size: a.companySize,
    budget: a.budget,
    start_when: a.start,
    decision_maker: a.decisionMaker,
    score,
    tier,
  };
  const { data, error } = await db().from('booking_leads').insert(row).select('id').single();
  if (error) {
    console.error('[api/book-a-call] insert failed', error.code, error.message);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }

  if (tier === 'nurture') {
    const sales = await getSettings(2).catch(() => null);
    await Promise.allSettled([emailNurtureLead(row, sales?.host_email ?? null), emailNurtureHost(row, sales?.host_email ?? null)]);
    return NextResponse.json({ tier });
  }
  return NextResponse.json({ tier, leadId: data.id });
}
