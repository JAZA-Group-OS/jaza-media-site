import type { ReactNode } from "react";

/** One support "slide": fills the slide deck (components/support-slides.tsx). Bottom padding clears the pager. */
export const SLIDE =
  "relative flex min-h-full flex-col justify-center overflow-hidden py-10 pb-24 text-white md:py-8 md:pb-24";

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
    <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-white/60 uppercase">
      <span aria-hidden className="h-px w-8 bg-gold/80" />
      {children}
      <span aria-hidden className="h-px w-8 bg-gold/80" />
    </p>
  );
}
