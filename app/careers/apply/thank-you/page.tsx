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
        We&apos;ve received your application and our team will review it
        carefully. If your background looks like a strong match for the role,
        we&apos;ll reach out within a few business days to schedule a
        conversation. Please keep an eye on the email and contact number you
        provided.
      </p>

      <p className="mt-10 font-heading text-xl font-black text-brand-black md:text-2xl">
        Thanks again — we appreciate your interest!
      </p>
    </div>
  );
}
