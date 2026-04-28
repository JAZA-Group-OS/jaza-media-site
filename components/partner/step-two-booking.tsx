'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { readPrefill, clearPrefill } from '@/lib/partner/booking-prefill';

// SECURITY INVARIANT: this fallback must always be a trusted hardcoded
// string controlled by JAZA. Never derive it from request parameters,
// query strings, or user input — that would turn the booking page into
// an open-redirect to an attacker-controlled Calendly clone.
const FALLBACK_CALENDLY_URL =
  'https://calendly.com/jazamediaph/discovery-call';

// Calendly's official postMessage event for a successful booking.
const SCHEDULED_EVENT = 'calendly.event_scheduled';

// Exported for unit and e2e tests; do not call from production code paths
// other than the message listener below. Keeping this exported lets us
// assert routing behavior without spoofing MessageEvent.origin (which is
// non-configurable on modern Chromium and silently fails Object.defineProperty).
export function isCalendlyEvent(e: MessageEvent): boolean {
  return (
    e.origin === 'https://calendly.com' &&
    typeof e.data === 'object' &&
    e.data !== null &&
    typeof (e.data as { event?: unknown }).event === 'string' &&
    ((e.data as { event: string }).event as string).startsWith('calendly.')
  );
}

// Exported for unit tests of URL composition and prefill encoding.
export function buildCalendlyUrl(base: string): string {
  const url = new URL(base);
  url.searchParams.set('primary_color', '181818');
  // The funnel's own consent disclaimer covers contact consent for our
  // PH/AU audience. If we ever expand to EU leads we'll need to drop this
  // parameter to comply with GDPR Article 13.
  url.searchParams.set('hide_gdpr_banner', '1');

  const prefill = readPrefill();
  if (prefill.fullName) url.searchParams.set('name', prefill.fullName);
  if (prefill.email) url.searchParams.set('email', prefill.email);
  // Calendly indexes additional invitee questions as a1, a2, ... in URL
  // params. The user must add these in the Calendly event settings; if
  // they are missing, Calendly silently ignores the params.
  if (prefill.phone) url.searchParams.set('a1', prefill.phone);
  if (prefill.description) url.searchParams.set('a2', prefill.description);

  return url.toString();
}

// Exported handler for tests. The production listener calls this; tests
// can call it directly with a synthetic MessageEvent to verify routing
// without trying to spoof the read-only origin.
export function makeCalendlyMessageHandler(
  onScheduled: () => void,
): (e: MessageEvent) => void {
  return function (e: MessageEvent) {
    if (!isCalendlyEvent(e)) return;
    if ((e.data as { event: string }).event !== SCHEDULED_EVENT) return;
    onScheduled();
  };
}

export function StepTwoBooking() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Lazy state initializer reads sessionStorage once on mount. Same pattern
  // as the funnel's answers state — avoids reading sessionStorage during
  // render and keeps the URL stable across re-renders.
  const [calendlyUrl] = useState<string>(() => {
    const base =
      process.env.NEXT_PUBLIC_CALENDLY_URL ?? FALLBACK_CALENDLY_URL;
    return buildCalendlyUrl(base);
  });

  // Move focus to the heading on mount, then scroll the heading into view
  // so the calendar widget is reachable on small phones without manual
  // scroll. The heading is inside the same scroll container as the widget,
  // so scrolling it is enough to position the page sensibly.
  useEffect(() => {
    titleRef.current?.focus();
    titleRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  // Initialize Calendly inline widget when both the container and the
  // script are ready. Two entry paths:
  //  - First page load: <Script> loads, onLoad flips scriptLoaded, this
  //    effect re-runs and inits the widget.
  //  - SPA navigation back to /book: <Script> is a no-op (browser cached
  //    the asset), but window.Calendly already exists from the prior load,
  //    so the early-init branch fires on mount.
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
    // The production message-listener path is covered by a vitest unit
    // test of isCalendlyEvent (deferred follow-up).
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
        // postMessage the way react-calendly's wrapper does. 1050px covers
        // the tallest step (the details form on a desktop viewport)
        // without clipping. overflow:hidden contains any unexpected
        // internal layout drift.
        style={{ minWidth: '280px', height: '1050px' }}
      />

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </div>
  );
}
