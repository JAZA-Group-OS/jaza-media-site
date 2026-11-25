import type { ReactNode } from "react";

/** One full-screen "slide": fills the viewport below the sticky header (~120px) and snaps on scroll. */
export const SLIDE =
  "relative flex min-h-[calc(100svh-120px)] snap-start scroll-mt-28 flex-col justify-center overflow-hidden py-10 text-white md:py-8";

export const H2 = "font-serif text-[40px] leading-[1.05] tracking-[-0.025em] text-white md:text-[52px] lg:text-[58px]";

export function Gold({ children }: { children: ReactNode }) {
  return (
    <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">
      {children}
    </em>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 uppercase backdrop-blur">
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/70" />
        <span className="relative size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
      </span>
      {children}
    </p>
  );
}
