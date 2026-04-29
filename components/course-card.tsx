import type { ReactNode } from "react";
import Image from "next/image";

type BookVariant = "marketing" | "advertising" | "dark";

interface CourseCardProps {
  tag: string;
  title: ReactNode;
  bookVariant: BookVariant;
  ctaLabel: string;
}

function MarketingBook() {
  return (
    <Image
      src="/about-the-form/Rule of Marketing.png"
      alt="The 10K Rule Of Marketing — Smarter Moves, Massive Returns"
      width={1600}
      height={2500}
      sizes="(min-width: 768px) 160px, 144px"
      className="block h-auto w-36 md:w-40"
      priority
    />
  );
}

function AdvertisingBook() {
  return (
    <Image
      src="/about-the-form/Rule of Advertising.png"
      alt="The 10K Rule Of Advertising — Smarter Strategy, Maximum ROI"
      width={1600}
      height={2500}
      sizes="(min-width: 768px) 160px, 144px"
      className="block h-auto w-36 md:w-40"
      priority
    />
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
