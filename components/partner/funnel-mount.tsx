'use client';

import dynamic from 'next/dynamic';

// Render the funnel client-only. The component reads sessionStorage during
// its lazy useState initializer, which would mismatch any server-rendered
// HTML on routes where the user already has answers in storage. ssr:false
// avoids that entirely and gives us a single, reliable hydration model in
// both dev and prod.
const QualificationFunnel = dynamic(
  () =>
    import('./qualification-funnel').then((m) => ({
      default: m.QualificationFunnel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
        <div className="h-[600px] animate-pulse rounded-xl bg-surface-grey" />
      </div>
    ),
  },
);

export function FunnelMount() {
  return <QualificationFunnel />;
}
