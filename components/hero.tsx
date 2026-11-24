import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* soft gold glow + fine grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[720px] rounded-full bg-gold/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      {/* Jaza — far left, md+ */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 hidden aspect-square w-[24%] max-w-[420px] md:block">
        <div className="absolute inset-x-[10%] bottom-[10%] top-[25%] rounded-full bg-gold/15 blur-[80px]" />
        <Image src="/about-the-form/Jaza%20soft.png" alt="" fill priority sizes="24vw" className="object-contain object-bottom object-left brightness-[0.92] contrast-[1.05] saturate-[0.9] [mask-image:linear-gradient(to_top,transparent_0%,black_28%),linear-gradient(to_left,transparent_0%,black_18%)] [mask-composite:intersect]" />
      </div>
      {/* Bela — far right, md+ */}
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 hidden aspect-square w-[24%] max-w-[420px] md:block">
        <div className="absolute inset-x-[10%] bottom-[10%] top-[25%] rounded-full bg-gold/15 blur-[80px]" />
        <Image src="/about-the-form/Bela%20soft.png" alt="" fill priority sizes="24vw" className="object-cover object-bottom object-right brightness-[0.92] contrast-[1.05] saturate-[0.9] [mask-image:linear-gradient(to_top,transparent_0%,black_28%),linear-gradient(to_right,transparent_0%,black_22%),linear-gradient(to_bottom,transparent_0%,black_15%)] [mask-composite:intersect]" />
      </div>

      {/* top fade — no hard line where the navbar ends and the glow/grid begin */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-40 bg-gradient-to-b from-ink via-ink/70 to-transparent" />
      {/* bottom fade — melts the hero (photos, glow, grid) into the next section, no seam */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 bg-gradient-to-b from-transparent via-ink/70 to-ink" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 text-center md:px-6 md:pt-24">
        <Reveal>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            MARKETING · ADVERTISING · SCALING
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-8 font-serif text-[46px] leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[86px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Do you want to
            </span>{" "}
            <em className="relative inline-block bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent [text-shadow:0_0_40px_rgba(234,179,8,0.25)]">
              scale
              <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-2.5 w-[95%] text-gold/70">
                <path d="M2 9 C 50 2, 120 2, 198 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </em>{" "}
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              your business?
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-8 max-w-md text-[15px] leading-7 font-light tracking-wide text-white/55 md:text-[17px]">
            Learn from the team that has scaled a portfolio to over{" "}
            <span className="font-serif text-xl font-normal tracking-normal text-gold italic md:text-2xl">₱150M+</span>{" "}
            in annual revenue.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-16 md:pb-28">
            <Link
              href="/partner-with-us"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
            >
              LEARN TO SCALE
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#free-advance-marketing"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-[13px] font-medium tracking-[0.12em] text-white/85 backdrop-blur transition hover:border-white/40 hover:text-white"
            >
              FREE RESOURCES
            </a>
          </div>
        </Reveal>

        {/* Combined cutout — mobile only */}
        <div aria-hidden className="relative -mt-6 aspect-[7331/6191] w-full max-w-md md:hidden">
          <Image src="/about-the-form/JazaBela%20no%20bg%20trimmed.png" alt="" fill sizes="100vw" className="object-contain object-bottom" />
        </div>
      </div>
    </section>
  );
}
