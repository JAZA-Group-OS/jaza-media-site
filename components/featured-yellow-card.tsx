import { ArrowRight, CalendarHeart, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

const GOLD_TEXT = "bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text text-transparent";
const WHITE_TEXT = "bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent";

const HIGHLIGHTS = [
  { Icon: Sparkles, label: "Tako Titan Eating Challenge" },
  { Icon: CalendarHeart, label: "Trivia Day & Grand Raffle" },
  { Icon: Users, label: "Four live cosplayers" },
];

export function FeaturedYellowCard() {
  return (
    <section className="relative overflow-hidden bg-ink pb-12 text-white md:pb-16">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          {/* gold hairline border */}
          <div className="rounded-[36px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="relative grid items-center gap-10 overflow-hidden rounded-[35px] bg-[radial-gradient(120%_120%_at_100%_0%,#2a2210_0%,#121212_45%,#0c0c0d_100%)] p-5 md:grid-cols-[1.1fr_1fr] md:gap-14 md:p-8 lg:p-10">
              <div aria-hidden className="anim-glow-breathe pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-gold/20 blur-[130px]" />

              {/* Photo with effects */}
              <div className="group relative">
                <div aria-hidden className="anim-glow-breathe absolute inset-8 rounded-3xl bg-gold/30 blur-[70px]" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] ring-1 ring-white/15 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)]">
                  <div className="anim-ken-burns absolute inset-0">
                    <Image
                      src="/images/Blog.png"
                      alt="JAZA Media team celebrating Yaki-Yaki's 2nd anniversary"
                      fill
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  {/* light streak + cinematic vignette */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="anim-card-streak absolute -inset-y-1/2 left-0 w-1/4 rotate-[20deg] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
                  </div>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                  <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-gold/20" />

                  {/* glass badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 md:bottom-6 md:left-6 md:right-6">
                    <div className="rounded-2xl border border-white/10 bg-ink/60 px-5 py-3 backdrop-blur-xl">
                      <div className={`font-serif text-3xl italic ${GOLD_TEXT}`}>2nd</div>
                      <div className="mt-0.5 text-[10px] font-medium tracking-[0.28em] text-white/60">ANNIVERSARY</div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-ink/60 px-3 py-1.5 text-[10px] font-medium tracking-[0.22em] text-gold backdrop-blur-xl">
                      YAKI-YAKI × JAZA MEDIA
                    </span>
                  </div>
                </div>
              </div>

              {/* Story */}
              <div className="relative">
                <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
                  <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
                  FEATURED STORY
                </p>
                <h2 className="mt-6 font-serif text-4xl leading-[1.04] tracking-[-0.03em] text-balance md:text-[52px]">
                  <span className={WHITE_TEXT}>Celebrating Yaki&#8209;Yaki&apos;s</span>{" "}
                  <em className={`${GOLD_TEXT} pr-1`}>2nd Anniversary</em>
                </h2>
                <p className="mt-6 text-[15px] font-light leading-7 tracking-wide text-white/60 md:text-base md:leading-8">
                  One of the Yaki-Yaki branches recently celebrated its 2nd Anniversary, proudly hosted by
                  JAZA Media. The event was filled with excitement through activities that energized the entire
                  celebration, while our content creators produced dynamic campaign content throughout. Most
                  importantly, our valued customers shared unforgettable moments and made the celebration
                  truly special.
                </p>
                <ul className="mt-7 space-y-3">
                  {HIGHLIGHTS.map(({ Icon, label }) => (
                    <li key={label} className="flex items-center gap-3 text-sm text-white/80">
                      <span className="grid size-7 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                        <Icon className="size-3.5" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/blog"
                  className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
                >
                  SEE THE FULL BLOG
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
