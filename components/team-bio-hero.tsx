import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import type { Member } from "@/lib/team";

const GOLD_TEXT = "bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text text-transparent";
const WHITE_TEXT = "bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent";

export const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase()).replace(/\bCeo\b/g, "CEO");

export function TeamBioHero({ member }: { member: Member }) {
  const name = titleCase(member.name ?? "Team Member");
  const portrait = member.bioImage ?? member.image;
  const roles = member.role.split(",").map((r) => titleCase(r.trim()));
  const title = roles[roles.length - 1];
  const others = roles.slice(0, -1);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/4 size-[720px] rounded-full bg-gold/12 blur-[150px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-10 md:px-6 md:pt-14">
        <Link
          href="/about-the-firm"
          className="group inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to the team
        </Link>

        <div className="mt-8 grid items-end gap-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16">
          {/* Arched, gold-framed portrait */}
          <Reveal className="mx-auto w-full max-w-[380px] md:max-w-none">
            <div className="rounded-t-[999px] bg-gradient-to-b from-gold/60 via-gold/15 to-transparent p-px">
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-[radial-gradient(90%_70%_at_50%_30%,#3a2f12_0%,#17150f_55%,#0c0c0e_100%)]">
                {portrait ? (
                  <Image
                    src={portrait}
                    alt={`${name} — ${member.role}`}
                    fill
                    priority
                    sizes="(min-width: 768px) 420px, 90vw"
                    className={`object-contain object-bottom grayscale-[0.15] ${member.mirror ? "-scale-x-100" : ""}`}
                  />
                ) : null}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink to-transparent" />
              </div>
            </div>
          </Reveal>

          {/* Name + titles */}
          <Reveal delay={0.08} className="pb-12 text-center md:pb-20 md:text-left">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
              <span aria-hidden className="size-1.5 rounded-full bg-gold" />
              LEADERSHIP · JAZA MEDIA
            </p>
            <h1 className="mt-7 font-serif text-[52px] leading-[0.98] tracking-[-0.03em] md:text-[84px]">
              <span className={WHITE_TEXT}>{name}</span>
            </h1>
            <p className={`mt-4 font-serif text-2xl italic md:text-3xl ${GOLD_TEXT}`}>{title}</p>
            {others.length > 0 ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
                {others.map((r) => (
                  <span key={r} className="rounded-full border border-white/15 px-4 py-1.5 text-xs tracking-wide text-white/70">
                    {r}
                  </span>
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
}
