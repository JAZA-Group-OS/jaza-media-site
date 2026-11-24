import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

export function Founders() {
  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:gap-20 md:px-6">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
            <Image
              src="/about-the-form/bela-jaza.png"
              alt="Jaza Sarmiento and Bela Capistrano, founders of JAZA Media"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-6 rounded-2xl bg-ink px-6 py-4 text-white shadow-xl md:-right-8 md:left-auto">
            <div className="font-serif text-3xl text-gold">₱150M+</div>
            <div className="text-xs text-white/70">grown in three years</div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-deep">ABOUT OUR FOUNDERS</p>
          <h2 className="mt-4 font-serif text-5xl leading-[1.02] text-ink md:text-6xl">
            Built by operators, <em>for</em> operators.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-neutral-700 md:text-lg">
            <p>
              Jaza and Bela are the co-founders and managing partners of JAZA Media. In just three
              years, they have grown the company&apos;s portfolio to over ₱150M in annual revenue.
            </p>
            <p>
              Jaza began his career as a freelance video editor and Facebook advertiser before
              building one of the Philippines&apos; most recognized business communities, now with
              over 66,000 business-owner members. He is also the author of two bestselling ebooks,
              Marketing Course and Advertising Course, with a combined total of 1,000+ copies sold.
            </p>
          </div>
          <blockquote className="mt-8 border-l-2 border-gold pl-5 font-serif text-2xl italic leading-snug text-ink">
            A culture that prioritizes praise, growth, and empowerment over punishment.
          </blockquote>
          <Link
            href="/about-us"
            className="mt-10 inline-flex rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink"
          >
            Our story
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
