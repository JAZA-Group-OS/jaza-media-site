import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

const HIGHLIGHTS = ["Tako Titan Eating Challenge", "Trivia Day & Grand Raffle", "Four live cosplayers"];

export function FeaturedYellowCard() {
  return (
    <section className="border-t border-black/10 bg-white text-ink">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#EDEAE3]">
                <Image
                  src="/images/Blog.png"
                  alt="JAZA Media team celebrating Yaki-Yaki's 2nd anniversary"
                  fill
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[12px] tracking-[0.18em] text-ink/50">
                YAKI-YAKI × JAZA MEDIA · 2ND ANNIVERSARY
              </figcaption>
            </figure>

            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-ink/60">
                <span aria-hidden className="h-px w-8 bg-gold-deep" />
                FEATURED STORY
              </p>
              <h2 className="mt-5 font-serif text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-balance md:text-[42px]">
                Celebrating Yaki&#8209;Yaki&apos;s <span className="text-gold-deep">2nd Anniversary</span>
              </h2>
              <p className="mt-5 text-[15.5px] leading-7 text-ink/65">
                One of the Yaki-Yaki branches recently celebrated its 2nd Anniversary, proudly hosted by JAZA Media.
                The event was filled with excitement through activities that energized the entire celebration, while
                our content creators produced dynamic campaign content throughout. Most importantly, our valued
                customers shared unforgettable moments and made the celebration truly special.
              </p>
              <ul className="mt-6 space-y-2.5">
                {HIGHLIGHTS.map((label) => (
                  <li key={label} className="flex items-center gap-3 text-[14.5px] text-ink/80">
                    <span aria-hidden className="size-1.5 rounded-full bg-gold-deep" />
                    {label}
                  </li>
                ))}
              </ul>
              <Link
                href="/blog"
                className="group mt-9 inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink-soft"
              >
                Read the full story
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
