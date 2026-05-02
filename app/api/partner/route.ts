import { NextResponse } from 'next/server';
import { PartnerInquirySchema } from '@/lib/validations/partner-inquiry';
import { qualify } from '@/lib/partner/qualify';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  corsHeaders,
  handlePreflight,
  rejectDisallowedOrigin,
} from '@/lib/cors';
import type { Answers } from '@/lib/partner/questions';
import type { PartnerInquiryInsert } from '@/lib/types/database';

export const runtime = 'nodejs';

// 5 inquiries per IP per 10 minutes. Tune up/down based on observed abuse.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };

export async function OPTIONS(request: Request) {
  return handlePreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const originReject = rejectDisallowedOrigin(request);
  if (originReject) return originReject;
  const cors = corsHeaders(request.headers.get('origin'));

  const ip = getClientIp(request);
  const limit = await rateLimit(`partner:${ip}`, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...cors,
          'Retry-After': String(Math.ceil(limit.resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: cors });
  }

  const parsed = PartnerInquirySchema.safeParse(body);
  if (!parsed.success) {
    // Don't echo the user's input back in the error response.
    return NextResponse.json(
      {
        error: 'Invalid input',
        issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400, headers: cors },
    );
  }

  const data = parsed.data;
  const outcome = qualify(data as Answers);

  const inquiryRow: PartnerInquiryInsert = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    location: data.location ?? null,
    business_type: data.businessType ?? null,
    business_description: data.description ?? null,
    help_type: data.helpType ?? null,
    monthly_revenue: data.monthlyRevenue ?? null,
    willing_to_invest: data.willingToInvest ?? null,
    budget: data.budget ?? null,
    challenge: data.challenge ?? null,
    timeline: data.timeline ?? null,
    outcome,
    source: 'marketing_site',
  };

  try {
    const supabase = createAdminClient();
    const { error } = await (
      supabase.from('partner_inquiries') as unknown as {
        insert: (row: PartnerInquiryInsert) => Promise<{ error: Error | null }>;
      }
    ).insert(inquiryRow);

    if (error) {
      // Log only the error code/message — never the full row (PII).
      console.error('[api/partner] insert failed:', (error as { code?: string }).code, error.message);
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500, headers: cors });
    }

    return NextResponse.json({ success: true, outcome }, { headers: cors });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/partner] unexpected error:', message);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: cors });
  }
}
