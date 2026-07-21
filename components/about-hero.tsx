"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

function TeamImage() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-200 shadow-md ring-1 ring-black/5 lg:aspect-auto lg:h-full">
      <Image
        src="/images/About us.png"
        alt="JAZA Media team"
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
        priority
      />
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
      {/* h2: these sit directly under the page h1 with no intervening heading,
          so h3 here skipped a level (and preceded the ValuedClients h2). */}
      <h2 className="font-heading text-lg font-bold tracking-wide text-brand-black md:text-xl">
        {title}
      </h2>
      <p className="mt-3 font-heading text-base font-semibold leading-relaxed text-brand-black md:text-lg">
        {body}
      </p>
    </div>
  );
}

export function AboutHero() {
  const { ref: headlineRef, inView: headlineIn } =
    useInView<HTMLHeadingElement>();
  const { ref: leadRef, inView: leadIn } = useInView<HTMLDivElement>();
  const { ref: imageRef, inView: imageIn } = useInView<HTMLDivElement>();
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

        {/* Section 1 — Bold lead paragraph paired with the team image
            (two columns on desktop, stacked on mobile). */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div
            ref={leadRef}
            style={{ animationDelay: leadIn ? "120ms" : undefined }}
            className={leadIn ? "animate-about-fade-up" : "opacity-0"}
          >
            <p className="font-heading text-lg font-bold leading-snug text-brand-black md:text-xl lg:text-[28px]">
              JAZA Media is the country&apos;s first fully integrated marketing
              agency powered by its own platform, making professional marketing
              and advertising accessible to businesses anytime, anywhere.
            </p>
          </div>

          <div
            ref={imageRef}
            style={{ animationDelay: imageIn ? "180ms" : undefined }}
            className={`lg:h-full ${
              imageIn ? "animate-about-pop-in" : "opacity-0"
            }`}
          >
            <TeamImage />
          </div>
        </div>

        {/* Section 2 — Essay-form supporting copy spanning the full width. */}
        <div
          ref={bodyRef}
          style={{ animationDelay: bodyIn ? "240ms" : undefined }}
          className={`mt-10 space-y-4 text-base leading-relaxed text-brand-black/90 md:text-lg ${
            bodyIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <p>
            JAZA Media is a fully integrated marketing and advertising platform
            built to help businesses scale faster and compete globally. We
            provide end-to-end growth solutions — from strategy to execution —
            supporting companies at every stage of their business scaling
            journey.
          </p>
          <p>
            Headquartered in the Philippines, JAZA Media makes world-class
            marketing, advertising, and growth infrastructure accessible
            anytime, anywhere through a unified digital platform.
          </p>
          <p>
            As part of the JAZA Group, JAZA Media is committed to elevating
            Filipino businesses through innovation, elite talent, and
            artificial intelligence-driven marketing solutions designed for
            global growth.
          </p>
        </div>

        {/* Section 3 — Mission + Vision cards side-by-side on desktop. */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          <InfoCard
            title="Our Mission"
            body="To make world-class marketing and advertising accessible to Filipinos here and abroad through a fully integrated, sustainable, and future-proof digital platform that scales their business up to 10x."
            delay={300}
            shade="light"
          />
          <InfoCard
            title="Our Vision"
            body="To become the Philippines' leading integrated marketing and advertising ecosystem, showcasing Filipino excellence and innovation on the global stage."
            delay={420}
            shade="dark"
          />
        </div>
      </div>
    </section>
  );
}
