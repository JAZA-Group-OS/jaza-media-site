"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

function HeroImage() {
  return (
    <div className="relative aspect-[2346/2106] w-full max-w-[680px] overflow-hidden rounded-md lg:ml-auto">
      <Image
        src="/images/careers%201.png"
        alt="JAZA Media team at work"
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 680px, 100vw"
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
    <section className="bg-white pt-4 pb-16 md:pt-0 md:pb-20">
      <div className="mx-auto max-w-5xl px-4 lg:max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_680px] lg:items-center lg:gap-12">
          <div>
            <h1
              ref={headlineRef}
              className={`font-heading font-bold leading-[1.05] tracking-tight text-brand-black ${
                headlineIn ? "animate-about-fade-up" : "opacity-0"
              }`}
            >
              <span className="block text-[48px] md:whitespace-nowrap md:text-[34px] lg:text-[40px] xl:text-[54px]">
                Join a{" "}
                <span className="text-brand-yellow underline decoration-brand-yellow decoration-2 underline-offset-4">
                  world-record
                </span>
              </span>
              <span className="block text-[48px] md:whitespace-nowrap md:text-[44px] lg:text-[52px] xl:text-[68px]">
                breaking team!
              </span>
            </h1>

            <div
              ref={copyRef}
              style={{ animationDelay: copyIn ? "120ms" : undefined }}
              className={copyIn ? "animate-about-fade-up" : "opacity-0"}
            >
              <p className="mt-6 max-w-xl font-heading text-2xl leading-relaxed text-brand-black/90 md:text-base lg:text-lg">
                We&apos;re seeking teammates who lead with trust, work with
                discipline, and play to win as a team.
              </p>

              <a
                href="/careers/apply"
                className="mt-6 inline-block rounded-full bg-brand-yellow px-[50px] py-[15px] font-heading text-lg font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:px-6 md:py-3 md:text-base lg:text-lg"
              >
                View Job Openings
              </a>
            </div>
          </div>

          <div
            ref={imageRef}
            style={{ animationDelay: imageIn ? "200ms" : undefined }}
            className={`lg:h-full ${
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
