import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "You're a Fit — JAZA Media",
};

export default function QualifiedPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:py-24">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
        Thanks — you're a{' '}
        <em className="font-black text-brand-yellow italic">fit</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-neutral-700 md:text-base">
        We've noted your interest. Keep an eye on your inbox — we'll reach
        out as soon as a strategist is available.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-bold tracking-wider text-brand-black uppercase transition-transform hover:scale-[1.02]"
      >
        Back to Home
      </Link>
    </div>
  );
}
