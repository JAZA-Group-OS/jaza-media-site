import type { Metadata } from 'next';
import { MarketingTemplatesCard } from '@/components/marketing-templates-card';

export const metadata: Metadata = {
  title: 'Application Update — JAZA Media',
  // Transient outcome page — shouldn't surface in search.
  robots: { index: false, follow: false },
};

export default function NotQualifiedPage() {
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
        Not the right{' '}
        <em className="font-black text-brand-yellow italic">fit</em> — yet.
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-sm text-neutral-700 md:text-base">
        Thanks for your interest in JAZA Media. Based on your answers, we&apos;re
        not the right partner for you at this stage — but that doesn&apos;t
        mean you&apos;re alone in figuring this out.
      </p>

      <p className="mt-6 font-heading text-lg font-black text-brand-black md:text-xl">
        Stay Connected with Us!
      </p>

      <div className="mt-8">
        <MarketingTemplatesCard />
      </div>

      <p className="mx-auto mt-8 max-w-xl text-sm text-neutral-700 md:text-base">
        We appreciate your interest in JAZA Media and wish you continued success
        on your journey. In the meantime, you may download the JAZA Media
        Marketing Template for FREE. This template will help you stay updated on
        market trends and serve as a practical guide to improving and growing
        your business.
      </p>
    </div>
  );
}
