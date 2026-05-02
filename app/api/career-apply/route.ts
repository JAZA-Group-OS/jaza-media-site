import { NextResponse } from 'next/server';
import { CareerApplicationSchema } from '@/lib/validations/career-application';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sendCareerThankYouEmail } from '@/lib/email/career-thank-you';
import { POSITION_LABELS } from '@/lib/career/questions';

export const runtime = 'nodejs';

// 5 applications per IP per 10 minutes is plenty for legit submitters.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`career-apply:${ip}`, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
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
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    const supabase = createAdminClient();
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
        { status: 500 },
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

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/career-apply] unexpected error:', message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
