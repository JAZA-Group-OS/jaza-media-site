import { NextResponse } from 'next/server';
import { CareerApplicationSchema } from '@/lib/validations/career-application';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  corsHeaders,
  handlePreflight,
  rejectDisallowedOrigin,
} from '@/lib/cors';
import { sendCareerThankYouEmail } from '@/lib/email/career-thank-you';
import { POSITION_LABELS } from '@/lib/career/questions';

export const runtime = 'nodejs';

// 15 applications per IP per 10 minutes — generous enough that legit
// resubmits (typo fixes, nervous double-clicks) and QA passes don't trip
// the limit while still throttling drive-by spam.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 15 };

export async function OPTIONS(request: Request) {
  return handlePreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const originReject = rejectDisallowedOrigin(request);
  if (originReject) return originReject;
  const cors = corsHeaders(request.headers.get('origin'));

  const ip = getClientIp(request);
  const limit = await rateLimit(`career-apply:${ip}`, RATE_LIMIT);
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

  const parsed = CareerApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        issues: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400, headers: cors },
    );
  }

  const data = parsed.data;

  try {
    const supabase = createAdminClient();

    // Verify the referenced objects actually exist in our buckets before
    // recording them. A submitted path that was never uploaded (or targets
    // the wrong bucket) must fail here — not later, when an admin clicks a
    // dead "Resume / CV" link.
    const [resumeCheck, portfolioCheck] = await Promise.all([
      supabase.storage
        .from('career_resumes')
        .createSignedUrl(data.resume.url, 60),
      supabase.storage
        .from('career_portfolios')
        .createSignedUrl(data.portfolio.url, 60),
    ]);
    if (resumeCheck.error || portfolioCheck.error) {
      return NextResponse.json(
        {
          error:
            'Your uploaded files could not be verified. Please re-upload your resume and portfolio, then submit again.',
        },
        { status: 400, headers: cors },
      );
    }

    const { error } = await (
      supabase.from('career_applications') as unknown as {
        insert: (row: Record<string, unknown>) => Promise<{ error: Error | null }>;
      }
    ).insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      facebook: data.facebook,
      location: data.location,
      position: data.position,
      description: data.description,
      resume_url: data.resume.url,
      resume_filename: data.resume.filename,
      resume_size_bytes: data.resume.size,
      resume_mime_type: data.resume.type,
      portfolio_url: data.portfolio.url,
      portfolio_filename: data.portfolio.filename,
      portfolio_size_bytes: data.portfolio.size,
      portfolio_mime_type: data.portfolio.type,
      source: 'careers_site',
    });

    if (error) {
      console.error(
        '[api/career-apply] insert failed:',
        (error as { code?: string }).code,
        error.message,
      );
      return NextResponse.json(
        { error: 'Failed to save application' },
        { status: 500, headers: cors },
      );
    }

    // Email is best-effort: a delivery failure must not block the user from
    // seeing the thank-you page. Errors are logged inside the helper.
    try {
      await sendCareerThankYouEmail({
        toEmail: data.email,
        toName: data.fullName.split(' ')[0] || data.fullName,
        positionLabel: POSITION_LABELS[data.position],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      console.error('[api/career-apply] email send error:', message);
    }

    return NextResponse.json({ success: true }, { headers: cors });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/career-apply] unexpected error:', message);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: cors });
  }
}
