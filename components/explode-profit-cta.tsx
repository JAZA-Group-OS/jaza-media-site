import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

/**
 * "Explode profit" call to action: no card, no photo — the JAZA Media mark at the
 * centre with gold shockwave rings bursting out of it, so the section reads as
 * an explosion of growth before the headline lands.
 */
export function ExplodeProfitCta() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-center text-white md:py-32">
      {/* slow-rotating light rays */}
      <div
        aria-hidden
        className="anim-slow-spin pointer-events-none absolute left-1/2 top-[38%] size-[900px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07] [background:repeating-conic-gradient(from_0deg,#eab308_0deg_2deg,transparent_2deg_15deg)] [mask-image:radial-gradient(circle,black_0%,transparent_60%)]"
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[38%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[120px]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4">
        {/* logo + shockwaves */}
        <Reveal>
          <div className="relative grid size-40 place-items-center md:size-48">
            {[0, 1.5, 3].map((delay) => (
              <span
                key={delay}
                aria-hidden
                style={{ animationDelay: `${delay}s` }}
                className="anim-profit-burst absolute left-1/2 top-1/2 size-full rounded-full border border-gold/60 opacity-0"
              />
            ))}
            <div className="relative grid size-32 place-items-center rounded-full border border-gold/50 bg-ink shadow-[0_0_80px_-10px_rgba(234,179,8,0.7)] md:size-36">
              <span aria-hidden className="absolute -inset-3 rounded-full border border-dashed border-gold/25" />
              <span className="flex flex-col items-center leading-none">
                <span className="font-display text-[30px] tracking-[0.18em] text-white md:text-[34px]">JAZA</span>
                <span className="mt-1.5 pl-[0.35em] text-[10px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-12 font-serif text-[44px] leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl md:text-[76px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Want us to help you
            </span>{" "}
            <em className="anim-gold-shimmer bg-[linear-gradient(110deg,#a97a1f_0%,#eab308_30%,#fff4c2_50%,#eab308_70%,#a97a1f_100%)] bg-clip-text pr-2 text-transparent">
              explode profit?
            </em>
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-6 text-[15px] font-light tracking-wide text-white/60 md:text-lg">
            See how JAZA Media can help.
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          <Link
            href="/partner-with-us"
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-gold px-9 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.7)] transition hover:scale-[1.03] hover:bg-white"
          >
            LEARN MORE
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
