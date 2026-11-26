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
    <>
    <section className="home-slide bg-[#FAF9F6] text-ink md:flex md:min-h-[calc(100svh-114px)] md:flex-col md:justify-center">
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 px-5 py-14 md:px-10 md:py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <Reveal>
          <Eyebrow>ABOUT JAZA MEDIA</Eyebrow>
          <h1 className="mt-6 font-serif text-[38px] leading-[1.06] font-semibold tracking-[-0.03em] text-balance sm:text-5xl xl:text-[64px]">
            Build your <span className="text-gold-deep">predictable revenue system</span> and profit driver in 90 days —
            without guesswork.
          </h1>
          <p className="mt-7 max-w-xl font-serif text-[20px] leading-snug font-medium text-ink/85 md:text-[26px]">
            The country&apos;s first fully integrated marketing agency powered by its own platform.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-ink/60 md:text-[17px] md:leading-8">
            We make professional marketing and advertising accessible to businesses anytime, anywhere — built to help
            you scale faster and compete globally.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-5">
            {FACTS.map((t) => (
              <li key={t} className="flex items-center gap-2 text-[14px] text-ink/70">
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
    </section>

    <section className="home-slide border-t border-black/10 bg-white text-ink md:flex md:min-h-[calc(100svh-114px)] md:flex-col md:justify-center">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-16 md:px-10 md:py-10">
        <Reveal>
          <Eyebrow>WHAT WE STAND FOR</Eyebrow>
        </Reveal>
        {/* Pillars */}
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.k} delay={0.06 * i} className="bg-[#FAF9F6]">
              <article className="h-full p-8">
                <span className="text-[13px] font-semibold tracking-[0.2em] text-gold-deep">{p.k}</span>
                <h3 className="mt-4 font-serif text-[22px] font-semibold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-3 text-[15.5px] leading-7 text-ink/60">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Mission + Vision */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-2xl bg-ink p-8 text-white md:p-10">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-gold">OUR MISSION</p>
              <p className="mt-5 font-serif text-xl leading-snug md:text-[26px]">
                To make world-class marketing and advertising accessible to Filipinos here and abroad through a fully
                integrated, sustainable, and future-proof digital platform that scales their business{" "}
                <span className="text-gold">up to 10x.</span>
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="h-full rounded-2xl border border-black/10 bg-[#FAF9F6] p-8 md:p-10">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-gold-deep">OUR VISION</p>
              <p className="mt-5 font-serif text-xl leading-snug md:text-[26px]">
                To become the Philippines&apos; leading integrated marketing and advertising ecosystem, showcasing{" "}
                <span className="text-gold-deep">Filipino excellence</span> and innovation on the global stage.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
    </>
  );
}
