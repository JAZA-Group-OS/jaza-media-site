"use client";

import { useInView } from "@/lib/use-in-view";

export function BlogHero() {
  const { ref: headRef, inView: headIn } = useInView<HTMLHeadingElement>();
  const { ref: copyRef, inView: copyIn } = useInView<HTMLParagraphElement>();

  return (
    <section className="bg-white pt-12 pb-8 md:pt-16 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h1
          ref={headRef}
          className={`font-heading text-[44px] font-black leading-[1.05] tracking-tight text-brand-black sm:text-[56px] md:text-[68px] lg:text-[88px] ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          The Art of Campaigns
        </h1>
        <p
          ref={copyRef}
          style={{ animationDelay: copyIn ? "120ms" : undefined }}
          className={`mx-auto mt-6 max-w-3xl font-heading text-base leading-relaxed text-brand-black/90 md:text-lg lg:text-xl ${
            copyIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          A weekly article featuring real business stories, CEO insights, and
          proven scaling campaign strategies. Discover powerful campaign ideas
          and cost-effective, high-impact ways to grow your business —
          consistently and strategically.
        </p>
      </div>
    </section>
  );
}
