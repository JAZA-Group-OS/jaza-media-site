'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Server-side digests land in the platform logs; this keeps a client
    // breadcrumb for support tickets that quote the console.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <span className="inline-block rounded-md bg-brand-yellow px-5 py-1.5 font-heading text-sm font-black tracking-wider text-brand-black uppercase">
        Something went wrong
      </span>
      <h1 className="mt-6 font-heading text-3xl font-black leading-tight tracking-tight text-brand-black md:text-5xl">
        We hit a snag loading this page.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-700">
        It&rsquo;s not you — something on our end failed. You can try again,
        or head back to the home page.
        {error.digest ? (
          <span className="mt-2 block text-xs text-neutral-400">
            Reference: {error.digest}
          </span>
        ) : null}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex items-center justify-center rounded-full bg-brand-yellow px-8 py-3 font-heading text-sm font-black tracking-wide text-brand-black transition-transform hover:scale-[1.02]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border-2 border-brand-black px-8 py-3 font-heading text-sm font-black tracking-wide text-brand-black transition-colors hover:bg-brand-black hover:text-white"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
