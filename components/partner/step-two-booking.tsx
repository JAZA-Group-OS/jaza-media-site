'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
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
  'https://calendly.com/jazamediaph/discovery-call';

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
    <div className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        <span className="inline-block rounded-md bg-brand-yellow px-5 py-1.5 font-heading text-sm font-black tracking-wider text-brand-black uppercase">
          Step 2
        </span>
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="mt-6 font-heading text-3xl leading-tight font-black tracking-tight text-brand-black outline-none md:text-5xl"
        >
          NEXT, PLEASE BOOK YOUR CALL USING THE CALENDAR BELOW.
        </h1>
        <p className="mt-3 text-base text-neutral-700 md:text-lg">
          Pick a time that works for you. We&apos;ll send a calendar invite
          and Google Meet link.
        </p>
      </div>

      <div
        ref={containerRef}
        className="mt-10 overflow-hidden"
        // Vanilla Calendly widget doesn't auto-resize its iframe via
        // postMessage the way react-calendly's wrapper does. 1150px gives
        // a buffer over the tallest step (the details form on a desktop
        // viewport with custom questions) without clipping. overflow:hidden
        // contains any unexpected internal layout drift.
        style={{ minWidth: '280px', height: '1150px' }}
      />

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </div>
  );
}
