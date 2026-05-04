import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  corsHeaders,
  handlePreflight,
  rejectDisallowedOrigin,
} from '@/lib/cors';

export const runtime = 'nodejs';

// Mints a one-time signed upload URL so the browser can PUT the file
// directly to Supabase Storage. Streaming the bytes through this Vercel
// function would hit the platform's ~4.5 MB request body cap, which is
// why the old /api/career-upload flow couldn't grow past that limit.
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
  career_resumes: 100 * 1024 * 1024,
  career_portfolios: 100 * 1024 * 1024,
} as const;

export async function OPTIONS(request: Request) {
  return handlePreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  const originReject = rejectDisallowedOrigin(request);
  if (originReject) return originReject;
  const cors = corsHeaders(request.headers.get('origin'));

  const ip = getClientIp(request);
  const limit = await rateLimit(`career-upload-url:${ip}`, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
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

  let body: {
    filename?: unknown;
    type?: unknown;
    size?: unknown;
    bucket?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: cors },
    );
  }

  const filename = typeof body.filename === 'string' ? body.filename : '';
  const type = typeof body.type === 'string' ? body.type : '';
  const size = typeof body.size === 'number' ? body.size : NaN;
  const bucket = typeof body.bucket === 'string' ? body.bucket : '';

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required' },
      { status: 400, headers: cors },
    );
  }
  if (!type) {
    return NextResponse.json(
      { error: 'File type is required' },
      { status: 400, headers: cors },
    );
  }
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json(
      { error: 'File size is required' },
      { status: 400, headers: cors },
    );
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json(
      { error: 'Invalid bucket' },
      { status: 400, headers: cors },
    );
  }

  const bucketKey = bucket as keyof typeof ALLOWED_MIME;
  if (!ALLOWED_MIME[bucketKey].has(type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${type || 'unknown'}` },
      { status: 400, headers: cors },
    );
  }
  if (size > MAX_BYTES[bucketKey]) {
    return NextResponse.json(
      {
        error: `File too large. Max size: ${MAX_BYTES[bucketKey] / (1024 * 1024)} MB`,
      },
      { status: 400, headers: cors },
    );
  }

  try {
    const supabase = createAdminClient();
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-128);
    const objectKey = `${timestamp}-${sanitized}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(objectKey);

    if (error || !data) {
      console.error(
        '[api/career-upload-url] mint failed:',
        error?.message ?? 'no data',
      );
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500, headers: cors },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          path: data.path,
          token: data.token,
          signedUrl: data.signedUrl,
        },
      },
      { headers: cors },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/career-upload-url] error:', message);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: cors },
    );
  }
}
