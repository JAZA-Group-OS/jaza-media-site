import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

/** "Explode profit" call to action: the JAZA Media mark, headline and one button. */
export function ExplodeProfitCta() {
  return (
    <section className="relative overflow-hidden bg-ink pt-4 pb-16 text-center text-white md:pt-5 md:pb-20">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4">
        {/* logo + shockwaves */}
        <Reveal>
          <div className="relative size-20 rounded-full p-px ring-1 ring-gold/50 md:size-24">
            <div className="relative size-full overflow-hidden rounded-full bg-black">
              <Image
                src="/images/jaza-media-icon.png"
                alt="JAZA Media"
                fill
                sizes="96px"
                className="scale-[1.12] object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-7 font-serif text-[34px] leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl md:text-[52px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Want us to help you
            </span>{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">
              explode profit?
            </em>
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-4 text-[14px] font-light tracking-wide text-white/60 md:text-base">
            See how JAZA Media can help.
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          <Link
            href="/partner-with-us"
            className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.12em] text-ink transition hover:bg-white"
          >
            LEARN MORE
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
