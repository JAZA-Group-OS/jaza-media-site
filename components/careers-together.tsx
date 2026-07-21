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
    title: "Hybrid Work",
    src: "/images/Hybrd%20Work.png",
    alt: "JAZA Media teammates on a video call",
    body: (
      <>
        <p>
          <strong>Work is about impact, not geography.</strong> Our hybrid model
          balances flexibility with face-to-face collaboration. Remote for focus
          and autonomy, in-person for strategy and relationships.
        </p>
        <p>
          <strong>
            The goal isn&apos;t hours at a desk, it&apos;s doing work that moves
            the needle.
          </strong>
        </p>
      </>
    ),
  },
  {
    title: "Solving for Scale",
    src: "/images/Solving%20for%20Scale.png",
    alt: "JAZA Media team filming on location",
    body: (
      <>
        <p>
          <strong>We don&apos;t just talk about growth — we build it.</strong>{" "}
          We partner with entrepreneurs to scale companies with strong systems.
        </p>
        <p>
          Internally, same standard — building smarter processes, stronger
          teams, and leverage{" "}
          <strong>that compounds over time.</strong>
        </p>
      </>
    ),
  },
  {
    title: "Culture of Growth",
    src: "/images/Culture%20of%20Growth.png",
    alt: "JAZA Media teammates at a learning event",
    body: (
      <>
        <p>
          Culture isn&apos;t a buzzword — it&apos;s behavior. High bar, constant
          feedback, full accountability.
        </p>
        <p>
          <strong>
            Trust, integrity, ownership — no politics, shortcuts, or excuses.
          </strong>{" "}
          We win by focusing on fundamentals and raising standards daily.
        </p>
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
      <h3 className="text-center font-heading text-xl font-bold text-brand-black md:text-2xl">
        {pillar.title}
      </h3>
      <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-md">
        <Image
          src={pillar.src}
          alt={pillar.alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 100vw"
        />
      </div>
      <div className="mt-5 space-y-4 font-heading text-base leading-relaxed text-brand-black/90 md:text-[17px]">
        {pillar.body}
      </div>
    </div>
  );
}

export function CareersTogether() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();

  return (
    <section id="openings" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={headRef}
          className={`text-center ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="font-heading text-[30px] font-black leading-[1.1] tracking-tight text-brand-black md:text-[42px] lg:text-[54px] xl:text-[64px]">
            How we work{" "}
            <span className="text-brand-yellow">TOGETHER!</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} pillar={p} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
