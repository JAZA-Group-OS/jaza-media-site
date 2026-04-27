import { Suspense } from 'react';
import type { Metadata } from 'next';
import { QualificationFunnel } from '@/components/partner/qualification-funnel';

export const metadata: Metadata = {
  title: 'Partner With Us — JAZA Media',
  description:
    'Apply to work with JAZA Media. Tell us about your business and we will determine if we are a fit to scale you.',
};

function FunnelFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="h-[600px] animate-pulse rounded-xl bg-surface-grey" />
    </div>
  );
}

export default function PartnerWithUsPage() {
  return (
    <Suspense fallback={<FunnelFallback />}>
      <QualificationFunnel />
    </Suspense>
  );
}
