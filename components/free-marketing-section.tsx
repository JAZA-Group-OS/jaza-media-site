import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

const COURSES = [
  {
    tag: "It's free",
    title: "Marketing Course",
    image: "/about-the-form/Rule of Marketing.png",
    alt: "The 10K Rule Of Marketing — Smarter Moves, Massive Returns",
    cta: "Take this Course",
    href: "/courses/rule-of-10x",
    dark: false,
  },
  {
    tag: "New release",
    title: "Lead Generation Course",
    image: "/about-the-form/Rule of Advertising.png",
    alt: "The 10K Rule Of Advertising — Smarter Strategy, Maximum ROI",
    cta: "Take this Course",
    href: "/courses/rule-of-10x",
    dark: false,
  },
  {
    tag: "Online / Onsite",
    title: "Business Scaling",
    image: "/images/Business Scaling.png",
    alt: "JAZA Media Business Scaling program",
    cta: "Book a Call",
    href: "/partner-with-us",
    dark: true,
  },
];

export function FreeMarketingSection() {
  return (
    <section id="free-advance-marketing" className="relative bg-ink pt-10 pb-24 text-white md:pt-14 md:pb-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-medium tracking-[0.35em] text-gold/90">FREE RESOURCES</p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.02em] md:text-6xl">
              Free <em className="text-gold">advanced</em> marketing
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed font-light text-white/55">
              Videos, eBooks, guides, templates &amp; downloads to help you succeed.
            </p>
          </div>
          <Link
            href="/courses/rule-of-10x"
            className="group hidden shrink-0 items-center gap-2 text-sm text-white/80 transition hover:text-white md:inline-flex"
          >
            Browse all
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {COURSES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Link href={c.href} className="group block">
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl ring-1 ring-white/10 transition duration-500 group-hover:ring-white/25 ${
                    c.dark
                      ? "bg-[radial-gradient(120%_90%_at_20%_0%,#3a2f12_0%,#141414_55%,#0b0b0b_100%)]"
                      : i === 0
                        ? "bg-[radial-gradient(120%_90%_at_15%_0%,#2b2b2b_0%,#151515_55%,#0b0b0b_100%)]"
                        : "bg-[radial-gradient(120%_90%_at_85%_0%,#4a3a10_0%,#171512_55%,#0b0b0b_100%)]"
                  }`}
                >
                  {/* glossy sheen */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.06)_50%,transparent_65%)]" />
                  <div aria-hidden className="anim-glow-breathe absolute size-56 rounded-full bg-gold/20 blur-[70px] transition-colors duration-500 group-hover:bg-gold/30" style={{ animationDelay: `${i * -1.6}s` }} />
                  <div className="anim-book-float relative h-[78%]" style={{ animationDelay: `${i * -2}s` }}>
                    <Image
                      src={c.image}
                      alt={c.alt}
                      width={1600}
                      height={2500}
                      sizes="220px"
                      className="h-full w-auto rounded-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition duration-700 group-hover:scale-[1.05]"
                    />
                    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm">
                      <div className="anim-book-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" style={{ animationDelay: `${i * 1.2}s` }} />
                    </div>
                  </div>
                  <span className="absolute top-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-medium tracking-[0.22em] text-gold uppercase backdrop-blur">
                    {c.tag}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{c.title}</h3>
                    <p className="mt-0.5 text-sm text-white/45">{c.cta}</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
