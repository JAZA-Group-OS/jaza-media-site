"use client";

import { useInView } from "@/lib/use-in-view";

function GroupImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[16/9] w-full overflow-hidden rounded-md border-4 border-white bg-white/90 shadow-inner"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

export function CareersTogether() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: imgRef, inView: imgIn } = useInView<HTMLDivElement>();

  return (
    <section id="openings" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={headRef}
          className={`text-center ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="font-heading text-[34px] font-bold leading-[1.1] tracking-tight text-brand-black md:text-[48px] lg:text-[64px] xl:text-[80px]">
            How we work TOGETHER!
          </h2>
        </div>

        <div
          ref={imgRef}
          style={{ animationDelay: imgIn ? "120ms" : undefined }}
          className={`mt-10 ${
            imgIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <GroupImagePlaceholder />
        </div>
      </div>
    </section>
  );
}
