import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

export function Founders() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      {/* soft gold glow behind the portrait, matching the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 size-[640px] -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 md:grid-cols-2 md:gap-20 md:px-6">
        <Reveal className="relative">
          <div className="relative rounded-[36px] bg-gradient-to-b from-gold/40 via-white/10 to-white/5 p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[35px] bg-ink-soft">
              <Image
                src="/about-the-form/founders-studio.jpg"
                alt="Jaza Sarmiento and Bela Capistrano, founders of JAZA Media"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover object-top transition duration-700 hover:scale-[1.02]"
              />
              {/* bottom vignette so the badge and card edge sit in the dark palette */}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            </div>
          </div>
          <div className="absolute -bottom-7 left-6 rounded-2xl border border-white/10 bg-ink/80 px-6 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl md:-right-8 md:left-auto">
            <div className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text font-serif text-4xl italic text-transparent">
              ₱150M+
            </div>
            <div className="mt-1 text-[10.5px] font-medium tracking-[0.28em] text-white/55">GROWN IN THREE YEARS</div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            ABOUT OUR FOUNDERS
          </p>
          <h2 className="mt-7 font-serif text-5xl leading-[1.02] tracking-[-0.03em] text-balance md:text-[68px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Built by operators,
            </span>{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">for</em>{" "}
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">operators.</span>
          </h2>
          <div className="mt-8 space-y-5 text-[15px] font-light leading-7 tracking-wide text-white/60 md:text-[17px] md:leading-8">
            <p>
              Jaza and Bela are the co-founders and managing partners of JAZA Media. In just three
              years, they have grown the company&apos;s portfolio to over{" "}
              <span className="font-normal text-white">₱150M</span> in annual revenue.
            </p>
            <p>
              Jaza began his career as a freelance video editor and Facebook advertiser before
              building one of the Philippines&apos; most recognized business communities, now with
              over <span className="font-normal text-white">66,000</span> business-owner members. He is
              also the author of two bestselling ebooks, Marketing Course and Advertising Course, with a
              combined total of <span className="font-normal text-white">1,000+</span> copies sold.
            </p>
          </div>
          <blockquote className="relative mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-6 font-serif text-2xl italic leading-snug text-white/90 backdrop-blur">
            <span aria-hidden className="absolute -top-5 left-6 font-serif text-6xl leading-none text-gold">&ldquo;</span>
            A culture that prioritizes praise, growth, and empowerment over punishment.
          </blockquote>
          <Link
            href="/about-us"
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
          >
            OUR STORY
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
