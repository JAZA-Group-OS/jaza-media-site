import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const ALLOWED_MIME_TYPES = {
  resume: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  image: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

const MAX_FILE_SIZE = {
  resume: 5 * 1024 * 1024, // 5MB
  image: 2 * 1024 * 1024, // 2MB
} as const;

// Whitelist of buckets the API may write to / delete from.
const ALLOWED_BUCKETS = new Set(['resumes', 'images']);

const ADMIN_EMAIL = 'jaza.intern@gmail.com';

async function requireAdmin(): Promise<{ ok: boolean }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return { ok: false };
  }
  return { ok: true };
}

export async function POST(request: NextRequest) {
  // Auth: only signed-in admin can upload.
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('type') as 'resume' | 'image' | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (fileType !== 'resume' && fileType !== 'image') {
      return NextResponse.json({ error: 'Invalid file type parameter' }, { status: 400 });
    }

    const allowedTypes: readonly string[] = ALLOWED_MIME_TYPES[fileType];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxSize = MAX_FILE_SIZE[fileType];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}-${sanitizedName}`;
    const bucket = fileType === 'resume' ? 'resumes' : 'images';

    const supabase = await createServerClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFilename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[api/upload] supabase upload error:', uploadError.message);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uniqueFilename);

    return NextResponse.json({
      success: true,
      data: {
        filename: uniqueFilename,
        url: publicUrlData.publicUrl,
        bucket,
        size: file.size,
        type: file.type,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/upload] error:', message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const bucket = searchParams.get('bucket') ?? 'resumes';

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase.storage.from(bucket).remove([filename]);

    if (error) {
      console.error('[api/upload] delete error:', error.message);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/upload] delete error:', message);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// GET removed: previously leaked allowed MIME types and size limits to anyone.
// Health-check the route by attempting an authenticated POST or check Vercel logs.
