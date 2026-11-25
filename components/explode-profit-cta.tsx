import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

/** "Explode profit" call to action: the JAZA Media mark, headline and one button. */
export function ExplodeProfitCta() {
  return (
    <section className="relative overflow-hidden bg-ink pt-4 pb-8 text-white md:pt-5 md:pb-10">
      <Reveal>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center md:flex-row md:gap-8 md:px-6 md:text-left">
          <div className="relative size-16 shrink-0 rounded-full p-px ring-1 ring-gold/50 md:size-20">
            <div className="relative size-full overflow-hidden rounded-full bg-black">
              <Image src="/images/jaza-media-icon.png" alt="JAZA Media" fill sizes="80px" className="scale-[1.12] object-cover" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="font-serif text-[30px] leading-[1.05] tracking-[-0.025em] text-balance sm:text-4xl lg:text-[44px]">
              <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                Want us to help you
              </span>{" "}
              <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">
                explode profit?
              </em>
            </h2>
            <p className="mt-2 text-[14px] font-light tracking-wide text-white/60 md:text-base">
              See how JAZA Media can help.
            </p>
          </div>

          <Link
            href="/partner-with-us"
            className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.12em] text-ink transition hover:bg-white"
          >
            LEARN MORE
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
