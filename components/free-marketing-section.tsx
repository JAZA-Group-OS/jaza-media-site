import { ArrowUpRight } from "lucide-react";
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
    <section id="free-advance-marketing" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-gold-deep">RESOURCES</p>
            <h2 className="mt-4 font-serif text-5xl leading-[1.02] text-ink md:text-7xl">
              Free <em>advanced</em> marketing
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-neutral-600 md:text-lg">
            Videos, eBooks, Guides, Templates, Downloads &amp; more to help you succeed.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {COURSES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Link
                href={c.href}
                className={`group flex h-full flex-col overflow-hidden rounded-[28px] border transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] ${
                  c.dark ? "border-ink bg-ink text-white" : "border-line bg-ivory text-ink"
                }`}
              >
                <div className="relative flex h-80 items-center justify-center overflow-hidden">
                  <div
                    aria-hidden
                    className={`absolute size-60 rounded-full blur-2xl ${c.dark ? "bg-gold/25" : "bg-white"}`}
                  />
                  <Image
                    src={c.image}
                    alt={c.alt}
                    width={1600}
                    height={2500}
                    sizes="200px"
                    className="relative h-64 w-auto drop-shadow-2xl transition duration-500 group-hover:scale-[1.04] group-hover:-rotate-1"
                  />
                </div>
                <div className={`flex flex-1 items-end justify-between gap-4 border-t p-7 ${c.dark ? "border-white/10" : "border-line"}`}>
                  <div>
                    <span className={`text-[11px] font-semibold tracking-[0.25em] uppercase ${c.dark ? "text-gold" : "text-gold-deep"}`}>
                      {c.tag}
                    </span>
                    <h3 className="mt-2 font-serif text-3xl leading-tight">{c.title}</h3>
                    <span className={`mt-3 block text-sm ${c.dark ? "text-white/70" : "text-neutral-600"}`}>{c.cta}</span>
                  </div>
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-full transition group-hover:rotate-45 ${
                      c.dark ? "bg-gold text-ink" : "bg-ink text-white"
                    }`}
                  >
                    <ArrowUpRight className="size-5" />
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
