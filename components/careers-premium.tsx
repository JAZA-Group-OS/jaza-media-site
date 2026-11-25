"use client";

import { motion, useInView, useReducedMotion, useScroll, useSpring, useTime, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Check, Compass, Gauge, Handshake } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { TESTIMONIALS } from "@/lib/careers-testimonials";

const APPLY = "/careers/apply";
const img = (name: string) => `/images/${encodeURIComponent(name)}`;

/* ---------- shared bits ---------- */

function Gold({ children }: { children: ReactNode }) {
  return (
    <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">
      {children}
    </em>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 uppercase backdrop-blur">
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/70" />
        <span className="relative size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
      </span>
      {children}
    </p>
  );
}

function PrimaryButton({ href = APPLY, children }: { href?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="careers-shine group inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white"
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

const H2 = "font-serif text-[38px] leading-[1.05] tracking-[-0.025em] text-white md:text-[52px] lg:text-[58px]";
const CARD = "rounded-[20px] border border-gold/25 bg-[linear-gradient(180deg,#1a1a17_0%,#101011_75%)]";

/* ---------- 1. hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] pt-12 pb-16 text-white md:pt-20 md:pb-20">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-0 size-[760px] rounded-full bg-gold/12 blur-[160px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-4 md:px-8 lg:grid-cols-2">
        <Reveal className="flex flex-col items-start gap-6">
          <Eyebrow>Now hiring · Careers</Eyebrow>
          <h1 className="font-serif text-[48px] leading-[1] tracking-[-0.03em] md:text-[68px] lg:text-[80px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Join a</span>{" "}
            <Gold>world-record</Gold>
            <br />
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">breaking team.</span>
          </h1>
          <p className="max-w-[470px] text-[17px] leading-[1.7] font-light text-white/65 md:text-lg">
            We&apos;re seeking teammates who lead with trust, work with discipline, and play to win as a team.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <PrimaryButton>View job openings</PrimaryButton>
            <a
              href="#culture"
              className="inline-flex items-center rounded-full border border-gold/50 px-7 py-3.5 text-[12px] font-medium tracking-[0.14em] text-white uppercase transition hover:bg-gold/10"
            >
              Life at JAZA
            </a>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {["Hybrid work", "Performance-driven pay", "Coaching & growth"].map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-3.5 py-2 text-[13px] text-white/75">
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-[5/4] w-full">
          <div className="absolute top-0 left-0 aspect-[3/2] w-[88%] overflow-hidden rounded-3xl border border-gold/35 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)]">
            <Image
              src={img("careers-1.jpg")}
              alt="JAZA Media team on an outing"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="animate-careers-kenburns object-cover"
            />
          </div>
          <div className="absolute right-0 bottom-0 aspect-[3/2] w-[48%] overflow-hidden rounded-[20px] border border-gold/45 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)]">
            <Image src={img("careers-2.jpg")} alt="JAZA Media team on set" fill sizes="280px" className="object-cover" />
          </div>
          <div className={`absolute bottom-8 -left-2 flex items-center gap-3 px-4 py-3 sm:-left-4 ${CARD}`}>
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            <span className="text-[13px] text-white/85">Hybrid · Philippines</span>
          </div>
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
    <div ref={ref} aria-hidden className="relative h-[460px] overflow-hidden bg-[#0b0d0c] [perspective:1600px] md:h-[680px]">
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

/* ---------- 3. values: pinned photo + numbered list ---------- */

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

const ROTATE_MS = 4500;

function ValueRow({ i, active, onActive }: { i: number; active: boolean; onActive: (i: number) => void }) {
  const v = VALUES[i];
  return (
    <button
      type="button"
      onClick={() => onActive(i)}
      onMouseEnter={() => onActive(i)}
      className={`relative flex w-full gap-6 border-b border-white/[0.08] py-8 text-left transition-opacity duration-500 last:border-b-0 md:gap-7 lg:py-10 ${active ? "opacity-100" : "lg:opacity-45 lg:hover:opacity-80"}`}
    >
      <span className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text font-serif text-[52px] leading-none text-transparent italic md:text-[64px]">
        0{i + 1}
      </span>
      <div>
        <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl border border-gold/25 lg:hidden">
          <Image src={img(v.photo)} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <h3 className="mt-1.5 font-serif text-[28px] leading-tight text-white md:text-[30px]">{v.title}</h3>
        <p className="mt-2.5 leading-[1.75] font-light text-white/62">{v.body}</p>
      </div>
      {active && (
        <span aria-hidden className="absolute bottom-[-1px] left-0 hidden h-px w-full overflow-hidden lg:block">
          <span key={i} className="values-progress block h-full bg-gold" style={{ animationDuration: `${ROTATE_MS}ms` }} />
        </span>
      )}
    </button>
  );
}

function Values() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % VALUES.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, paused]);
  return (
    <section id="culture" className="scroll-mt-28 border-t border-white/5 bg-[#0e0e0f] py-20 text-white md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal className="mx-auto mb-14 flex max-w-[820px] flex-col items-center gap-5 text-center md:mb-16">
          <Eyebrow>Who we hire</Eyebrow>
          <h2 className={H2}>
            Disciplined team players who trust and <Gold>win together.</Gold>
          </h2>
        </Reveal>

        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div className="sticky top-[calc(50vh-180px)] hidden aspect-[3/2] overflow-hidden rounded-3xl border border-gold/30 lg:block">
            {VALUES.map((v, i) => (
              <Image
                key={v.photo}
                src={img(v.photo)}
                alt=""
                fill
                sizes="560px"
                className={`object-cover transition-all duration-1000 ${i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-6 py-5">
              <span className="text-xs tracking-[0.24em] text-gold">0{active + 1} / 04</span>
            </div>
          </div>
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {VALUES.map((_, i) => (
              <ValueRow key={i} i={i} active={i === active} onActive={setActive} />
            ))}
          </div>
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

function TogetherCard({ t, i }: { t: (typeof TOGETHER)[number]; i: number }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] bg-gradient-to-b from-gold/40 via-white/10 to-white/[0.03] p-px shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_50px_100px_-40px_rgba(234,179,8,0.35)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[25px] bg-[linear-gradient(180deg,#17160f_0%,#0f0f10_70%)]">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={img(t.photo)}
            alt={t.title}
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            className="object-cover object-top grayscale-[0.35] transition duration-1000 group-hover:scale-105 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141410] via-transparent to-black/20" />
          <span className="absolute top-5 left-5 grid size-11 place-items-center rounded-full border border-gold/50 bg-black/50 font-serif text-lg text-gold italic backdrop-blur">
            0{i + 1}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-7 pt-2 pb-8">
          <h3 className="font-serif text-[30px] leading-tight text-white">{t.title}</h3>
          <p className="mt-2 font-serif text-[17px] text-gold italic">{t.short}</p>
          <div aria-hidden className="my-5 h-px w-10 bg-gold/60 transition-all duration-500 group-hover:w-20" />
          <p className="text-[15px] leading-[1.75] font-light text-white/65">{t.body}</p>
        </div>
      </div>
    </article>
  );
}

function Together() {
  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 size-[800px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[160px]" />
      <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal className="mx-auto mb-14 flex max-w-[720px] flex-col items-center gap-5 text-center">
          <Eyebrow>Life at JAZA</Eyebrow>
          <h2 className={H2}>
            How we work <Gold>together.</Gold>
          </h2>
          <p className="font-serif text-[19px] text-white/60 italic md:text-[21px]">
            Impact over hours. Systems over shortcuts. Growth as part of the job.
          </p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {TOGETHER.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.12} className="h-full">
              <TogetherCard t={t} i={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. how we hire: timeline ---------- */

const STEPS = [
  { title: "Your goals & experience", body: "What you've done and what you're looking for.", Icon: Compass },
  { title: "Technical depth", body: "How you solve problems and drive real results.", Icon: Gauge },
  { title: "Culture & values", body: "How you collaborate, make decisions, and align with our principles.", Icon: Handshake },
];

const PROMISES = ["Transparency", "Respect for your time", "Clear communication"];

function Hire() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  return (
    <section id="openings" className="relative scroll-mt-28 overflow-hidden bg-[#0e0e0f] py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.07] blur-[160px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="relative mx-auto max-w-[1200px] px-4 text-center md:px-8">
        <Reveal className="flex flex-col items-center gap-5">
          <Eyebrow>The process</Eyebrow>
          <h2 className={H2}>
            How we <Gold>hire</Gold>
          </h2>
          <p className="max-w-[640px] leading-[1.8] font-light text-white/60">
            We believe great companies are built by disciplined people who trust and win together. Our process is structured,
            straightforward, and designed to give you a clear sense of what it&apos;s like to work here.
          </p>
        </Reveal>

        <div ref={ref} className="relative mt-16 grid gap-6 text-left md:grid-cols-3">
          <motion.div
            aria-hidden
            className="absolute top-[52px] right-[10%] left-[10%] hidden h-px origin-left bg-gradient-to-r from-gold/0 via-gold/70 to-gold/0 md:block"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {STEPS.map(({ title, body, Icon }, i) => (
            <motion.div
              key={title}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-gold/45 via-white/10 to-white/[0.03] p-px shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)] transition duration-500 hover:-translate-y-2"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.3 + i * 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-full overflow-hidden rounded-[23px] bg-[linear-gradient(180deg,#1a1913_0%,#0f0f10_75%)] p-7 md:p-8">
                <span aria-hidden className="pointer-events-none absolute -right-3 -bottom-10 font-serif text-[170px] leading-none text-white/[0.04] italic transition duration-700 group-hover:text-gold/[0.09]">
                  0{i + 1}
                </span>
                <div aria-hidden className="pointer-events-none absolute -top-24 -left-16 size-56 rounded-full bg-gold/10 opacity-0 blur-3xl transition duration-700 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold shadow-[0_0_24px_-4px_rgba(234,179,8,0.45)]">
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>
                  <span className="text-[10.5px] font-medium tracking-[0.3em] text-gold/80 uppercase">Step 0{i + 1}</span>
                </div>
                <h3 className="relative mt-8 font-serif text-[28px] leading-tight">{title}</h3>
                <p className="relative mt-3 leading-[1.75] font-light text-white/62">{body}</p>
                <div aria-hidden className="relative mt-8 h-px w-12 bg-gold/60 transition-all duration-500 group-hover:w-24" />
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal className="mt-14 flex flex-col items-center gap-7">
          <div className="flex flex-wrap justify-center gap-3">
            {PROMISES.map((p) => (
              <span key={p} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] text-white/75">
                <Check className="size-3.5 text-gold" strokeWidth={2.4} />
                {p}
              </span>
            ))}
          </div>
          <p className="max-w-[560px] text-[15px] leading-7 text-white/55">
            Every role is a little different, but this is our promise at every step.
          </p>
          <PrimaryButton>
            Start your application
          </PrimaryButton>
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
    <section className="bg-[#0b0d0c] py-20 text-white md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <h2 className={`${H2} mb-14 text-center`}>
            <Gold>Investing</Gold> in high performers
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className={`group h-full p-8 transition duration-500 hover:-translate-y-1 hover:border-gold/50 md:p-9 ${CARD}`}>
                <div className="relative size-24 rounded-full p-1 ring-1 ring-gold/50 shadow-[0_0_0_10px_rgba(234,179,8,0.06)]">
                  <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-gold/30 [animation-duration:3s]" />
                  <div className="relative size-full">
                    <Image src={img(p.icon)} alt="" fill sizes="96px" className="object-contain" />
                  </div>
                </div>
                <h3 className="mt-7 font-serif text-[28px] leading-tight">{p.title}</h3>
                <p className="mt-3 leading-[1.75] font-light text-white/62">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <PrimaryButton>View job openings</PrimaryButton>
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
    <div className={`flex h-full flex-col gap-5 p-7 transition duration-500 hover:border-gold/50 ${CARD}`}>
      <span aria-hidden className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text font-serif text-6xl leading-[0.5] text-transparent">
        “
      </span>
      <p className="leading-[1.7] text-white/75">{s.quote}</p>
      {open && (
        <div className="space-y-3 border-t border-white/10 pt-4 text-[14.5px] leading-[1.7] font-light text-white/60">
          {t.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/60">
          <Image src={t.photo} alt={t.name} fill sizes="48px" className="object-cover" />
        </div>
        <div>
          <div className="text-[15px] font-semibold">{t.name}</div>
          <div className="text-[13px] text-white/50">{s.role}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="self-start text-[13px] text-gold transition hover:text-[#fde68a]"
      >
        {open ? "Show less" : "Read story →"}
      </button>
    </div>
  );
}

function Testimonials() {
  const sam = TESTIMONIALS.find((x) => x.name === "Samantha M.")!;
  return (
    <section className="bg-[#0e0e0f] py-20 text-white md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <h2 className={`${H2} mb-12 text-center`}>
            Why our people <Gold>love</Gold> working here
          </h2>
        </Reveal>
        <Reveal>
          <figure className={`mb-6 grid overflow-hidden md:grid-cols-[2fr_3fr] ${CARD}`}>
            <div className="relative min-h-[340px]">
              <Image src={sam.photo} alt={sam.name} fill sizes="(min-width: 768px) 460px, 100vw" className="object-cover object-top" />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 md:p-12">
              <span aria-hidden className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text font-serif text-[90px] leading-[0.6] text-transparent">
                “
              </span>
              <blockquote className="font-serif text-[26px] leading-[1.3] md:text-[30px]">
                This was never just a job. They made us feel like part of a real family while pushing us to grow and achieve our
                individual goals in life.
              </blockquote>
              <figcaption>
                <div className="font-semibold">{sam.name}</div>
                <div className="mt-1 text-sm text-gold">PR Assistant → Full-time Paid Content Creator</div>
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
    <section className="relative overflow-hidden bg-[#0b0d0c] py-24 text-center text-white md:py-32">
      <div aria-hidden className="pointer-events-none absolute -bottom-60 left-1/2 size-[820px] -translate-x-1/2 rounded-full bg-gold/15 blur-[160px]" />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4">
        <h2 className="font-serif text-[44px] leading-[1.02] tracking-[-0.03em] md:text-[68px]">
          Your next chapter <Gold>starts here.</Gold>
        </h2>
        <p className="max-w-[520px] leading-[1.7] font-light text-white/60">
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
