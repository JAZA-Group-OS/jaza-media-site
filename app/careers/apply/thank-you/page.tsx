import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You for Applying — JAZA Media',
};

export default function ApplyThankYouPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:py-20">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
        Thank you for{' '}
        <em className="font-black text-brand-yellow not-italic">Applying</em>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base text-neutral-700 md:text-lg">
        Thank you for your interest in becoming part of JAZA Media.
      </p>

      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-700 md:text-lg">
        After reviewing your application, we&apos;re pleased to inform you that
        you have successfully moved forward to the next step of the process.
        Please allow up to 24 hours for one of our team members to reach out
        and schedule your final interview call with the assigned JAZA Media
        specialist.
      </p>

      <p className="mt-10 font-heading text-xl font-black text-brand-black md:text-2xl">
        We look forward to speaking with you soon!
      </p>
    </div>
  );
}
