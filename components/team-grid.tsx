"use client";

import { useEffect, useRef, useState } from "react";
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
          <blockquote className="mt-7 max-w-2xl">
            <p className="font-serif text-[19px] leading-8 italic text-white/80 md:text-[22px] md:leading-9">
              <span aria-hidden className="mr-1 text-gold/80">&ldquo;</span>
              Each department is led by a head who sets the standard: people who carry the vision of the JAZA Group of Companies into every project and client we take on.
              <span aria-hidden className="ml-1 text-gold/80">&rdquo;</span>
            </p>
          </blockquote>
          <div aria-hidden className="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <p className="mt-5 text-[11px] font-medium tracking-[0.28em] text-white/45 uppercase">
            Hover over a profile to read their story
          </p>
        </Reveal>
      </div>

      <WaveSlider />
      <div id="team-more" />
    </section>
  );
}

// Five fixed slots on a U-shaped path: high · mid · low (centre) · mid · high.
// Every few seconds every card steps one slot to the left, so a new person
// lands in the centre spot (CEO → Company Advisor → …).
const HOLD_MS = 3500;
const MOVE_MS = 1100;

type Offset = { x: number; y: number };

function WaveSlider() {
  const wrap = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(1200);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, Offset>>({});
  const [active, setActive] = useState<string | null>(null); // card being dragged
  const [lastMoved, setLastMoved] = useState<string | null>(null); // keeps it on top
  const drag = useRef<{ slug: string; sx: number; sy: number; base: Offset; moved: boolean } | null>(null);
  const n = MEMBERS.length;
  const userSet = Object.keys(offsets).length > 0; // stop auto-advance once arranged

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused || userSet || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((s) => s + 1), HOLD_MS);
    return () => clearInterval(t);
  }, [paused, userSet]);

  const gap = W < 640 ? 12 : 28;
  const card = Math.min(290, Math.floor((W - 4 * gap) / 5));
  const pitch = card + gap;
  const dip = Math.round(card * 0.55);
  const ys = [0, dip * 0.45, dip, dip * 0.45, 0];
  const total = 5 * card + 4 * gap;
  const left0 = (W - total) / 2;
  const H = card + dip + 30;

  const onDown = (slug: string) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { slug, sx: e.clientX, sy: e.clientY, base: offsets[slug] ?? { x: 0, y: 0 }, moved: false };
  };

  const onMove = (baseX: number, baseY: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setActive(d.slug);
      setLastMoved(d.slug);
    }
    // keep the card inside the team area
    const x = Math.max(-baseX, Math.min(W - card - baseX, d.base.x + dx));
    const y = Math.max(-baseY, Math.min(H - card - baseY, d.base.y + dy));
    setOffsets((o) => ({ ...o, [d.slug]: { x, y } }));
  };

  const onUp = () => {
    setActive(null);
    setTimeout(() => (drag.current = null), 0);
  };

  return (
    <div className="mx-auto mt-8 max-w-[1560px] px-4 md:mt-10 md:px-6">
      <div
        ref={wrap}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="relative select-none"
        style={{ height: H, ["--card" as string]: `${card}px` }}
      >
        {MEMBERS.map((m, i) => {
          let slot = (((i - step) % n) + n) % n;
          if (slot > n - 1.5) slot -= n; // parked just off the left edge
          const visible = slot >= 0 && slot <= 4;
          const baseX = left0 + slot * pitch;
          const baseY = visible ? ys[slot] : 0;
          const off = offsets[m.slug] ?? { x: 0, y: 0 };
          const dragging = active === m.slug;
          return (
            <div
              key={m.slug}
              onPointerDown={onDown(m.slug)}
              onPointerMove={onMove(baseX, baseY)}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClickCapture={(e) => {
                // dropping a card shouldn't also open the bio page
                if (drag.current?.moved) e.preventDefault();
              }}
              onDragStart={(e) => e.preventDefault()}
              className={`absolute top-0 left-0 touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                transform: `translate3d(${baseX + off.x}px, ${baseY + off.y}px, 0) scale(${dragging ? 1.05 : slot === 2 && !userSet ? 1.06 : 1})`,
                opacity: visible ? 1 : 0,
                zIndex: dragging ? 60 : lastMoved === m.slug ? 40 : slot === 2 ? 20 : 10,
                pointerEvents: visible ? "auto" : "none",
                transition:
                  dragging || slot > 4
                    ? "none"
                    : `transform ${MOVE_MS}ms cubic-bezier(0.65,0,0.35,1), opacity ${MOVE_MS}ms ease`,
              }}
            >
              <TeamCard member={m} hidden={!visible} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
