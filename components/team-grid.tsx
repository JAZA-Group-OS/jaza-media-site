import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { TEAM, type Member } from "@/lib/team";

// Order along the strip — CEO sits in the dip of the wave, partners beside him.
const ORDER = ["aeron", "bela", "jaza", "manny", "bea", "jyrille", "abie"];
const MEMBERS = ORDER.map((s) => TEAM.find((m) => m.slug === s)).filter(Boolean) as Member[];

// Vertical offset per card: one full wave per loop so the seam is invisible.
function waveOffset(i: number, n: number) {
  return Math.round(60 * (1 + Math.cos((2 * Math.PI * (i - 2)) / n)));
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bCeo\b/, "CEO")
    .replace(/\bKol\b/, "KOL");
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

function shortRole(m: Member) {
  return titleCase(m.role.split(",").slice(-1)[0].trim());
}

function TeamCard({ member, offset, hidden }: { member: Member; offset: number; hidden?: boolean }) {
  const name = titleCase(member.name ?? "");
  const role = shortRole(member);
  const intro = member.bio?.[0];
  const quote = member.bio?.find((p) => p.length < 70) ?? member.bio?.at(-1);
  const hasBio = Boolean(member.bio?.length);
  const Wrapper = hasBio ? Link : "div";

  return (
    <div className="w-[260px] shrink-0 md:w-[290px]" style={{ marginTop: offset }} aria-hidden={hidden || undefined}>
      <Wrapper
        href={`/team/${member.slug}`}
        tabIndex={hidden ? -1 : hasBio ? 0 : -1}
        className="group/card relative block h-[380px] overflow-hidden rounded-2xl bg-gradient-to-b from-gold/50 via-white/10 to-white/[0.03] p-px shadow-[0_30px_60px_-30px_rgba(0,0,0,0.95)] transition duration-500 hover:-translate-y-2 focus-visible:outline-none"
      >
        <div className="relative h-full overflow-hidden rounded-[15px] bg-[linear-gradient(180deg,#1b1a15_0%,#0f0f10_80%)]">
          {/* portrait */}
          <div className="absolute inset-x-0 top-0 h-[270px] bg-[radial-gradient(70%_60%_at_50%_35%,#3a2e10,#121212)]">
            {member.image ? (
              <div className="absolute inset-0 origin-bottom scale-[1.08]">
                <Image
                  src={member.image}
                  alt={name}
                  fill
                  sizes="290px"
                  className="object-cover object-top grayscale-[0.3] transition duration-700 group-hover/card:scale-105 group-hover/card:grayscale-0"
                />
              </div>
            ) : (
              <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#fde9a6] via-gold to-[#a8771b] bg-clip-text font-serif text-7xl text-transparent italic">
                {initials(member.name ?? "")}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141412] to-transparent" />
          </div>

          {/* name plate */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6 text-center">
            <h3 className="font-serif text-[28px] leading-tight text-white">{name}</h3>
            <p className="mt-1 text-[11px] tracking-[0.24em] text-gold uppercase">{role}</p>
          </div>

          {/* hover popup — editorial preview of the bio */}
          <div className="absolute inset-0 flex translate-y-4 flex-col bg-[#0e0e0e]/95 p-6 opacity-0 backdrop-blur-md transition duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100">
            <p className="text-[10px] tracking-[0.3em] text-gold uppercase">{role}</p>
            <h4 className="mt-2 font-serif text-[26px] leading-tight text-white">{name}</h4>
            {intro ? (
              <>
                <p className="mt-3 line-clamp-5 font-serif text-[16px] leading-snug text-white/85">{intro}</p>
                {quote && (
                  <blockquote className="mt-4 border-l-2 border-gold pl-3 font-serif text-[17px] leading-snug text-gold italic">
                    {quote}
                  </blockquote>
                )}
                <span className="mt-auto inline-flex items-center gap-2 text-sm text-white">
                  Read full story
                  <ArrowRight className="size-4 text-gold transition-transform group-hover/card:translate-x-1" />
                </span>
              </>
            ) : (
              <>
                <p className="mt-3 text-[14px] leading-6 text-white/65">
                  Part of the JAZA Media leadership team, driving results as our {role}.
                </p>
                <p className="mt-auto text-[12px] tracking-wide text-white/40">Full profile coming soon</p>
              </>
            )}
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

export function TeamGrid() {
  const n = MEMBERS.length;
  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] pt-10 pb-24 text-white md:pt-14 md:pb-32">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[820px] -translate-x-1/2 rounded-full bg-gold/12 blur-[160px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            LEADERSHIP
          </p>
          <h1 className="mt-7 font-serif text-[40px] leading-[1.04] tracking-[-0.03em] text-balance md:text-[60px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Meet the</span>{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">operators</em>{" "}
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">behind JAZA</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 font-light text-white/60">
            The builders, strategists and operators scaling the JAZA Group of Companies. Hover over a profile to read their story.
          </p>
        </Reveal>
      </div>

      {/* continuous slow slider — pauses on hover */}
      <div className="relative mt-14 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:mt-16">
        <div className="animate-team-marquee flex w-max items-start gap-6 pb-6 md:gap-8">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-start gap-6 pr-6 md:gap-8 md:pr-8">
              {MEMBERS.map((m, i) => (
                <TeamCard key={`${copy}-${m.slug}`} member={m} offset={waveOffset(i, n)} hidden={copy === 1} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div id="team-more" />
    </section>
  );
}
