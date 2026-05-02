import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Cap uploads per IP to discourage spammy file flooding. Each successful
// application requires 2 uploads, so 20 in 10 minutes is generous.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 20 };

const ALLOWED_BUCKETS = new Set(['career_resumes', 'career_portfolios']);

const ALLOWED_MIME = {
  career_resumes: new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
  career_portfolios: new Set([
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]),
} as const;

const MAX_BYTES = {
  career_resumes: 5 * 1024 * 1024,
  career_portfolios: 10 * 1024 * 1024,
} as const;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`career-upload:${ip}`, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limit.resetMs / 1000)),
        },
      },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const bucket = formData.get('bucket') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!bucket || !ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const bucketKey = bucket as keyof typeof ALLOWED_MIME;
  if (!ALLOWED_MIME[bucketKey].has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || 'unknown'}` },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES[bucketKey]) {
    return NextResponse.json(
      {
        error: `File too large. Max size: ${MAX_BYTES[bucketKey] / (1024 * 1024)} MB`,
      },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-128);
    const objectKey = `${timestamp}-${sanitized}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectKey, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[api/career-upload] upload failed:', uploadError.message);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 },
      );
    }

    // Buckets are private — we store the object key (not a public URL) and
    // the admin dashboard mints a short-lived signed URL on demand.
    return NextResponse.json({
      success: true,
      data: {
        url: objectKey,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/career-upload] error:', message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
