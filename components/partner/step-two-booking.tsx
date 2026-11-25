'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CalendarCheck, Check, Clock, Video } from 'lucide-react';

import { BookingCalendar } from '@/components/partner/booking-calendar';

// Step 2 of Partner With Us: JAZA's built-in booking calendar (replaces Calendly).

export function StepTwoBooking() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showMore, setShowMore] = useState(false);

  // Move focus to the heading on mount so keyboard / screen-reader users
  // start at a predictable place.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] text-white">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-gold/12 blur-[170px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-6 pb-14 md:pt-8 md:pb-20">
        <div className="flex flex-col items-center text-center">
          {/* step tracker */}
          <ol aria-label="Application progress" className="flex items-center gap-3 text-[10.5px] font-medium tracking-[0.28em] uppercase">
            <li className="flex items-center gap-2 text-white/45">
              <span className="grid size-6 place-items-center rounded-full border border-gold/50 text-gold">
                <Check className="size-3.5" strokeWidth={2.5} />
              </span>
              Application
            </li>
            <li aria-hidden className="h-px w-10 bg-gradient-to-r from-gold/60 to-gold/20" />
            <li aria-current="step" className="flex items-center gap-2 text-white">
              <span className="grid size-6 place-items-center rounded-full bg-gold text-[11px] font-semibold tracking-normal text-ink shadow-[0_0_14px_2px_rgba(234,179,8,0.45)]">2</span>
              Book your call
            </li>
          </ol>

          <h1
            ref={titleRef}
            tabIndex={-1}
            className="mt-8 max-w-3xl font-serif text-[40px] leading-[1.04] tracking-[-0.03em] outline-none md:text-[60px]"
          >
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Let&apos;s talk about</span>{' '}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">your growth.</em>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.75] font-light text-white/65 md:text-[17px]">
            You&apos;re one step away. Pick a time below — the Google Meet link goes straight to
            your inbox.
          </p>

          <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
            {[
              { icon: Clock, text: '30-minute session' },
              { icon: Video, text: 'Google Meet' },
              { icon: CalendarCheck, text: 'Complimentary strategy review' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] text-white/75">
                <Icon className="size-4 text-gold" strokeWidth={1.75} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* details panel + calendar */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[24px] border border-gold/30 bg-[linear-gradient(180deg,#1a1913_0%,#0f0f10_80%)] p-7 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/50">
                <Image src="/images/jaza-media-icon.png" alt="JAZA Media" fill sizes="48px" className="scale-[1.12] object-cover" />
              </span>
              <div>
                <p className="text-[10.5px] tracking-[0.28em] text-gold uppercase">JAZA Media</p>
                <p className="font-serif text-[22px] leading-tight">Discovery &amp; Strategy Meeting</p>
              </div>
            </div>
            <div aria-hidden className="my-6 h-px bg-gradient-to-r from-gold/50 to-transparent" />
            <p className="text-[14.5px] leading-[1.7] font-light text-white/70">
              <strong className="font-medium text-white">JAZA Media Business Scaling</strong> is a hands-on growth partner for
              businesses ready to scale through proven systems and real execution. We work directly with companies to
              strengthen marketing, sales, team structure, and profitability using strategies actively implemented inside JAZA
              Media and our client portfolio.
            </p>
            <figure className="relative mt-5 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-transparent px-5 py-4">
              <span aria-hidden className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#fbe7a1] via-gold to-[#a97a1f]" />
              <span aria-hidden className="pointer-events-none absolute -top-3 right-3 font-serif text-[64px] leading-none text-gold/10">&rdquo;</span>
              <p className="text-[10px] font-medium tracking-[0.2em] whitespace-nowrap text-gold/75 uppercase">Not coaching · Not motivation</p>
              <blockquote className="mt-2 font-serif text-[17px] leading-[1.45] text-white/90">
                Practical business scaling, guided by <em className="text-gold">operators</em> who build and grow brands every day.
              </blockquote>
            </figure>
            <div className={`grid transition-all duration-500 ease-out ${showMore ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
            <ul className="mt-5 grid gap-2.5">
              {[
                ['₱582M', 'in total sales generated'],
                ['₱249M', 'in total GMV generated'],
                ['88+', 'brands served and scaled'],
                ['Official', 'TikTok Shop & Affiliate Partner'],
              ].map(([k, v]) => (
                <li key={v} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
                  <Check className="size-4 shrink-0 text-gold" strokeWidth={2.5} />
                  <span className="text-[13.5px] text-white/70">
                    <span className="font-semibold text-white">{k}</span> {v}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] leading-[1.7] text-white/65">
              Whether you&apos;re stuck at low ROAS or don&apos;t know where to start,{' '}
              <span className="text-white">our team is here to guide you</span>. Book your free 30-minute discovery call and
              let&apos;s audit your brand, find the gaps, and show you what&apos;s possible.
            </p>
            <p className="mt-3 text-[14px] text-white/65">Let&apos;s make your brand the next big success story.</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-gold" />
              Spots are limited
            </p>
            <div aria-hidden className="my-6 h-px bg-gradient-to-r from-gold/50 to-transparent" />
            <ul className="space-y-2.5 text-[13.5px] text-white/70">
              <li className="flex items-center gap-2.5"><Clock className="size-4 text-gold" strokeWidth={1.75} />30 minutes</li>
              <li className="flex items-center gap-2.5"><Video className="size-4 text-gold" strokeWidth={1.75} />Google Meet — link sent by email</li>
              <li className="flex items-center gap-2.5"><CalendarCheck className="size-4 text-gold" strokeWidth={1.75} />Free of charge</li>
            </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-gold uppercase transition hover:bg-gold/10"
            >
              {showMore ? 'See less' : 'See more'}
              <span aria-hidden className={`transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}>&#9662;</span>
            </button>
          </aside>

          <div className="rounded-[28px] bg-gradient-to-b from-gold/50 via-white/10 to-white/[0.03] p-px shadow-[0_60px_120px_-40px_rgba(0,0,0,0.95)]">
            <div className="rounded-[27px] bg-[linear-gradient(180deg,#171612_0%,#0f0f10_80%)]">
              <BookingCalendar mode="book" />
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
