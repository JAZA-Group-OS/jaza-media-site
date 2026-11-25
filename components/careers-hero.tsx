"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

function HeroImage() {
  return (
    <div className="relative aspect-[2346/1581] w-full max-w-[600px] overflow-hidden rounded-2xl ring-1 ring-gold/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] lg:ml-auto">
      <Image
        src="/images/careers-hero.jpg"
        alt="JAZA Media team at work"
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 600px, 100vw"
        priority
      />
    </div>
  );
}

export function CareersHero() {
  const { ref: headlineRef, inView: headlineIn } =
    useInView<HTMLHeadingElement>();
  const { ref: copyRef, inView: copyIn } = useInView<HTMLDivElement>();
  const { ref: imageRef, inView: imageIn } = useInView<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] pt-8 pb-12 text-white md:pt-10 md:pb-14">
<div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[820px] -translate-x-1/2 rounded-full bg-gold/10 blur-[160px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="relative mx-auto max-w-5xl px-4 lg:max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_600px] lg:items-center lg:gap-12">
          <div>
            <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            CAREERS
          </p>
          <h1
              ref={headlineRef}
              className={`font-serif font-normal leading-[1.02] tracking-[-0.03em] ${
                headlineIn ? "animate-about-fade-up" : "opacity-0"
              }`}
            >
              <span className="block text-[36px] sm:text-[44px] md:whitespace-nowrap md:text-[34px] lg:text-[40px] xl:text-[54px]">
                <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Join a</span>{" "}
                <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">
                  world-record
                </em>
              </span>
              <span className="block text-[44px] sm:text-[54px] md:whitespace-nowrap md:text-[44px] lg:text-[52px] xl:text-[68px]">
                <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">breaking team!</span>
              </span>
            </h1>

            <div
              ref={copyRef}
              style={{ animationDelay: copyIn ? "120ms" : undefined }}
              className={copyIn ? "animate-about-fade-up" : "opacity-0"}
            >
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg md:text-base lg:text-lg">
                We&apos;re seeking teammates who lead with trust, work with
                discipline, and play to win as a team.
              </p>

              <a
                href="/careers/apply"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white"
              >
                View Job Openings
              </a>
            </div>
          </div>

          <div
            ref={imageRef}
            style={{ animationDelay: imageIn ? "200ms" : undefined }}
            className={`${
              imageIn ? "animate-about-pop-in" : "opacity-0"
            }`}
          >
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}
