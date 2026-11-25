"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { TEAM, type Member } from "@/lib/team";

// Order along the strip — CEO sits in the dip of the wave, partners beside him.
const ORDER = ["aeron", "bela", "jaza", "manny", "bea", "jyrille", "abie"];
const MEMBERS = ORDER.map((s) => TEAM.find((m) => m.slug === s)).filter(Boolean) as Member[];

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

function TeamCard({ member, hidden }: { member: Member; hidden?: boolean }) {
  const name = titleCase(member.name ?? "");
  const role = shortRole(member);
  const intro = member.bio?.[0];
  const quote = member.bio?.find((p) => p.length < 70) ?? member.bio?.at(-1);
  const hasBio = Boolean(member.bio?.length);
  const Wrapper = hasBio ? Link : "div";

  return (
    <div aria-hidden={hidden || undefined}>
      <Wrapper
        href={`/team/${member.slug}`}
        tabIndex={hidden ? -1 : hasBio ? 0 : -1}
        className="group/card relative block size-[var(--card)] overflow-hidden rounded-2xl bg-gradient-to-b from-gold/50 via-white/10 to-white/[0.03] p-px shadow-[0_30px_60px_-30px_rgba(0,0,0,0.95)] transition duration-500 hover:-translate-y-2 focus-visible:outline-none"
      >
        <div className="relative h-full overflow-hidden rounded-[15px] bg-[linear-gradient(180deg,#1b1a15_0%,#0f0f10_80%)]">
          {/* portrait */}
          <div className="absolute inset-x-0 top-0 bottom-0 bg-[radial-gradient(70%_60%_at_50%_35%,#3a2e10,#121212)]">
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
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/70 to-transparent" />
          </div>

          {/* name plate */}
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center">
            <h3 className="font-serif text-[28px] leading-tight text-white">{name}</h3>
            <p className="mt-1 text-[11px] tracking-[0.24em] text-gold uppercase">{role}</p>
          </div>

          {/* hover popup — editorial preview of the bio */}
          <div className="absolute inset-0 flex translate-y-4 flex-col bg-[#0e0e0e]/95 p-5 opacity-0 backdrop-blur-md transition duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100">
            <p className="text-[10px] tracking-[0.3em] text-gold uppercase">{role}</p>
            <h4 className="mt-1 font-serif text-[24px] leading-tight text-white">{name}</h4>
            {intro ? (
              <>
                <p className="mt-2 line-clamp-4 font-serif text-[15px] leading-snug text-white/85">{intro}</p>
                {quote && (
                  <blockquote className="mt-3 line-clamp-2 border-l-2 border-gold pl-3 font-serif text-[15px] leading-snug text-gold italic">
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

      <WaveSlider />
      <div id="team-more" />
    </section>
  );
}

// Five fixed "slots" follow a U-shaped path (high · mid · low · mid · high).
// Cards glide slowly right-to-left through the slots, rising and dipping as they go.
const LOOP = [...MEMBERS, ...MEMBERS];
const SPEED = 22; // px per second

function WaveSlider() {
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const paused = useRef(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shift = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (!paused.current && !still) shift += SPEED * dt;

      const W = el.clientWidth;
      const card = W < 640 ? 220 : W < 1024 ? 250 : 290;
      const gap = W < 640 ? 20 : 40;
      const slot = card + gap;
      const total = LOOP.length * slot;
      const dip = W < 640 ? 70 : 150;
      el.style.setProperty("--card", `${card}px`);
      el.style.height = `${card + dip + 40}px`;

      items.current.forEach((node, i) => {
        if (!node) return;
        let x = (((i * slot - shift) % total) + total) % total; // 0..total
        x -= slot; // allow one card to enter from the left edge
        const d = Math.max(-1, Math.min(1, (x + card / 2 - W / 2) / (W / 2)));
        const y = dip * (1 - d * d); // lowest at the centre
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        node.style.zIndex = String(100 - Math.round(Math.abs(d) * 50));
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrap}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="relative mt-14 h-[480px] [--card:290px] [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] md:mt-16"
    >
      {LOOP.map((m, i) => (
        <div
          key={`${m.slug}-${i}`}
          ref={(n) => {
            items.current[i] = n;
          }}
          className="absolute top-0 left-0 will-change-transform"
        >
          <TeamCard member={m} hidden={i >= MEMBERS.length} />
        </div>
      ))}
    </div>
  );
}
