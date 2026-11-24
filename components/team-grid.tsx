import { TeamCard } from "@/components/team-card";
import { Reveal } from "@/components/reveal";
import { TEAM } from "@/lib/team";

export function TeamGrid() {
  return (
    <section className="relative overflow-hidden bg-ink pt-10 pb-24 text-white md:pt-14 md:pb-32">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[760px] -translate-x-1/2 rounded-full bg-gold/15 blur-[150px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            LEADERSHIP
          </p>
          <h1 className="mt-7 font-serif text-[40px] leading-[1.04] tracking-[-0.03em] text-balance md:text-[64px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Meet the</span>{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">operators</em>{" "}
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">behind JAZA</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-7 font-light text-white/55 md:text-base">
            The leadership team building, scaling, and running the JAZA Group of Companies.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-8">
          {TEAM.map((member, i) => (
            <Reveal key={member.slug} delay={(i % 3) * 0.06}>
              <TeamCard member={member} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
