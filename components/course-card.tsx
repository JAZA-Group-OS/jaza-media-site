import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type BookVariant = "marketing" | "advertising" | "scaling";

interface CourseCardProps {
  tag: string;
  title: ReactNode;
  bookVariant: BookVariant;
  ctaLabel: string;
  ctaHref: string;
}

function MarketingBook() {
  return (
    <Image
      src="/about-the-form/Rule of Marketing.png"
      alt="The 10K Rule Of Marketing — Smarter Moves, Massive Returns"
      width={1600}
      height={2500}
      sizes="(min-width: 1024px) 224px, (min-width: 768px) 208px, 176px"
      className="block h-auto w-44 md:w-52 lg:w-56"
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
      sizes="(min-width: 1024px) 224px, (min-width: 768px) 208px, 176px"
      className="block h-auto w-44 md:w-52 lg:w-56"
      priority
    />
  );
}

function ScalingBook() {
  return (
    <Image
      src="/images/Business Scaling.png"
      alt="JAZA Media Business Scaling program"
      width={1600}
      height={2500}
      sizes="(min-width: 1024px) 224px, (min-width: 768px) 208px, 176px"
      className="block h-auto w-44 md:w-52 lg:w-56"
      priority
    />
  );
}

const isInternalRoute = (href: string) => href.startsWith("/");

export function CourseCard({
  tag,
  title,
  bookVariant,
  ctaLabel,
  ctaHref,
}: CourseCardProps) {
  const ctaClassName =
    "mt-6 inline-flex items-center justify-center rounded-full bg-brand-yellow px-10 py-3 font-heading text-base font-bold text-brand-black transition-transform hover:scale-[1.02]";

  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-block rounded-md bg-tag-red px-3 py-1 font-heading text-[10px] font-black tracking-wide text-white uppercase">
        {tag}
      </span>
      <h3 className="mt-3 font-heading text-lg leading-tight font-black tracking-tight md:text-xl">
        {title}
      </h3>

      <div className="relative mt-6 flex h-80 w-80 items-center justify-center md:h-[340px] md:w-[340px] lg:h-[360px] lg:w-[360px]">
        <div
          className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 md:size-72 lg:size-[300px]"
          aria-hidden
        />
        <div className="relative">
          {bookVariant === "marketing" && <MarketingBook />}
          {bookVariant === "advertising" && <AdvertisingBook />}
          {bookVariant === "scaling" && <ScalingBook />}
        </div>
      </div>

      {isInternalRoute(ctaHref) ? (
        <Link href={ctaHref} className={ctaClassName}>
          {ctaLabel}
        </Link>
      ) : (
        <a href={ctaHref} className={ctaClassName}>
          {ctaLabel}
        </a>
      )}
    </div>
  );
}
