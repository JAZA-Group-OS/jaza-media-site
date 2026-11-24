import { ArrowUpRight, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { titleCase } from "@/components/team-bio-hero";
import { TEAM, type Member } from "@/lib/team";

const GOLD_TEXT = "bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text text-transparent";

/** Short, punchy lines in a bio read better as pull-quotes than as paragraphs. */
const isPullQuote = (p: string) => p.length <= 90;

export function TeamBioStory({ member }: { member: Member }) {
  const paragraphs = member.bio ?? [];
  const [lead, ...rest] = paragraphs;
  const closing = rest.length > 1 ? rest[rest.length - 1] : undefined;
  const body = closing ? rest.slice(0, -1) : rest;
  const others = TEAM.filter((m) => m.slug !== member.slug && m.bio?.length);

  return (
    <section className="relative bg-ink pb-24 text-white md:pb-32">
      <div className="mx-auto max-w-3xl px-4 pt-16 md:px-6 md:pt-24">
        {lead ? (
          <Reveal>
            <p className="font-serif text-[26px] leading-[1.35] tracking-[-0.01em] text-white/90 md:text-[34px]">{lead}</p>
          </Reveal>
        ) : (
          <p className="text-white/50">Bio coming soon.</p>
        )}

        {body.length > 0 ? (
          <div className="mt-12 space-y-7">
            {body.map((p, i) =>
              isPullQuote(p) ? (
                <Reveal key={i}>
                  <p className={`border-l-2 border-gold py-1 pl-6 font-serif text-3xl italic leading-snug md:text-4xl ${GOLD_TEXT}`}>
                    {p}
                  </p>
                </Reveal>
              ) : (
                <Reveal key={i}>
                  <p className="text-[16px] font-light leading-8 tracking-wide text-white/65 md:text-[17px]">{p}</p>
                </Reveal>
              ),
            )}
          </div>
        ) : null}

        {closing ? (
          <Reveal className="mt-14">
            <div className="rounded-[28px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px">
              <div className="relative rounded-[27px] bg-[radial-gradient(120%_120%_at_0%_0%,#2a2210_0%,#121212_50%,#0c0c0d_100%)] p-8 md:p-10">
                <Quote aria-hidden className="absolute top-7 right-7 size-12 text-gold/15" />
                <p className="text-[10.5px] font-medium tracking-[0.32em] text-gold/90">THE MISSION</p>
                <p className="mt-4 font-serif text-2xl leading-snug text-white md:text-[30px]">{closing}</p>
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>

      {others.length > 0 ? (
        <div className="mx-auto mt-24 max-w-6xl px-4 md:px-6">
          <p className="text-center text-[10.5px] font-medium tracking-[0.32em] text-white/50">MEET THE REST OF THE TEAM</p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            {others.map((m) => {
              const roles = m.role.split(",").map((r) => titleCase(r.trim()));
              return (
                <Link
                  key={m.slug}
                  href={`/team/${m.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/50 hover:bg-white/[0.05]"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-ink-soft ring-1 ring-gold/30">
                    {m.image ? (
                      <Image src={m.image} alt="" fill sizes="64px" className="object-cover object-top grayscale transition group-hover:grayscale-0" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-white">{titleCase(m.name ?? "")}</span>
                    <span className="block truncate text-sm text-gold">{roles[roles.length - 1]}</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
