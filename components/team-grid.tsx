import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { TEAM, type Member } from "@/lib/team";

// Shield silhouette: angled shoulders on the top edge, flat bottom.
const SHIELD =
  "[clip-path:polygon(0_56px,22%_0,78%_0,100%_56px,100%_100%,0_100%)]";

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bCeo\b/, "CEO").replace(/\bKol\b/, "KOL");
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

function Portrait({ member, size }: { member: Member; size: "lg" | "sm" }) {
  const box = size === "lg" ? "h-40 w-36 md:h-44 md:w-40" : "h-24 w-20";
  return (
    <div
      className={`relative ${box} overflow-hidden rounded-t-[999px] rounded-b-2xl bg-[radial-gradient(80%_70%_at_50%_30%,#3a2e10,#141414)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9)] ring-1 ring-gold/40`}
    >
      {member.image ? (
        // source PNGs carry a baked black frame — scale from the bottom to crop it out
        <div className="absolute inset-0 origin-bottom scale-[1.08]">
          <Image
            src={member.image}
            alt={member.name ?? ""}
            fill
            sizes={size === "lg" ? "160px" : "80px"}
            className="object-cover object-top grayscale-[0.25]"
          />
        </div>
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#fde9a6] via-gold to-[#a8771b] bg-clip-text font-serif text-3xl text-transparent italic">
          {member.name ? initials(member.name) : ""}
        </span>
      )}
    </div>
  );
}

function SideCard({ member }: { member: Member }) {
  const name = titleCase(member.name ?? "");
  const role = titleCase(member.role.split(",").slice(-1)[0].trim());
  const body = (
    <div className="relative flex flex-col items-center pt-12">
      <div className="absolute top-0 z-10">
        <Portrait member={member} size="sm" />
      </div>
      <div className={`w-full bg-gradient-to-b from-gold/45 via-white/10 to-transparent p-px ${SHIELD}`}>
        <div className={`flex flex-col items-center bg-[linear-gradient(180deg,#1a1a17_0%,#101011_70%)] px-5 pt-16 pb-7 text-center ${SHIELD}`}>
          <h3 className="font-serif text-[26px] leading-tight text-white">{name}</h3>
          <p className="mt-1 text-[13px] text-gold/90">{role}</p>
        </div>
      </div>
    </div>
  );
  return member.bio?.length ? (
    <Link href={`/team/${member.slug}`} className="group block transition duration-500 hover:-translate-y-1">
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  );
}

export function TeamGrid() {
  const [lead, ...rest] = TEAM;
  // alternate so each partner heads a column: Bela left, Manny right
  const left = rest.filter((_, i) => i % 2 === 0);
  const right = rest.filter((_, i) => i % 2 === 1);
  const leadRole = lead.role.split(",").map((r) => r.trim());

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
        </Reveal>

        <div className="mt-16 grid items-start gap-8 md:mt-20 lg:grid-cols-[1fr_1.35fr_1fr] lg:gap-10">
          {/* featured lead — first on mobile */}
          <Reveal className="lg:order-2">
            <div className="relative flex flex-col items-center pt-24">
              <div className="absolute top-0 z-10">
                <Portrait member={lead} size="lg" />
              </div>
              <div className={`w-full bg-gradient-to-b from-gold/70 via-gold/15 to-white/[0.04] p-px ${SHIELD}`}>
                <div className={`flex flex-col items-center bg-[linear-gradient(180deg,#1d1c16_0%,#111112_75%)] px-8 pt-28 pb-12 text-center md:px-12 ${SHIELD}`}>
                  <h2 className="font-serif text-[42px] leading-tight text-white md:text-[48px]">{titleCase(lead.name ?? "")}</h2>
                  <p className="mt-1 font-serif text-xl text-gold italic">{titleCase(leadRole.slice(-1)[0])}</p>
                  <p className="mt-1 text-[11px] tracking-[0.28em] text-white/45">{leadRole[0]}</p>
                  <p className="mt-6 max-w-sm text-[14.5px] leading-7 font-light text-white/60">
                    Founded JAZA Media in 2022 and grew it into the JAZA Group of Companies — founding, scaling, and exiting three companies along the way.
                  </p>
                  <Link
                    href={`/team/${lead.slug}`}
                    className="group mt-8 inline-flex items-center gap-2 rounded-md border border-gold/60 bg-gold/10 px-6 py-3 text-sm tracking-wide text-white transition hover:bg-gold hover:text-ink"
                  >
                    Read More
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#team-more"
                    aria-label="Scroll to the rest of the page"
                    className="mt-10 grid size-14 place-items-center rounded-full border border-white/15 text-white/70 ring-8 ring-white/[0.03] transition hover:border-gold hover:text-gold"
                  >
                    <ArrowDown className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:order-1 lg:mt-10 lg:grid-cols-1">
            {left.map((m, i) => (
              <Reveal key={m.slug} delay={0.06 * i}>
                <SideCard member={m} />
              </Reveal>
            ))}
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:order-3 lg:mt-10 lg:grid-cols-1">
            {right.map((m, i) => (
              <Reveal key={m.slug} delay={0.06 * i}>
                <SideCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <div id="team-more" />
    </section>
  );
}
