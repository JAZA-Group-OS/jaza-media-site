import type { Metadata } from 'next';
import Link from 'next/link';

import { CopyrightBar } from '@/components/copyright-bar';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Page Not Found — JAZA Media',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
        <span className="inline-block rounded-md bg-brand-yellow px-5 py-1.5 font-heading text-sm font-black tracking-wider text-brand-black uppercase">
          404
        </span>
        <h1 className="mt-6 font-heading text-3xl font-black leading-tight tracking-tight text-brand-black md:text-5xl">
          This page doesn&rsquo;t exist.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-700">
          The link may be outdated or mistyped. Let&rsquo;s get you back on
          track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand-yellow px-8 py-3 font-heading text-sm font-black tracking-wide text-brand-black transition-transform hover:scale-[1.02]"
          >
            Back to Home
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full border-2 border-brand-black px-8 py-3 font-heading text-sm font-black tracking-wide text-brand-black transition-colors hover:bg-brand-black hover:text-white"
          >
            Contact Support
          </Link>
        </div>
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
