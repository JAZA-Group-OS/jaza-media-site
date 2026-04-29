"use client";

import { useInView } from "@/lib/use-in-view";

function ImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] w-full rounded-md border-4 border-white bg-white/90 shadow-inner"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

function TextPlaceholder() {
  const lines = Array.from({ length: 11 });
  return (
    <div
      aria-hidden
      className="space-y-2 text-[13px] font-medium leading-relaxed text-brand-black md:text-sm"
    >
      {lines.map((_, i) => (
        <div
          key={i}
          className="h-3 animate-about-shimmer rounded-full"
          style={{ width: `${88 - (i % 3) * 6}%` }}
        />
      ))}
    </div>
  );
}

export function FeaturedYellowCard() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={ref}
          className={`rounded-2xl bg-brand-yellow p-6 shadow-sm md:p-10 ${
            inView ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <div className="flex items-center">
              <ImagePlaceholder />
            </div>
            <div className="flex items-center">
              <TextPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
