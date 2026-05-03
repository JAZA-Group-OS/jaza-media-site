import { NextResponse } from 'next/server';
import { SupportTicketSchema } from '@/lib/validations/support-ticket';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  corsHeaders,
  handlePreflight,
  rejectDisallowedOrigin,
} from '@/lib/cors';
import type { SupportTicketInsert } from '@/lib/types/database';

export const runtime = 'nodejs';

// 8 submissions per IP per 10 minutes — looser than partner's 5/10 because
// support sees legitimate repeat submitters (typo correction, follow-up,
// clarification). Tight enough to deny floods.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 8 };

export async function OPTIONS(request: Request) {
  return handlePreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const originReject = rejectDisallowedOrigin(request);
  if (originReject) return originReject;
  const cors = corsHeaders(request.headers.get('origin'));

  const ip = getClientIp(request);
  const limit = await rateLimit(`support:${ip}`, RATE_LIMIT);
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

  const parsed = SupportTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400, headers: cors },
    );
  }

  const data = parsed.data;

  // Honeypot trip: silently succeed without writing. Don't tell bots.
  if (data._hp && data._hp.length > 0) {
    return NextResponse.json({ success: true }, { headers: cors });
  }

  const ticketRow: SupportTicketInsert = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
    topic: data.topic,
    subject: data.subject,
    message: data.message,
    source: 'marketing_site',
  };

  try {
    const supabase = createAdminClient();
    const { error } = await (
      supabase.from('support_tickets') as unknown as {
        insert: (row: SupportTicketInsert) => Promise<{ error: Error | null }>;
      }
    ).insert(ticketRow);

    if (error) {
      console.error('[api/support] insert failed:', (error as { code?: string }).code, error.message);
      return NextResponse.json(
        { error: 'Failed to save your message' },
        { status: 500, headers: cors },
      );
    }

    return NextResponse.json({ success: true }, { headers: cors });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/support] unexpected error:', message);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: cors });
  }
}
