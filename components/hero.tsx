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
        <Image src="/about-the-form/Jaza%20no%20bg%20trimmed.png" alt="" fill priority sizes="24vw" className="object-contain object-bottom object-left" />
      </div>
      {/* Bela — far right, md+ */}
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 hidden aspect-square w-[24%] max-w-[420px] md:block">
        <Image src="/about-the-form/Bela%20no%20bg%20trimmed.png" alt="" fill priority sizes="24vw" className="object-cover object-bottom object-right" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 text-center md:px-6 md:pt-24">
        <Reveal>
          <p className="flex items-center gap-4 text-[11px] font-medium tracking-[0.42em] text-gold/90">
            <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
            MARKETING · ADVERTISING · SCALING
            <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-7 font-serif text-[46px] leading-[1.02] tracking-[-0.025em] text-balance text-white/95 sm:text-6xl lg:text-[84px]">
            Do you want to{" "}
            <em className="bg-gradient-to-br from-[#f7dc8a] via-gold to-[#b8892a] bg-clip-text pr-1 text-transparent">
              scale
            </em>{" "}
            your business?
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed font-light text-white/60 md:text-lg">
            Learn from the team that has scaled a portfolio to over{" "}
            <span className="font-medium text-white">₱150M+</span> in annual revenue.
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
