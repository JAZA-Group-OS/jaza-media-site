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
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', bucket);
      const res = await fetch('/api/career-upload', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }
      const json = (await res.json()) as { data: UploadedFile };
      onChange(json.data);
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
