import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const GOLD_TEXT = "bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text text-transparent";
const WHITE_TEXT = "bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent";

export function ExplodeProfitCta() {
  return (
    <section className="relative overflow-hidden bg-ink py-12 text-white md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* gold hairline border */}
        <div className="rounded-[36px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
          <div className="relative grid items-end overflow-hidden rounded-[35px] bg-[radial-gradient(120%_120%_at_0%_100%,#2a2210_0%,#121212_45%,#0c0c0d_100%)] md:grid-cols-[1fr_1.1fr]">
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-[520px] rounded-full bg-gold/20 blur-[140px]" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_bottom_left,black,transparent_65%)]"
            />

            {/* founders */}
            <div className="relative order-2 h-[320px] sm:h-[380px] md:order-1 md:h-[460px]">
              <Image
                src="/about-the-form/JazaBela no bg trimmed.png"
                alt="Jaza Sarmiento and Bela Capistrano, founders of JAZA Media"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-contain object-bottom brightness-[0.95] [mask-image:linear-gradient(to_top,transparent_0%,black_22%)]"
              />
            </div>

            {/* copy */}
            <div className="relative order-1 px-7 pt-10 md:order-2 md:py-16 md:pr-14 md:pl-0">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
                <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
                WORK WITH US
              </p>
              <h2 className="mt-6 font-serif text-[40px] leading-[1.02] tracking-[-0.03em] text-balance sm:text-5xl md:text-[60px]">
                <span className={WHITE_TEXT}>Want us to help you</span>{" "}
                <em className={`${GOLD_TEXT} pr-2`}>explode profit?</em>
              </h2>
              <p className="mt-5 max-w-md text-[15px] font-light leading-7 tracking-wide text-white/60 md:text-base">
                Partner with the team that scaled a portfolio to over{" "}
                <span className="font-serif text-lg font-normal italic tracking-normal text-gold">₱150M+</span> in annual
                revenue — and see how JAZA Media can help you grow.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  href="/partner-with-us"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
                >
                  LEARN MORE
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <span className="text-xs tracking-wide text-white/40">Limited partnerships · Apply to qualify</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
