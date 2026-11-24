import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

const PERKS = ["Sales Call Script", "AI Prompt Template", "Sent to your inbox in under 30 seconds"];

export function MarketingTemplatesCard() {
  return (
    <section className="bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          {/* gold hairline border */}
          <div className="rounded-[36px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="relative grid items-center gap-12 overflow-hidden rounded-[35px] bg-[radial-gradient(120%_120%_at_0%_0%,#2a2210_0%,#121212_45%,#0c0c0d_100%)] p-8 text-white md:grid-cols-[1fr_1.15fr] md:p-14">
              <div aria-hidden className="anim-glow-breathe pointer-events-none absolute -top-32 -left-32 size-[420px] rounded-full bg-gold/20 blur-[130px]" />
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]" />

              <div className="relative">
                <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
                  <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
                  BRAND NEW · FREE
                </p>
                <h3 className="mt-7 font-serif text-[44px] leading-[1.02] tracking-[-0.03em] text-balance md:text-[64px]">
                  <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                    JAZA Media
                  </span>{" "}
                  <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent">
                    Marketing Templates
                  </em>
                </h3>
                <p className="mt-6 max-w-md text-[15px] leading-7 font-light text-white/55 md:text-base">
                  The exact scripts and prompts our team uses to close clients and ship campaigns — ready to copy.
                </p>
                <ul className="mt-7 space-y-3">
                  {PERKS.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-sm text-white/80">
                      <span className="grid size-5 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                        <Check className="size-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap items-center gap-5">
                  <Link
                    href="/courses/marketing-templates"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
                  >
                    DOWNLOAD NOW
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <span className="text-xs tracking-wide text-white/40">Free · Instant access</span>
                </div>
              </div>

              <div className="group relative [perspective:1400px]">
                <div aria-hidden className="absolute inset-6 rounded-3xl bg-gold/25 blur-[70px]" />
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] transition duration-700 [transform:rotateY(-8deg)_rotateX(3deg)] group-hover:[transform:rotateY(0deg)_rotateX(0deg)_scale(1.02)]">
                  <Image
                    src="/about-the-form/Marketing Templates.png"
                    alt="JAZA Media marketing templates preview"
                    width={4000}
                    height={2250}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-auto w-full"
                  />
                  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="anim-card-streak absolute -inset-y-1/2 left-0 w-1/4 rotate-[20deg] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
                  </div>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/[0.04]" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
