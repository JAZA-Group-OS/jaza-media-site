import { Layers, Quote, Sparkles, Target } from "lucide-react";

import { AboutEcosystem } from "@/components/about-ecosystem";
import { Reveal } from "@/components/reveal";

const GOLD_TEXT = "bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text text-transparent";
const WHITE_TEXT = "bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="relative inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
      <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
      {children}
    </p>
  );
}

const PILLARS = [
  { k: "01", Icon: Target, title: "Strategy to execution", body: "End-to-end growth solutions supporting companies at every stage of their business scaling journey." },
  { k: "02", Icon: Layers, title: "One unified platform", body: "World-class marketing, advertising, and growth infrastructure — accessible anytime, anywhere." },
  { k: "03", Icon: Sparkles, title: "AI-driven, Filipino-built", body: "Part of the JAZA Group: elite talent and artificial intelligence-driven marketing designed for global growth." },
];

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[760px] -translate-x-1/2 rounded-full bg-gold/15 blur-[150px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-24 md:px-6 md:pt-10 md:pb-32">
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
        <div className="mt-8 grid md:mt-10 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Eyebrow>WHO WE ARE</Eyebrow>
            <h2 className="mt-7 font-serif text-[36px] leading-[1.08] tracking-[-0.025em] text-balance md:text-[48px] xl:text-[54px]">
              <span className={WHITE_TEXT}>The country&apos;s</span>{" "}
              <em className={`${GOLD_TEXT} pr-1`}>first</em>{" "}
              <span className={WHITE_TEXT}>fully integrated marketing agency powered by its own platform.</span>
            </h2>
            <div aria-hidden className="mt-8 h-px w-24 bg-gradient-to-r from-gold/70 to-transparent" />
            <p className="mt-8 max-w-xl text-[16px] font-light leading-8 tracking-wide text-white/60 md:text-[18px] md:leading-9">
              JAZA Media makes professional marketing and advertising accessible to businesses{" "}
              <span className="font-normal text-white">anytime, anywhere</span> — a fully integrated platform built to
              help businesses <span className="font-normal text-white">scale faster</span> and{" "}
              <span className="font-normal text-white">compete globally</span>.
            </p>
            <ul className="mt-9 flex flex-wrap gap-3">
              {["Headquartered in the Philippines", "Marketing + advertising, one platform", "Built for global growth"].map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] text-white/75 backdrop-blur"
                >
                  <span aria-hidden className="size-1.5 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <AboutEcosystem />
          </Reveal>
        </div>

        {/* Pillars */}
        <div className="mt-20 grid gap-4 md:grid-cols-3 md:gap-5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.k} delay={0.06 * i}>
              <div className="group h-full rounded-3xl bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-white/[0.02] p-px transition duration-500 hover:from-gold/60 hover:via-gold/15">
                <article className="relative h-full overflow-hidden rounded-[23px] bg-[linear-gradient(160deg,#171717_0%,#0f0f10_100%)] p-7 transition duration-500 group-hover:-translate-y-0.5">
                  {/* hover glow */}
                  <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-gold/0 blur-[70px] transition duration-700 group-hover:bg-gold/20" />
                  <div className="relative flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/25 shadow-[0_0_24px_-6px_rgba(234,179,8,0.5)] transition duration-500 group-hover:bg-gold group-hover:text-ink">
                      <p.Icon className="size-5" />
                    </span>
                    <span className="font-serif text-3xl italic text-white/15 transition duration-500 group-hover:text-gold/70">{p.k}</span>
                  </div>
                  <h2 className="relative mt-6 text-lg font-semibold tracking-[-0.01em] text-white">{p.title}</h2>
                  <p className="relative mt-3 text-[14px] font-light leading-6 tracking-wide text-white/55">{p.body}</p>
                  <span aria-hidden className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold via-gold/60 to-transparent transition duration-700 group-hover:scale-x-100" />
                </article>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mission + Vision */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
          <Reveal>
            <article className="group relative h-full overflow-hidden rounded-3xl border border-gold/30 bg-[radial-gradient(120%_120%_at_0%_0%,#2a2210_0%,#121212_50%,#0c0c0d_100%)] p-8 transition duration-500 hover:border-gold/60 md:p-10">
              <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gold/20 blur-[90px]" />
              <Quote aria-hidden className="absolute top-8 right-8 size-16 text-gold/10 transition duration-500 group-hover:text-gold/20" />
              <Eyebrow>OUR MISSION</Eyebrow>
              <p className="relative mt-6 font-serif text-xl leading-snug text-white/90 md:text-[24px]">
                To make world-class marketing and advertising accessible to Filipinos here and abroad through a
                fully integrated, sustainable, and future-proof digital platform that scales their business{" "}
                <em className={GOLD_TEXT}>up to 10x.</em>
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,#171717_0%,#0f0f10_100%)] p-8 transition duration-500 hover:border-gold/40 md:p-10">
              <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-gold/0 blur-[90px] transition duration-700 group-hover:bg-gold/15" />
              <Quote aria-hidden className="absolute top-8 right-8 size-16 text-white/[0.05] transition duration-500 group-hover:text-gold/15" />
              <Eyebrow>OUR VISION</Eyebrow>
              <p className="relative mt-6 font-serif text-xl leading-snug text-white/90 md:text-[24px]">
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
