"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { useInView } from "@/lib/use-in-view";

type Pillar = {
  title: string;
  src: string;
  alt: string;
  body: ReactNode;
};

const PILLARS: Pillar[] = [
  {
    title: "Performance-driven pay",
    src: "/images/Performance-%20driven%20pay.png",
    alt: "Performance-driven pay icon",
    body: (
      <>
        <p>
          We reward both the impact you create and the effort you put in to get
          there. Compensation reflects measurable results and the discipline,
          consistency, and work ethic that drive them.
        </p>
        <p>
          Clear expectations, accountability, and upside are built in for those
          who consistently raise the bar.
        </p>
      </>
    ),
  },
  {
    title: "Relentless personal growth",
    src: "/images/Relentless%20personal%20growth.png",
    alt: "Relentless personal growth icon",
    body: (
      <>
        <p>
          We expect you to get better and we&apos;ll invest in that growth.
          Through feedback, coaching, and new challenges, you&apos;ll develop
          skills that make you more effective here and more valuable anywhere.
        </p>
        <p>Growth isn&apos;t optional; it&apos;s part of the job.</p>
      </>
    ),
  },
  {
    title: "Setup to be next chapter ready",
    src: "/images/Setup%20to%20be%20next%20chapter%20ready.png",
    alt: "Setup to be next chapter ready icon",
    body: (
      <>
        <p>
          We know careers don&apos;t stand still. Whether you grow into more
          responsibility here or prepare for opportunities beyond:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We&apos;ll equip you with the tools, clarity, and experience to
            succeed in your next chapter.
          </li>
        </ul>
        <p>When you win, we all win.</p>
      </>
    ),
  },
];

function PillarCard({ pillar, delay }: { pillar: Pillar; delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${delay}ms` : undefined }}
      className={`flex flex-col ${
        inView ? "animate-about-fade-up" : "opacity-0"
      }`}
    >
      <h3 className="font-heading text-xl font-bold leading-[1.25] text-brand-black md:text-2xl lg:min-h-[2lh] lg:text-xl xl:text-2xl">
        {pillar.title}
      </h3>
      <div className="relative mx-auto mt-5 aspect-square w-40 sm:w-48 md:w-60 lg:w-72">
        <Image
          src={pillar.src}
          alt={pillar.alt}
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 288px, (min-width: 768px) 240px, (min-width: 640px) 192px, 160px"
        />
      </div>
      <div className="mt-6 space-y-4 font-heading text-base leading-relaxed text-brand-black/90 md:text-[17px]">
        {pillar.body}
      </div>
    </div>
  );
}

export function CareersInvesting() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          ref={headRef}
          className={`text-center font-heading text-[30px] font-black leading-[1.1] tracking-tight text-brand-black md:text-[42px] lg:text-[54px] xl:text-[64px] ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <span className="text-brand-yellow">INVESTING</span> in High Performers
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} pillar={p} delay={i * 100} />
          ))}
        </div>

        <div
          ref={ctaRef}
          className={`mt-12 text-center ${
            ctaIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <a
            href="/careers/apply"
            className="inline-block rounded-full bg-brand-yellow px-6 py-3 font-heading text-base font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:text-lg"
          >
            View Job Openings
          </a>
        </div>
      </div>
    </section>
  );
}
