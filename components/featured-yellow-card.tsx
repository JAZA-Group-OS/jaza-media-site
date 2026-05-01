"use client";

import Image from "next/image";
import Link from "next/link";

import { useInView } from "@/lib/use-in-view";

export function FeaturedYellowCard() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div
          ref={ref}
          className={`rounded-2xl bg-brand-yellow p-4 shadow-sm md:p-5 ${
            inView ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <div className="grid gap-5 md:grid-cols-2 md:gap-8">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src="/images/Blog.png"
                alt="JAZA Media team celebrating Yaki-Yaki's 2nd anniversary"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-6">
              <p className="text-justify font-heading text-base font-medium leading-relaxed text-brand-black md:text-[17px]">
                One of the Yaki-Yaki branches recently celebrated its 2nd
                Anniversary, proudly hosted by JAZA Media. The event was filled
                with excitement through activities like the Tako Titan Eating
                Challenge, Trivia Day, and a Grand Raffle that energized the
                entire celebration. Guests enjoyed live appearances from four
                talented cosplayers, while our content creators produced dynamic
                campaign content throughout the event. Most importantly, our
                valued customers shared unforgettable moments and made the
                celebration truly special.
              </p>
              <div className="flex justify-end">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 font-heading text-base font-bold text-brand-black shadow-sm transition hover:bg-neutral-100 md:text-lg"
                >
                  See the full blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
