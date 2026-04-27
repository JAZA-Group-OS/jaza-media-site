import type { ReactNode } from "react";

type BookVariant = "marketing" | "advertising" | "dark";

interface CourseCardProps {
  tag: string;
  title: ReactNode;
  bookVariant: BookVariant;
  ctaLabel: string;
}

function MarketingBook() {
  return (
    <div className="relative flex h-52 w-36 flex-col bg-brand-black md:h-60 md:w-40">
      <div className="space-y-1.5 px-3 pt-3">
        <p className="font-heading text-[10px] font-semibold tracking-wide text-brand-yellow">
          JAZA Media
        </p>
        <div className="h-px w-full bg-brand-yellow/60" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-3">
        <h4 className="font-heading text-2xl leading-[1.02] font-black text-white">
          The 10K
          <br />
          Rule Of
        </h4>
        <p className="mt-1 font-heading text-lg leading-tight font-black text-white">
          Marketing
        </p>
        <p className="mt-2 text-[8px] font-medium text-white/80">
          Smarter Moves, Massive Returns
        </p>
      </div>
      <div className="bg-brand-yellow px-3 py-1.5 text-center">
        <p className="font-heading text-[11px] font-black tracking-wider text-brand-black">
          JAZA
          <br />
          SARMIENTO
        </p>
      </div>
    </div>
  );
}

function AdvertisingBook() {
  return (
    <div className="relative flex h-52 w-36 flex-col bg-brand-yellow md:h-60 md:w-40">
      <div className="space-y-1.5 px-3 pt-3">
        <p className="font-heading text-[10px] font-semibold tracking-wide text-brand-black">
          JAZA Media
        </p>
        <div className="h-px w-full bg-brand-black/60" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-3">
        <h4 className="font-heading text-2xl leading-[1.02] font-black text-brand-black">
          The 10K
          <br />
          Rule Of
        </h4>
        <p className="mt-1 font-heading text-lg leading-tight font-black text-brand-black">
          Advertising
        </p>
        <p className="mt-2 text-[8px] font-medium text-brand-black/80">
          Smarter Strategy, Maximum ROI
        </p>
      </div>
      <div className="bg-brand-black px-3 py-1.5 text-center">
        <p className="font-heading text-[11px] font-black tracking-wider text-brand-yellow">
          JAZA
          <br />
          SARMIENTO
        </p>
      </div>
    </div>
  );
}

function DarkBlock() {
  return (
    <div className="h-52 w-36 bg-brand-black md:h-60 md:w-40" aria-hidden />
  );
}

export function CourseCard({
  tag,
  title,
  bookVariant,
  ctaLabel,
}: CourseCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-block rounded-md bg-tag-red px-3 py-1 text-[10px] font-black tracking-wide text-white uppercase">
        {tag}
      </span>
      <h3 className="mt-3 font-heading text-base leading-tight font-black tracking-tight md:text-lg">
        {title}
      </h3>

      <div className="relative mt-6 flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
        <div
          className="absolute top-1/2 left-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 md:size-64"
          aria-hidden
        />
        <div className="relative">
          {bookVariant === "marketing" && <MarketingBook />}
          {bookVariant === "advertising" && <AdvertisingBook />}
          {bookVariant === "dark" && <DarkBlock />}
        </div>
      </div>

      <a
        href="#"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-yellow px-10 py-3 text-base font-bold text-brand-black transition-transform hover:scale-[1.02]"
      >
        {ctaLabel}
      </a>
    </div>
  );
}
