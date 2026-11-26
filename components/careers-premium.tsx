"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTime, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Check, Compass, Gauge, Handshake } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { TESTIMONIALS } from "@/lib/careers-testimonials";

const APPLY = "/careers/apply";
const img = (name: string) => `/images/${encodeURIComponent(name)}`;

/* ---------- shared bits ---------- */

function Accent({ children }: { children: ReactNode }) {
  return <span className="text-gold-deep">{children}</span>;
}

function Eyebrow({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-ink/60 uppercase ${center ? "justify-center" : ""}`}>
      <span aria-hidden className="h-px w-8 bg-gold-deep" />
      {children}
      {center && <span aria-hidden className="h-px w-8 bg-gold-deep" />}
    </p>
  );
}

function PrimaryButton({ href = APPLY, children }: { href?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink-soft"
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

const SLIDE = "snap-start md:flex md:min-h-[calc(100svh-120px)] md:flex-col md:justify-center scroll-mt-28 text-ink";
const H2 = "font-heading text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink md:text-[40px] lg:text-[44px]";

/* ---------- 1. hero ---------- */

function Hero() {
  return (
    <section id="top" className={`${SLIDE} bg-[#FAF9F6] py-14 md:py-12`}>
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
        <Reveal className="flex flex-col items-start gap-6">
          <Eyebrow>Now hiring · Careers</Eyebrow>
          <h1 className="font-heading text-[40px] leading-[1.08] font-semibold tracking-[-0.025em] md:text-[54px] lg:text-[62px]">
            Join a <Accent>world-record</Accent>
            <br />
            breaking team.
          </h1>
          <p className="max-w-[470px] text-[17px] leading-[1.7] text-ink/65 md:text-lg">
            We&apos;re seeking teammates who lead with trust, work with discipline, and play to win as a team.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton>View job openings</PrimaryButton>
            <a
              href="#culture"
              className="inline-flex items-center rounded-md border border-black/15 bg-white px-6 py-3.5 text-[14px] font-semibold text-ink transition hover:border-black/30"
            >
              Life at JAZA
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-5">
            {["Hybrid work", "Performance-driven pay", "Coaching & growth"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-[14px] text-ink/70">
                <Check className="size-4 text-gold-deep" strokeWidth={2.4} />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-[5/4] w-full">
          <div className="absolute top-0 left-0 aspect-[3/2] w-[86%] overflow-hidden rounded-2xl bg-[#EDEAE3] shadow-[0_30px_60px_-35px_rgba(0,0,0,0.45)]">
            <Image src={img("careers-1.jpg")} alt="JAZA Media team on an outing" fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div className="absolute right-0 bottom-0 aspect-[3/2] w-[48%] overflow-hidden rounded-2xl border-[6px] border-[#FAF9F6] bg-[#EDEAE3] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
            <Image src={img("careers-2.jpg")} alt="JAZA Media team on set" fill sizes="280px" className="object-cover" />
          </div>
          <p className="absolute bottom-3 left-0 text-[12px] tracking-[0.18em] text-ink/50 uppercase">Hybrid · Philippines</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 2. photo strip ---------- */

const STRIP = ["maju.jpg", "careers-3.jpg", "careers-4.jpg", "together-scale.jpg", "together-growth.jpg", "together-hybrid.jpg"];

const WALL = [...STRIP, "careers 1.png", "careers 2.png"];

function WallRow({ files, x }: { files: string[]; x: MotionValue<string> }) {
  return (
    <motion.div style={{ x }} className="flex w-max gap-5 md:gap-6">
      {files.map((f, i) => (
        <div
          key={i}
          className="group relative aspect-[3/2] w-72 shrink-0 overflow-hidden rounded-xl bg-[#141414] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition duration-500 hover:ring-gold/60 md:w-[420px]"
        >
          <Image src={img(f)} alt="" fill sizes="420px" className="object-cover transition duration-700 group-hover:scale-105" />
        </div>
      ))}
    </motion.div>
  );
}

// 3D photo wall: three rows on a tilted plane, neighbouring rows drifting opposite ways as you scroll.
function PhotoStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.5 });
  // Rows drift on their own all the time (looping), and scrolling adds a little extra push.
  const time = useTime();
  const row = (dir: 1 | -1, speed: number, start: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform([time, p] as MotionValue<number>[], ([t, s]: number[]) => {
      if (reduce) return `${-start}%`;
      const loop = (((t / 1000) * speed + s * 12 + start) % 50 + 50) % 50; // each row holds two copies → loop at 50%
      return `${dir === 1 ? -loop : loop - 50}%`;
    });
  const r1 = row(1, 0.9, 4);
  const r2 = row(-1, 0.7, 18);
  const r3 = row(1, 0.55, 30);
  // fades in as it enters, dims as it leaves (like the reference)
  const dim = useTransform(p, [0, 0.25, 0.75, 1], [0.5, 1, 1, 0.35]);
  const rows = [WALL, [...WALL].reverse(), [...WALL.slice(3), ...WALL.slice(0, 3)]];
  return (
    <div id="wall" ref={ref} aria-hidden className="snap-start relative h-[460px] overflow-hidden bg-[#0b0d0c] [perspective:1600px] md:h-[calc(100svh-120px)]">
      <motion.div
        style={{ opacity: dim }}
        className="absolute top-1/2 left-1/2 flex w-[180%] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 [transform-style:preserve-3d] md:gap-6"
      >
        <div className="flex flex-col gap-5 [transform:rotateX(22deg)_rotateY(-12deg)_rotateZ(7deg)] md:gap-6">
          <WallRow files={[...rows[0], ...rows[0]]} x={r1} />
          <WallRow files={[...rows[1], ...rows[1]]} x={r2} />
          <WallRow files={[...rows[2], ...rows[2]]} x={r3} />
        </div>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0b0d0c] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b0d0c] to-transparent" />
    </div>
  );
}

/* ---------- 3. who we hire ---------- */

const VALUES = [
  {
    title: "You build with the long game in mind.",
    body: "You're not here for shortcuts. You care about creating businesses that compound over years, not months — focusing on fundamentals and building systems that scale.",
    photo: "maju.jpg",
  },
  {
    title: "You hold a high standard.",
    body: "Excellence isn't optional. You take ownership, sweat the details, and raise the bar for the people around you.",
    photo: "careers-3.jpg",
  },
  {
    title: "You thrive in disciplined execution.",
    body: "Big ideas matter, but execution wins. You bring focus, structure, and accountability — consistency beats intensity.",
    photo: "careers-4.jpg",
  },
  {
    title: "You win together.",
    body: "You're competitive, but not at the expense of the team. You share credit, support others, and play to win as one.",
    photo: "careers-2.jpg",
  },
];

function Values() {
  return (
    <section id="culture" className={`${SLIDE} bg-white py-20 md:py-14`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Who we hire</Eyebrow>
            <h2 className={`${H2} mt-5`}>
              Disciplined team players who trust and <Accent>win together.</Accent>
            </h2>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl bg-[#EDEAE3]">
              <Image src={img("careers-4.jpg")} alt="JAZA Media teammates with their certificates" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <ol className="divide-y divide-black/10 border-y border-black/10">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <li className="flex gap-6 py-6">
                  <span className="w-8 shrink-0 pt-1 text-[14px] font-semibold text-gold-deep">0{i + 1}</span>
                  <div>
                    <h3 className="font-heading text-[20px] leading-snug font-semibold md:text-[22px]">{v.title}</h3>
                    <p className="mt-2 text-[15.5px] leading-7 text-ink/60">{v.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. how we work together ---------- */

const TOGETHER = [
  {
    title: "Hybrid Work",
    short: "Impact, not geography.",
    body: "Remote for focus and autonomy, in-person for strategy and relationships. The goal isn't hours at a desk — it's doing work that moves the needle.",
    photo: "together-hybrid.jpg",
  },
  {
    title: "Solving for Scale",
    short: "We don't just talk about growth — we build it.",
    body: "We partner with entrepreneurs to scale companies with strong systems. Internally, same standard: smarter processes, stronger teams, and leverage that compounds.",
    photo: "together-scale.jpg",
  },
  {
    title: "Culture of Growth",
    short: "High bar, constant feedback, full accountability.",
    body: "Trust, integrity, ownership — no politics, shortcuts, or excuses. We win by focusing on fundamentals and raising standards daily.",
    photo: "together-growth.jpg",
  },
];

function Together() {
  return (
    <section id="life" className={`${SLIDE} bg-[#FAF9F6] py-20 md:py-14`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <Reveal className="mb-12 max-w-[720px]">
          <Eyebrow>Life at JAZA</Eyebrow>
          <h2 className={`${H2} mt-5`}>
            How we work <Accent>together.</Accent>
          </h2>
          <p className="mt-3 text-[17px] text-ink/60">Impact over hours. Systems over shortcuts. Growth as part of the job.</p>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {TOGETHER.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.1}>
              <article>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#EDEAE3]">
                  <Image src={img(t.photo)} alt={t.title} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover object-top" />
                </div>
                <h3 className="mt-5 font-heading text-[22px] font-semibold">{t.title}</h3>
                <p className="mt-1 text-[15px] font-medium text-gold-deep">{t.short}</p>
                <p className="mt-3 text-[15px] leading-7 text-ink/60">{t.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. how we hire ---------- */

const STEPS = [
  { title: "Your goals & experience", body: "What you've done and what you're looking for.", Icon: Compass },
  { title: "Technical depth", body: "How you solve problems and drive real results.", Icon: Gauge },
  { title: "Culture & values", body: "How you collaborate, make decisions, and align with our principles.", Icon: Handshake },
];

const PROMISES = ["Transparency", "Respect for your time", "Clear communication"];

function Hire() {
  return (
    <section id="openings" className={`${SLIDE} bg-white py-20 md:py-14`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <Eyebrow>The process</Eyebrow>
            <h2 className={`${H2} mt-5`}>
              How we <Accent>hire</Accent>
            </h2>
          </div>
          <p className="max-w-[540px] text-[16px] leading-7 text-ink/60">
            We believe great companies are built by disciplined people who trust and win together. Our process is
            structured, straightforward, and designed to give you a clear sense of what it&apos;s like to work here.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 md:grid-cols-3">
          {STEPS.map(({ title, body, Icon }, i) => (
            <Reveal key={title} delay={i * 0.08} className="bg-[#FAF9F6]">
              <li className="h-full p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-lg bg-white text-gold-deep ring-1 ring-black/10">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="text-[12px] font-semibold tracking-[0.2em] text-ink/45">STEP 0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-heading text-[21px] font-semibold">{title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink/60">{body}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-2 text-[14.5px] text-ink/75">
                  <Check className="size-4 text-gold-deep" strokeWidth={2.4} />
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[14px] text-ink/50">Every role is a little different, but this is our promise at every step.</p>
          </div>
          <PrimaryButton>Start your application</PrimaryButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 6. investing ---------- */

const PERKS = [
  {
    icon: "Performance- driven pay.png",
    title: "Performance-driven pay",
    body: "We reward both the impact you create and the effort behind it. Clear expectations, accountability, and upside are built in for those who consistently raise the bar.",
  },
  {
    icon: "Relentless personal growth.png",
    title: "Relentless personal growth",
    body: "Through feedback, coaching, and new challenges, you'll develop skills that make you more effective here and more valuable anywhere. Growth isn't optional; it's part of the job.",
  },
  {
    icon: "Setup to be next chapter ready.png",
    title: "Next-chapter ready",
    body: "Whether you grow into more responsibility here or prepare for what's beyond, we equip you with the tools, clarity, and experience to succeed. When you win, we all win.",
  },
];

function Investing() {
  return (
    <section id="perks" className={`${SLIDE} bg-[#FAF9F6] py-20 md:py-14`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <Reveal className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Benefits</Eyebrow>
            <h2 className={`${H2} mt-5`}>
              <Accent>Investing</Accent> in high performers
            </h2>
          </div>
          <PrimaryButton>View job openings</PrimaryButton>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="h-full">
              <article className="h-full rounded-2xl border border-black/10 bg-white p-8 transition hover:border-black/20">
                <div className="relative size-14">
                  <Image src={img(p.icon)} alt="" fill sizes="56px" className="object-contain" />
                </div>
                <h3 className="mt-6 font-heading text-[21px] font-semibold">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-ink/60">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. testimonials ---------- */

const SHORT: Record<string, { quote: string; role: string }> = {
  "Ron D.": { quote: "One of the strongest foundations in building my portfolio and my credibility with clients.", role: "Video Editor → Agency Owner" },
  "James N.": { quote: "My biggest takeaway was time management and discipline — staying organized and delivering on time.", role: "Editor Intern → International Clients" },
  "Allyson A.": { quote: "You didn't just teach skills — you helped shape how I think, work, and grow in this field.", role: "VA Intern → Marketing Director" },
};

function StoryCard({ name }: { name: string }) {
  const t = TESTIMONIALS.find((x) => x.name === name)!;
  const s = SHORT[name];
  const [open, setOpen] = useState(false);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-7">
      <p className="text-[16px] leading-7 text-ink/80">&ldquo;{s.quote}&rdquo;</p>
      {open && (
        <div className="mt-4 space-y-3 border-t border-black/10 pt-4 text-[14.5px] leading-7 text-ink/60">
          {t.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center gap-3 pt-6">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[#EDEAE3]">
          <Image src={t.photo} alt={t.name} fill sizes="44px" className="object-cover" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">{t.name}</div>
          <div className="text-[13px] text-ink/50">{s.role}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-5 self-start border-b border-ink/30 text-[13px] font-medium text-ink transition hover:border-ink"
      >
        {open ? "Show less" : "Read full story"}
      </button>
    </article>
  );
}

function Testimonials() {
  const sam = TESTIMONIALS.find((x) => x.name === "Samantha M.")!;
  return (
    <section id="stories" className={`${SLIDE} bg-white py-20 md:py-14`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <Reveal className="mb-10">
          <Eyebrow>Our people</Eyebrow>
          <h2 className={`${H2} mt-5`}>
            Why our people <Accent>love</Accent> working here
          </h2>
        </Reveal>
        <Reveal>
          <figure className="mb-6 grid items-center gap-8 rounded-2xl bg-[#FAF9F6] p-6 md:grid-cols-[220px_1fr] md:gap-10 md:p-10">
            <div className="relative aspect-square w-40 overflow-hidden rounded-2xl bg-[#EDEAE3] md:w-full">
              <Image src={sam.photo} alt={sam.name} fill sizes="220px" className="object-cover object-top" />
            </div>
            <div>
              <blockquote className="font-heading text-[21px] leading-[1.45] font-medium md:text-[26px]">
                &ldquo;This was never just a job. They made us feel like part of a real family while pushing us to grow and
                achieve our individual goals in life.&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-gold-deep" />
                <span className="font-semibold">{sam.name}</span>
                <span className="text-[14px] text-ink/55">PR Assistant → Full-time Paid Content Creator</span>
              </figcaption>
            </div>
          </figure>
        </Reveal>
        <div className="grid items-start gap-6 md:grid-cols-3">
          {Object.keys(SHORT).map((n, i) => (
            <Reveal key={n} delay={i * 0.08} className="h-full">
              <StoryCard name={n} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 8. closing ---------- */

function Closing() {
  return (
    <section id="join" className="snap-start border-t border-black/10 bg-[#FAF9F6] py-16 text-center text-ink md:py-20">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5">
        <h2 className="font-heading text-[34px] leading-[1.15] font-semibold tracking-[-0.02em] md:text-[48px]">
          Your next chapter <Accent>starts here.</Accent>
        </h2>
        <p className="max-w-[520px] leading-[1.7] text-ink/60">
          If you want to create — and work with a team that plays to win — you&apos;ll fit right in.
        </p>
        <PrimaryButton>View job openings</PrimaryButton>
      </Reveal>
    </section>
  );
}

export function CareersPremium() {
  return (
    <>
      <Hero />
      <PhotoStrip />
      <Values />
      <Together />
      <Hire />
      <Investing />
      <Testimonials />
      <Closing />
    </>
  );
}
