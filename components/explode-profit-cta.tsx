import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

/** "Explode profit" call to action: the JAZA Media mark, headline and one button. */
export function ExplodeProfitCta() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-center text-white md:py-32">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4">
        {/* logo + shockwaves */}
        <Reveal>
          <div className="relative size-28 rounded-full p-px ring-1 ring-gold/50 md:size-32">
            <div className="relative size-full overflow-hidden rounded-full bg-black">
              <Image
                src="/images/jaza-media-icon.png"
                alt="JAZA Media"
                fill
                sizes="128px"
                className="scale-[1.12] object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-10 font-serif text-[44px] leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl md:text-[76px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Want us to help you
            </span>{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">
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
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-gold px-9 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink transition hover:bg-white"
          >
            LEARN MORE
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
