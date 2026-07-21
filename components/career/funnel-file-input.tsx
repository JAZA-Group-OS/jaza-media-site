'use client';

import { useRef, useState } from 'react';
import { Upload, FileCheck2, X } from 'lucide-react';
import type { UploadedFile } from '@/lib/career/questions';
import { cn } from '@/lib/utils';

type Props = {
  ariaLabel: string;
  value: UploadedFile | undefined;
  onChange: (file: UploadedFile | undefined) => void;
  accept: string;
  maxSizeBytes: number;
  bucket: 'career_resumes' | 'career_portfolios';
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function FunnelFileInput({
  ariaLabel,
  value,
  onChange,
  accept,
  maxSizeBytes,
  bucket,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeBytes) {
      setError(
        `File too large. Max size: ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB`,
      );
      return;
    }

    setUploading(true);
    try {
      // Two-step upload: ask our API to mint a one-time signed URL, then PUT
      // the bytes directly to Supabase Storage. Going browser → Supabase
      // sidesteps Vercel's ~4.5 MB function body cap so files up to the
      // bucket's file_size_limit can flow through.
      const urlRes = await fetch('/api/career-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          type: file.type,
          size: file.size,
          bucket,
        }),
      });
      if (!urlRes.ok) {
        const body = (await urlRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Upload failed (${urlRes.status})`);
      }
      const urlJson = (await urlRes.json()) as {
        data: { path: string; token: string; signedUrl: string };
      };

      const putRes = await fetch(urlJson.data.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) {
        // Supabase responds 413 for over-plan-limit files (50 MB on Free,
        // higher on Pro). Surface a clear message rather than the raw status.
        if (putRes.status === 413) {
          throw new Error(
            'File exceeds the storage plan limit. Try a smaller file.',
          );
        }
        throw new Error(`Upload failed (${putRes.status})`);
      }

      onChange({
        url: urlJson.data.path,
        filename: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange(undefined);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-300 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileCheck2
            className="size-5 shrink-0 text-brand-black"
            strokeWidth={2.5}
          />
          <div className="min-w-0">
            <div className="truncate text-base font-medium text-brand-black">
              {value.filename}
            </div>
            <div className="text-xs text-neutral-500">
              {formatBytes(value.size)} · uploaded
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="Remove file"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-brand-black"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={ariaLabel}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'inline-flex min-h-[44px] items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-3 text-base font-medium text-brand-black transition-colors',
          'hover:border-neutral-500',
          'disabled:opacity-60',
        )}
      >
        <Upload className="size-4" strokeWidth={2.5} />
        {uploading ? 'Uploading…' : 'Add file'}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-tag-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
