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
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">
            MARKETING · ADVERTISING · BUSINESS SCALING
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 font-serif text-[48px] leading-[0.98] tracking-[-0.01em] sm:text-6xl lg:text-[80px]">
            Do you want to <em className="text-gold">scale</em> your business?
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
            Learn from the team that has scaled a portfolio to over ₱150M+ in annual revenue.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-16 md:pb-28">
            <Link
              href="/partner-with-us"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-semibold tracking-wide text-ink transition hover:bg-white"
            >
              LEARN TO SCALE
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#free-advance-marketing"
              className="inline-flex items-center rounded-full border border-white/25 px-7 py-4 text-sm font-semibold tracking-wide transition hover:border-white hover:bg-white/5"
            >
              Free Resources
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
