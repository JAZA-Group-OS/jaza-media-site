'use client';

import dynamic from 'next/dynamic';

const CareerFunnel = dynamic(
  () => import('./career-funnel').then((m) => ({ default: m.CareerFunnel })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
        <div className="h-[600px] animate-pulse rounded-xl bg-surface-grey" />
      </div>
    ),
  },
);

export function CareerFunnelMount() {
  return <CareerFunnel />;
}
