import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "You're Booked — JAZA Media",
  // Transient confirmation page. Not useful in search results and would
  // surface as "Congrats you're booked" if indexed.
  robots: { index: false, follow: false },
};

export default function BookedPage() {
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
        Congrats — you&apos;re{' '}
        <em className="font-black text-brand-yellow italic">booked</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-neutral-700 md:text-base">
        Check your inbox for the calendar invite. We&apos;ll see you on the
        call.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500 md:text-base">
        A member of our team will reach out before the call to confirm the
        agenda.
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
