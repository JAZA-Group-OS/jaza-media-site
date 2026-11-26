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
    <section id="free-advance-marketing" className="home-slide relative overflow-hidden bg-[#FAF8F3] py-14 text-ink md:flex md:min-h-[calc(100svh-114px)] md:flex-col md:justify-center md:py-10">
      {/* faint dot grid, fading out toward the centre */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(17,17,17,0.09)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,transparent_35%,black_85%)]" />
      {/* thin gold rings in the corners */}
      <div aria-hidden className="pointer-events-none absolute -top-48 -right-48 size-[440px] rounded-full border-[1.5px] border-[#FFC400]/60" />
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-[280px] rounded-full border border-[#FFC400]/35" />
      <div aria-hidden className="pointer-events-none absolute -bottom-56 -left-56 size-[480px] rounded-full border-[1.5px] border-[#FFC400]/60" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 -left-36 size-[300px] rounded-full border border-[#FFC400]/35" />
      <div className="relative mx-auto w-full max-w-[1320px] px-4 md:px-8">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[12px] font-bold tracking-[0.3em] text-ink">FREE RESOURCES <span className="h-0.5 w-12 rounded bg-[#FFC400]" /></p>
            <h2 className="mt-4 font-serif text-4xl font-bold leading-[1.02] tracking-[-0.02em] md:text-7xl">
              Free <span className="text-[#FFC400]">advanced</span> marketing
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink/70">
              Videos, eBooks, guides, templates &amp; downloads to help you succeed.
            </p>
          </div>
          <Link
            href="/courses/rule-of-10x"
            className="group hidden shrink-0 items-center gap-2 border-b-2 border-[#FFC400] pb-1 text-[15px] font-medium text-ink transition hover:text-black md:inline-flex"
          >
            Browse all
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-8 md:mx-auto md:max-w-[min(100%,calc((100svh-400px)*4.2))] md:grid-cols-3">
          {COURSES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Link href={c.href} className="group block overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden ${
                    c.dark
                      ? "bg-[linear-gradient(160deg,#FBF6EA_0%,#F1EBDD_100%)]"
                      : i === 0
                        ? "bg-[linear-gradient(160deg,#F7F5F0_0%,#E9E5DC_100%)]"
                        : "bg-[linear-gradient(160deg,#FBF7EC_0%,#ECE6D6_100%)]"
                  }`}
                >
                  {/* glossy sheen */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.06)_50%,transparent_65%)]" />
                  <div aria-hidden className="anim-glow-breathe absolute size-56 rounded-full bg-white/70 blur-[70px] transition-colors duration-500" style={{ animationDelay: `${i * -1.6}s` }} />
                  {c.dark ? (
                    /* "screen recording": framed window slowly scrolling the team collage */
                    <div className="absolute inset-x-[9%] top-[13%] bottom-0 overflow-hidden rounded-t-xl bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/10 transition duration-700 group-hover:-translate-y-1.5">
                      <div className="relative z-10 flex h-6 items-center gap-1.5 border-b border-black/10 bg-[#F3F1EC] px-3">
                        <span className="size-2 rounded-full bg-black/15" />
                        <span className="size-2 rounded-full bg-black/15" />
                        <span className="size-2 rounded-full bg-black/15" />
                      </div>
                      <div className="anim-screen-scroll" style={{ animationDelay: `${i * -3}s` }}>
                        <Image src={c.image} alt={c.alt} width={1536} height={2400} sizes="400px" className="w-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="anim-book-float relative h-[78%]" style={{ animationDelay: `${i * -2}s` }}>
                      <div className="anim-ken-burns h-full" style={{ animationDelay: `${i * -4}s` }}>
                        <Image
                          src={c.image}
                          alt={c.alt}
                          width={1600}
                          height={2500}
                          sizes="220px"
                          className="h-full w-auto rounded-sm shadow-[0_25px_45px_-15px_rgba(0,0,0,0.55)] transition duration-700 group-hover:scale-[1.05]"
                        />
                      </div>
                    </div>
                  )}
                  {/* glossy diagonal light streak sweeping the whole card */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="anim-card-streak absolute -inset-y-1/2 left-0 w-1/4 rotate-[20deg] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" style={{ animationDelay: `${i * 1.5}s` }} />
                  </div>
                  <span className="absolute top-4 left-4 z-10 rounded-full bg-[#FFC400] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.18em] text-ink uppercase shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]">
                    {c.tag}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-ink">{c.title}</h3>
                    <p className="mt-0.5 text-sm text-ink/60">{c.cta}</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink text-ink transition group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
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
