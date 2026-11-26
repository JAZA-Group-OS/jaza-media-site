import { AboutEcosystem } from "@/components/about-ecosystem";
import { Reveal } from "@/components/reveal";

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-ink/60 ${center ? "justify-center" : ""}`}>
      <span aria-hidden className="h-px w-8 bg-gold-deep" />
      {children}
    </p>
  );
}

const PILLARS = [
  { k: "01", title: "Strategy to execution", body: "End-to-end growth solutions supporting companies at every stage of their business scaling journey." },
  { k: "02", title: "One unified platform", body: "World-class marketing, advertising, and growth infrastructure — accessible anytime, anywhere." },
  { k: "03", title: "AI-driven, Filipino-built", body: "Part of the JAZA Group: elite talent and artificial intelligence-driven marketing designed for global growth." },
];

const FACTS = ["Headquartered in the Philippines", "Marketing + advertising, one platform", "Built for global growth"];

export function AboutHero() {
  return (
    <section className="bg-[#FAF9F6] text-ink">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:px-8 md:pt-24 md:pb-28">
        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Eyebrow center>ABOUT JAZA MEDIA</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 font-serif text-[34px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-5xl lg:text-[56px]">
              Build your <span className="text-gold-deep">predictable revenue system</span> and profit driver in 90
              days — without guesswork.
            </h1>
          </Reveal>
        </div>

        {/* Who we are */}
        <div className="mt-20 grid items-center gap-12 md:mt-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <Eyebrow>WHO WE ARE</Eyebrow>
            <h2 className="mt-5 font-serif text-[32px] leading-[1.12] font-semibold tracking-[-0.02em] text-balance md:text-[44px]">
              The country&apos;s first fully integrated marketing agency powered by its own platform.
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-8 text-ink/65 md:text-[17px]">
              JAZA Media makes professional marketing and advertising accessible to businesses anytime, anywhere — a
              fully integrated platform built to help businesses scale faster and compete globally.
            </p>
            <ul className="mt-8 divide-y divide-black/10 border-y border-black/10">
              {FACTS.map((t) => (
                <li key={t} className="flex items-center gap-3 py-3 text-[14px] text-ink/80">
                  <span aria-hidden className="size-1.5 rounded-full bg-gold-deep" />
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
        <div className="mt-24 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 md:mt-28 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.k} delay={0.06 * i} className="bg-white">
              <article className="h-full p-8">
                <span className="text-[13px] font-semibold tracking-[0.2em] text-gold-deep">{p.k}</span>
                <h3 className="mt-4 font-serif text-[19px] font-semibold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-3 text-[14.5px] leading-6 text-ink/60">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Mission + Vision */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-2xl bg-ink p-8 text-white md:p-10">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-gold">OUR MISSION</p>
              <p className="mt-5 font-serif text-xl leading-snug md:text-[23px]">
                To make world-class marketing and advertising accessible to Filipinos here and abroad through a fully
                integrated, sustainable, and future-proof digital platform that scales their business{" "}
                <span className="text-gold">up to 10x.</span>
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="h-full rounded-2xl border border-black/10 bg-white p-8 md:p-10">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-gold-deep">OUR VISION</p>
              <p className="mt-5 font-serif text-xl leading-snug md:text-[23px]">
                To become the Philippines&apos; leading integrated marketing and advertising ecosystem, showcasing{" "}
                <span className="text-gold-deep">Filipino excellence</span> and innovation on the global stage.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
