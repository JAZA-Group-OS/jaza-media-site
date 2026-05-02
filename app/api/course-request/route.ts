import { NextResponse } from 'next/server';
import { CourseRequestSchema } from '@/lib/validations/course-request';
import { COURSE_CATALOG } from '@/lib/courses/catalog';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sendCourseDeliveryEmail } from '@/lib/email/course-delivery';

export const runtime = 'nodejs';

// 10 claims per IP per 10 minutes — generous for legit users while still
// catching obvious floods if someone scripts the form.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 10 };

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`course-request:${ip}`, RATE_LIMIT);
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

  const parsed = CourseRequestSchema.safeParse(body);
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
  const course = COURSE_CATALOG[data.courseSlug];

  try {
    const supabase = createAdminClient();
    const { data: inserted, error } = await (
      supabase.from('course_requests') as unknown as {
        insert: (row: Record<string, unknown>) => {
          select: (cols: string) => {
            single: () => Promise<{
              data: { id: string } | null;
              error: Error | null;
            }>;
          };
        };
      }
    )
      .insert({
        course_slug: data.courseSlug,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        source: 'courses_site',
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error(
        '[api/course-request] insert failed:',
        (error as { code?: string } | null)?.code,
        error?.message,
      );
      return NextResponse.json(
        { error: 'Failed to save request' },
        { status: 500 },
      );
    }

    // Email is best-effort. We record sent/failure metadata back on the row
    // so admins can spot delivery issues without digging through server logs.
    let emailDetail: string | undefined;
    try {
      const result = await sendCourseDeliveryEmail({
        toEmail: data.email,
        toName: data.firstName,
        course,
      });
      const update: Record<string, unknown> =
        result.sent
          ? { email_sent_at: new Date().toISOString(), email_error: null }
          : {
              email_error:
                result.reason === 'missing_config'
                  ? 'missing_config'
                  : `send_failed: ${result.detail ?? ''}`.slice(0, 500),
            };
      emailDetail = result.sent ? undefined : result.reason;
      await (
        supabase.from('course_requests') as unknown as {
          update: (row: Record<string, unknown>) => {
            eq: (
              col: string,
              val: string,
            ) => Promise<{ error: Error | null }>;
          };
        }
      )
        .update(update)
        .eq('id', inserted.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      console.error('[api/course-request] email send error:', message);
    }

    return NextResponse.json({ success: true, emailStatus: emailDetail ?? 'sent' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/course-request] unexpected error:', message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
