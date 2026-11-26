import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-ink">
      {/* soft gold glow + fine grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[720px] rounded-full bg-gold/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      {/* top fade — no hard line where the navbar ends and the glow/grid begin */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-40 bg-gradient-to-b from-white via-white/70 to-transparent" />
      {/* bottom fade — melts the hero (photos, glow, grid) into the next section, no seam */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 bg-gradient-to-b from-transparent via-white/70 to-white" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-6 text-center md:px-6 md:pt-24">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-ink/60">
            MARKETING · ADVERTISING · SCALING
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-8 font-heading font-semibold text-[38px] leading-[1.12] tracking-[-0.02em] text-balance sm:text-5xl lg:text-[68px]">
            <span className="bg-gradient-to-b from-ink via-ink to-ink/70 bg-clip-text text-transparent">
              Do you want to
            </span>{" "}
            <em className="relative inline-block not-italic bg-gradient-to-br from-gold via-gold-deep to-[#a97a1f] bg-clip-text pr-2 text-transparent [text-shadow:0_0_40px_rgba(234,179,8,0.25)]">
              scale
              <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-2.5 w-[95%] text-gold/70">
                <path d="M2 9 C 50 2, 120 2, 198 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </em>{" "}
            <span className="bg-gradient-to-b from-ink via-ink to-ink/70 bg-clip-text text-transparent">
              your business?
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-8 max-w-md text-[15px] leading-7 font-light tracking-wide text-ink/60 md:text-[17px]">
            Learn from the team that has scaled a portfolio to over{" "}
            <span className="font-heading text-lg font-semibold tracking-normal text-gold-deep md:text-xl">₱150M+</span>{" "}
            in annual revenue.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-16 md:pb-28">
            <Link
              href="/partner-with-us"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-ink hover:text-white"
            >
              LEARN TO SCALE
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#free-advance-marketing"
              className="inline-flex items-center rounded-full border border-black/15 bg-white px-8 py-4 text-[13px] font-medium tracking-[0.12em] text-ink/85 transition hover:border-ink hover:text-ink"
            >
              FREE RESOURCES
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
