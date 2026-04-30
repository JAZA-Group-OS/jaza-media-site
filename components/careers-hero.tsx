"use client";

import { useInView } from "@/lib/use-in-view";

function HeroImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-4 border-white bg-white/90 shadow-inner lg:aspect-auto lg:h-full"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

export function CareersHero() {
  const { ref: headlineRef, inView: headlineIn } =
    useInView<HTMLHeadingElement>();
  const { ref: copyRef, inView: copyIn } = useInView<HTMLDivElement>();
  const { ref: imageRef, inView: imageIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-5xl px-4 lg:max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-12">
          <div>
            <h1
              ref={headlineRef}
              className={`font-heading font-bold leading-[1.05] tracking-tight text-brand-black ${
                headlineIn ? "animate-about-fade-up" : "opacity-0"
              }`}
            >
              <span className="block whitespace-nowrap text-[26px] md:text-[34px] lg:text-[40px] xl:text-[54px]">
                Join a{" "}
                <span className="text-brand-yellow underline decoration-brand-yellow decoration-2 underline-offset-4">
                  world-record
                </span>
              </span>
              <span className="block whitespace-nowrap text-[34px] md:text-[44px] lg:text-[52px] xl:text-[68px]">
                breaking team!
              </span>
            </h1>

            <div
              ref={copyRef}
              style={{ animationDelay: copyIn ? "120ms" : undefined }}
              className={copyIn ? "animate-about-fade-up" : "opacity-0"}
            >
              <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-black/90 md:text-lg">
                We&apos;re seeking teammates who lead with trust, work with
                discipline, and play to win as a team.
              </p>

              <a
                href="#openings"
                className="mt-6 inline-block rounded-full bg-brand-yellow px-6 py-3 font-heading text-sm font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:text-base"
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
            <HeroImagePlaceholder />
          </div>
        </div>
      </div>
    </section>
  );
}
