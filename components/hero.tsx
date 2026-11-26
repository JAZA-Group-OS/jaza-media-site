import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f8f8f6] text-ink">
      {/* faint grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)] [background-size:56px_56px]"
      />

      {/* gold light sweeps — top-left and bottom-right */}
      <svg aria-hidden viewBox="0 0 600 400" preserveAspectRatio="none" className="pointer-events-none absolute -top-10 left-0 hidden h-[420px] w-[38%] md:block">
        <defs>
          <linearGradient id="hero-sweep-a" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#ffca26" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffca26" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 400 C 120 260, 300 120, 600 0 L 600 10 C 320 130, 140 270, 0 400 Z" fill="url(#hero-sweep-a)" />
        <path d="M0 360 C 160 230, 330 110, 560 0" fill="none" stroke="#ffca26" strokeOpacity="0.35" strokeWidth="1.5" />
        <path d="M0 400 C 140 250, 320 100, 600 0 L 0 0 Z" fill="#ffca26" fillOpacity="0.05" />
      </svg>
      <svg aria-hidden viewBox="0 0 600 400" preserveAspectRatio="none" className="pointer-events-none absolute right-0 -bottom-6 hidden h-[420px] w-[42%] md:block">
        <defs>
          <linearGradient id="hero-sweep-b" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#ffca26" stopOpacity="0" />
            <stop offset="1" stopColor="#ffca26" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d="M0 400 C 260 340, 460 220, 600 60 L 600 400 Z" fill="#ffca26" fillOpacity="0.06" />
        <path d="M0 400 C 260 330, 460 210, 600 40 L 600 60 C 460 220, 260 340, 0 400 Z" fill="url(#hero-sweep-b)" />
        <path d="M60 400 C 300 330, 480 230, 600 110" fill="none" stroke="#ffca26" strokeOpacity="0.4" strokeWidth="1.5" />
      </svg>

      {/* bottom fade — off-white melts into the white section below, no seam */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 bg-gradient-to-b from-transparent to-white" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pt-10 text-center md:px-6 md:pt-20">
        <Reveal>
          <p className="text-[12px] font-bold tracking-[0.32em] text-ink md:text-[15px]">
            MARKETING <span className="mx-2 text-gold">·</span> ADVERTISING <span className="mx-2 text-gold">·</span> SCALING
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-7 max-w-[16ch] font-sans text-[46px] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink sm:text-6xl lg:text-[88px]">
            Do you want to{" "}
            <em className="relative inline-block not-italic text-gold">
              scale
              <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-2.5 w-full text-gold">
                <path d="M2 9 C 50 3, 120 3, 198 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </em>{" "}
            your business?
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-3xl text-[18px] leading-relaxed text-ink/65 md:text-[25px]">
            Learn from the team that has scaled a portfolio to over{" "}
            <span className="font-extrabold text-gold">₱150M+</span> in annual revenue.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-6 pb-16 md:pb-20">
            <Link
              href="/partner-with-us"
              className="group inline-flex items-center gap-3 rounded-full bg-gold px-11 py-4 text-[15px] font-bold tracking-[0.12em] text-ink shadow-[0_14px_36px_-12px_rgba(234,179,8,0.7)] transition hover:bg-ink hover:text-white"
            >
              LEARN TO SCALE
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
            <a
              href="#free-advance-marketing"
              className="inline-flex items-center rounded-full border border-ink/40 bg-white px-12 py-4 text-[15px] font-bold tracking-[0.12em] text-ink transition hover:border-ink hover:bg-ink hover:text-white"
            >
              FREE RESOURCES
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
