import Image from "next/image";

import { Reveal } from "@/components/reveal";

const GOLD_TEXT = "bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text text-transparent";
const WHITE_TEXT = "bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
      <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
      {children}
    </p>
  );
}

const PILLARS = [
  { k: "01", title: "Strategy to execution", body: "End-to-end growth solutions supporting companies at every stage of their business scaling journey." },
  { k: "02", title: "One unified platform", body: "World-class marketing, advertising, and growth infrastructure — accessible anytime, anywhere." },
  { k: "03", title: "AI-driven, Filipino-built", body: "Part of the JAZA Group: elite talent and artificial intelligence-driven marketing designed for global growth." },
];

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[760px] -translate-x-1/2 rounded-full bg-gold/15 blur-[150px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 md:px-6 md:pt-24 md:pb-32">
        {/* Headline */}
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal>
            <Eyebrow>ABOUT JAZA MEDIA</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-7 font-serif text-[34px] leading-[1.06] tracking-[-0.025em] text-balance sm:text-5xl lg:text-[56px]">
              <span className={WHITE_TEXT}>Build your</span>{" "}
              <em className={`${GOLD_TEXT} pr-2`}>predictable revenue system</em>{" "}
              <span className={WHITE_TEXT}>and profit driver in 90 days — without guesswork.</span>
            </h1>
          </Reveal>
        </div>

        {/* Lead + image */}
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="font-serif text-2xl leading-[1.25] tracking-[-0.02em] text-white/90 md:text-[30px]">
              The country&apos;s <em className={GOLD_TEXT}>first</em> fully integrated marketing agency powered by its own platform.
            </p>
            <p className="mt-6 max-w-xl text-[14px] font-light leading-7 tracking-wide text-white/60 md:text-[15px]">
              JAZA Media makes professional marketing and advertising accessible to businesses anytime,
              anywhere — a fully integrated platform built to help businesses scale faster and compete
              globally. Headquartered in the Philippines.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[32px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[31px]">
                <Image
                  src="/images/About us.png"
                  alt="JAZA Media team"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Pillars */}
        <div className="mt-20 grid gap-4 md:grid-cols-3 md:gap-5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.k} delay={0.06 * i}>
              <article className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl italic text-gold">{p.k}</span>
                  <span aria-hidden className="h-px w-12 bg-gradient-to-r from-gold/60 to-transparent" />
                </div>
                <h2 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-white">{p.title}</h2>
                <p className="mt-3 text-[14px] font-light leading-6 tracking-wide text-white/55">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Mission + Vision */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
          <Reveal>
            <article className="relative h-full overflow-hidden rounded-3xl border border-gold/30 bg-[radial-gradient(120%_120%_at_0%_0%,#2a2210_0%,#121212_50%,#0c0c0d_100%)] p-8 md:p-10">
              <Eyebrow>OUR MISSION</Eyebrow>
              <p className="mt-6 font-serif text-xl leading-snug text-white/90 md:text-[22px]">
                To make world-class marketing and advertising accessible to Filipinos here and abroad through a
                fully integrated, sustainable, and future-proof digital platform that scales their business{" "}
                <em className={GOLD_TEXT}>up to 10x.</em>
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
              <Eyebrow>OUR VISION</Eyebrow>
              <p className="mt-6 font-serif text-xl leading-snug text-white/90 md:text-[22px]">
                To become the Philippines&apos; leading integrated marketing and advertising ecosystem, showcasing{" "}
                <em className={GOLD_TEXT}>Filipino excellence</em> and innovation on the global stage.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
