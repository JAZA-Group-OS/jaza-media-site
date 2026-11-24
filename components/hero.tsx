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

      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-4 pt-16 md:grid-cols-[1.15fr_1fr] md:px-6 md:pt-24">
        <div className="pb-16 md:pb-28">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.3em] text-gold">
              MARKETING · ADVERTISING · BUSINESS SCALING
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 font-serif text-[52px] leading-[0.98] tracking-[-0.01em] sm:text-7xl lg:text-[96px]">
              Do you want to <em className="text-gold">scale</em> your business?
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              Learn from the team that has scaled a portfolio to over ₱150M+ in annual revenue.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
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
        </div>

        <Reveal delay={0.1} className="relative mx-auto h-[380px] w-full max-w-[560px] sm:h-[480px] md:h-[600px]">
          <div aria-hidden className="absolute inset-x-6 bottom-0 top-16 rounded-t-[999px] bg-gradient-to-b from-white/10 to-white/0 ring-1 ring-white/10" />
          <Image
            src="/about-the-form/JazaBela%20no%20bg%20trimmed.png"
            alt="Jaza Sarmiento and Bela Capistrano, founders of JAZA Media"
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-contain object-bottom"
          />
        </Reveal>
      </div>
    </section>
  );
}
