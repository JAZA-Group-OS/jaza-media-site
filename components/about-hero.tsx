"use client";

import { useInView } from "@/lib/use-in-view";

function PhoneMockupPlaceholder() {
  return (
    <div className="relative flex aspect-[2/1] w-full items-center justify-center lg:aspect-auto lg:h-full">
      {/* Landscape black background with yellow border. On mobile: shorter
          height and full column width for a clear landscape look. On desktop:
          full container height (matches bold paragraph) and narrower width. */}
      <div className="absolute left-1/2 top-1/2 h-[80%] w-full -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border-4 border-brand-yellow bg-brand-black shadow-md lg:h-full lg:w-[80%]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent 0 8px, rgba(255, 202, 38, 0.06) 8px 9px)",
          }}
        />
      </div>

      {/* Portrait white phone — taller than the container so it sticks above
          and below the black background. */}
      <div className="relative z-10 aspect-[9/19] h-[125%] rounded-[14px] border-[3px] border-brand-black bg-white shadow-xl">
        {/* iPhone-style notch */}
        <div className="absolute left-1/2 top-[2.5%] h-[2.2%] w-[42%] -translate-x-1/2 rounded-full bg-brand-black">
          <span className="absolute left-[10%] top-1/2 h-[55%] w-[8%] -translate-y-1/2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  body,
  delay,
  shade,
}: {
  title: string;
  body: string;
  delay: number;
  shade: "light" | "dark";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const bg = shade === "light" ? "bg-neutral-200" : "bg-neutral-300";
  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${delay}ms` : undefined }}
      className={`rounded-md ${bg} p-5 text-center text-brand-black shadow-sm md:p-6 ${
        inView ? "animate-about-fade-up" : "opacity-0"
      }`}
    >
      <h3 className="font-heading text-base font-bold tracking-wide text-brand-black">
        {title}
      </h3>
      <p className="mt-3 font-heading text-[13px] font-semibold leading-relaxed text-brand-black md:text-sm">
        {body}
      </p>
    </div>
  );
}

export function AboutHero() {
  const { ref: headlineRef, inView: headlineIn } =
    useInView<HTMLHeadingElement>();
  const { ref: leadRef, inView: leadIn } = useInView<HTMLDivElement>();
  const { ref: phoneRef, inView: phoneIn } = useInView<HTMLDivElement>();
  const { ref: bodyRef, inView: bodyIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-5xl px-4">
        <h1
          ref={headlineRef}
          className={`mx-auto max-w-4xl text-center font-heading text-[32px] font-bold uppercase leading-[1.2] tracking-tight text-brand-black md:text-[40px] md:leading-[1.25] lg:text-5xl xl:text-[56px] ${
            headlineIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          BUILD YOUR
          <br />
          <mark className="box-decoration-clone rounded-md bg-brand-yellow px-2 py-0.5 text-brand-black md:whitespace-nowrap md:rounded-xl md:px-4 md:py-1.5">
            PREDICTABLE REVENUE SYSTEM
          </mark>{" "}
          AND PROFIT DRIVER IN 90 DAYS WITHOUT GUESSWORK!
        </h1>

        {/* 2x2 grid: top row pairs lead paragraph with phone mockup
            (matched heights via grid stretch). Bottom row pairs body
            copy with the Mission/Vision cards. */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Row 1, Col 1 — Bold lead paragraph */}
          <div
            ref={leadRef}
            style={{ animationDelay: leadIn ? "120ms" : undefined }}
            className={leadIn ? "animate-about-fade-up" : "opacity-0"}
          >
            <p className="font-heading text-lg font-bold leading-snug text-brand-black md:text-xl lg:text-[22px] xl:text-2xl">
              JAZA Media, the country&apos;s first fully integrated Marketing
              Agency that has an app, makes marketing and advertising
              available and accessible to anyone, anywhere, anytime.
            </p>
          </div>

          {/* Row 1, Col 2 — Phone mockup (stretches to match lead paragraph height on desktop, aspect-ratio sized on mobile) */}
          <div
            ref={phoneRef}
            style={{ animationDelay: phoneIn ? "180ms" : undefined }}
            className={`lg:h-full ${
              phoneIn ? "animate-about-pop-in" : "opacity-0"
            }`}
          >
            <PhoneMockupPlaceholder />
          </div>

          {/* Row 2, Col 1 — Body paragraphs */}
          <div
            ref={bodyRef}
            style={{ animationDelay: bodyIn ? "240ms" : undefined }}
            className={`space-y-4 text-sm leading-relaxed text-brand-black/90 md:text-[15px] ${
              bodyIn ? "animate-about-fade-up" : "opacity-0"
            }`}
          >
            <p>
              A fully integrated platform, JAZA Media provides marketing and
              advertising solutions in every step of your business scaling
              journey — whether you need assistance or partnership to simply
              scale your business 10x.
            </p>
            <p>
              As the healthcare arm of Metro Pacific Investment Corporation,
              mWell aims to bring healthcare closer to more Filipinos,
              wherever they may be — in just a few taps!
            </p>
            <p>
              As part of the JAZA Group, JAZA Media is committed to work
              towards the achievement of the UN&apos;s Sustainable Development
              Goals, particularly SDG3: Good Health and Well-being. It also
              supports the MVP Group&apos;s Gabay Kalusugan advocacy focusing
              on quality and affordable healthcare.
            </p>
          </div>

          {/* Row 2, Col 2 — Mission + Vision cards */}
          <div className="space-y-5">
            <InfoCard
              title="Our Mission"
              body="To bring marketing and advertising to more Filipinos here and abroad through a fully integrated, sustainable and future-proof digital platform that can scale their business up to 10x."
              delay={300}
              shade="light"
            />
            <InfoCard
              title="Our Vision"
              body="More than just a platform, we want to be the first integrated marketing and advertising ecosystem to represent the Philippines' best in the global stage when it comes to scaling business."
              delay={420}
              shade="dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
