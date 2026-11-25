'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CalendarCheck, Check, Clock, Video } from 'lucide-react';
import { readPrefill, clearPrefill } from '@/lib/partner/booking-prefill';
import {
  buildCalendlyUrl,
  isTrustedCalendlyUrl,
  makeCalendlyMessageHandler,
} from '@/lib/partner/calendly';

// SECURITY INVARIANT: this fallback must always be a trusted hardcoded
// string controlled by JAZA. Never derive it from request parameters,
// query strings, or user input — that would turn the booking page into
// an open-redirect to an attacker-controlled Calendly clone.
const FALLBACK_CALENDLY_URL =
  'https://calendly.com/jazamediaph/discovery-call?utm_id=97757_v0_s00_e0_tv0';

function resolveCalendlyBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  // Only use the env var if it points at a trusted Calendly host. A typo,
  // wrong env, or an injected value falls through to the fallback rather
  // than embedding a foreign URL.
  if (envUrl && isTrustedCalendlyUrl(envUrl)) return envUrl;
  return FALLBACK_CALENDLY_URL;
}

export function StepTwoBooking() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Lazy state initializer reads sessionStorage once on first render. Same
  // pattern as the funnel's answers state — keeps the URL stable across
  // re-renders and avoids re-reading on every render.
  const [calendlyUrl] = useState<string>(() =>
    buildCalendlyUrl(resolveCalendlyBase(), readPrefill()),
  );

  // Move focus to the heading on mount so keyboard / screen-reader users
  // start at a predictable place.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Initialize Calendly inline widget when the script is ready, then
  // scroll the heading into view. Two entry paths:
  //  - First page load: <Script> loads, onLoad flips scriptLoaded, this
  //    effect runs once.
  //  - SPA navigation back to /book: <Script> is a no-op (browser cached
  //    the asset), but window.Calendly already exists, so the early-init
  //    branch fires on mount with scriptLoaded=false.
  // Tying scrollIntoView to this effect (rather than mount) avoids a
  // jarring double-reflow on slow networks where the iframe arrives
  // after the initial scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === 'undefined' || !window.Calendly) return;
    // Clear any previous render so SPA-navigation re-mounts get a clean
    // slate. The container has no React children, so there's no reconciler
    // tracking to break.
    container.innerHTML = '';
    window.Calendly.initInlineWidget({
      url: calendlyUrl,
      parentElement: container,
    });
    titleRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [scriptLoaded, calendlyUrl]);

  // Listen for Calendly's "event scheduled" postMessage to detect a
  // successful booking, then route to /booked.
  useEffect(() => {
    const onScheduled = () => {
      // Analytics hook for the highest-signal conversion event in the
      // funnel. gtag is loaded by the site analytics script if present;
      // guard for absence so this doesn't break in dev or pre-analytics.
      if (typeof window !== 'undefined') {
        const w = window as unknown as {
          gtag?: (event: 'event', name: string, params?: object) => void;
        };
        w.gtag?.('event', 'partner_booking_complete');
      }
      clearPrefill();
      router.push('/partner-with-us/booked');
    };

    const handler = makeCalendlyMessageHandler(onScheduled);
    window.addEventListener('message', handler);

    // Test-only hook so Playwright can verify the routing branch without
    // forging a MessageEvent origin (non-configurable on modern Chromium).
    // Production builds tree-shake this branch via NODE_ENV inlining.
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as { __partnerHandleScheduled?: () => void })
        .__partnerHandleScheduled = onScheduled;
    }

    return () => {
      window.removeEventListener('message', handler);
      if (process.env.NODE_ENV !== 'production') {
        delete (window as unknown as {
          __partnerHandleScheduled?: () => void;
        }).__partnerHandleScheduled;
      }
    };
  }, [router]);

  return (
    <section className="relative overflow-hidden bg-[#0b0d0c] text-white">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-gold/12 blur-[170px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-14 md:py-20">
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
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Schedule your</span>{' '}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">discovery call</em>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.75] font-light text-white/65 md:text-[17px]">
            Thank you for your application. Please choose a date and time below — you&apos;ll receive a calendar invitation with a
            Google Meet link once your call is confirmed.
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

        {/* calendar in a gold-edged frame */}
        <div className="mx-auto mt-12 max-w-[920px] rounded-[28px] bg-gradient-to-b from-gold/50 via-white/10 to-white/[0.03] p-px shadow-[0_60px_120px_-40px_rgba(0,0,0,0.95)]">
          <div className="overflow-hidden rounded-[27px] bg-white">
            <div
              ref={containerRef}
              className="overflow-hidden"
              // Vanilla Calendly widget doesn't auto-resize its iframe via
              // postMessage the way react-calendly's wrapper does. 1150px gives
              // a buffer over the tallest step (the details form on a desktop
              // viewport with custom questions) without clipping. overflow:hidden
              // contains any unexpected internal layout drift.
              style={{ minWidth: '280px', height: '1150px' }}
            />
          </div>
        </div>

        <p className="mt-8 text-center text-[13px] text-white/45">
          Can&apos;t find a suitable time? Email us at{' '}
          <a href="mailto:admin@jazamedia.com" className="text-gold hover:text-[#fde68a]">
            admin@jazamedia.com
          </a>{' '}
          and we&apos;ll arrange one with you.
        </p>
      </div>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </section>
  );
}
