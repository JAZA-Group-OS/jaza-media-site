# Partner With Us — Step 2 Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/partner-with-us/qualified` with a Calendly-embedded booking page (`/partner-with-us/book`), and add a `/partner-with-us/booked` Congrats confirmation that the embed routes to on successful booking.

**Architecture:** Calendly's official inline-widget script (`https://assets.calendly.com/assets/external/widget.js`) is loaded via `next/script` and renders into a div with the URL passed by data attribute. We listen for the `calendly.event_scheduled` `postMessage` event to detect successful bookings and `router.push` to `/booked`. Qualification answers are mirrored from the funnel's sessionStorage into a separate prefill blob so they can be auto-populated into Calendly's form via URL query params.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, Tailwind v4. **No new dependencies** — using the vanilla Calendly embed instead of the `react-calendly` npm package mentioned in the spec, because:
- `react-calendly` v4.x has React 16–18 peer-dep ranges; installing under React 19 needs `--legacy-peer-deps` and the maintainership status is unclear.
- The vanilla integration is ~25 lines for the embed + listener; less surface area than learning a wrapper library's prop conventions.
- End-user experience and prefill capability are identical.

If a future upgrade wants `react-calendly`, it's a swap of one component file. The data flow (sessionStorage prefill, postMessage event) doesn't change.

**Pre-implementation review applied.** This plan was reviewed by `/noxadevteam` at the spec + plan stage. Five P0 and seven P1 fixes were baked in before code: container `overflow: hidden` + 1050px height (vanilla widget doesn't auto-resize like react-calendly does); subtitle copy rewritten ("Pick a time that works for you. We'll send a calendar invite and Google Meet link."); test-only export of the message handler (the plan's earlier `Object.defineProperty` origin spoof would silently fail on modern Chromium); a hard `README` gate for the Calendly invitee-questions setup task; analytics event on `booking_complete`; 30-minute TTL on the prefill blob to prevent cross-user PII leak; `useState` lazy init for the URL (project consistency); min-width drop to 280px; defensive `slice(0, 500)` at writePrefill; five new Playwright scenarios; `waitForSelector` over hardcoded sleep; regression check for next.config redirects on `/qualified`. P2 polish (noindex on /booked, "what happens next" line, scrollIntoView on mobile, types/calendly.d.ts, FALLBACK invariant comment) also baked in. Vitest setup deferred to a follow-up.

---

## Task 1: Add the Calendly URL env var + booking-prefill helpers

**Files:**
- Modify: `.gitignore` — verify `.env*` is already ignored (it is, per the existing file).
- Create: `.env.example`
- Create: `lib/partner/booking-prefill.ts`

- [ ] **Step 1: Create `.env.example`**

This is committed; the actual `.env.local` is gitignored. Implementer should also create `.env.local` with the same value for dev.

```bash
cat > .env.example <<'EOF'
# Calendly inline-widget URL for the Partner With Us Step 2 booking page.
# Get this from your Calendly event's "Copy link" button.
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/jazamediaph/discovery-call
EOF
```

Then for dev:

```bash
cp .env.example .env.local
```

- [ ] **Step 2: Verify `.env*` is gitignored**

Run: `grep -n '\.env' .gitignore`
Expected: shows `.env*` line (around line 34 of the existing .gitignore). If not present, add it.

- [ ] **Step 3: Create `lib/partner/booking-prefill.ts`**

```ts
import type { Answers } from './questions';

const PREFILL_KEY = 'partner-with-us:booking-prefill';
// 30 minutes. After this, the blob is treated as stale and cleared.
// Prevents User A's PII from pre-populating User B's Calendly form on a
// shared browser if A abandoned without booking.
const PREFILL_TTL_MS = 30 * 60 * 1000;
// Length floor enforced at the boundary so the contract is explicit and
// any future caller of writePrefill can't blow past it.
const MAX_DESCRIPTION_CHARS = 500;

export type BookingPrefill = {
  fullName?: string;
  email?: string;
  phone?: string;
  description?: string;
};

type StoredPrefill = BookingPrefill & {
  writtenAt: number;
};

export function writePrefill(answers: Answers) {
  if (typeof window === 'undefined') return;
  const stored: StoredPrefill = {
    fullName: answers.fullName,
    email: answers.email,
    phone: answers.phone,
    description: answers.description?.slice(0, MAX_DESCRIPTION_CHARS),
    writtenAt: Date.now(),
  };
  try {
    window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify(stored));
  } catch {
    // private mode — silently no-op; user retypes in Calendly
  }
}

export function readPrefill(): BookingPrefill {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredPrefill>;
    if (
      typeof parsed.writtenAt !== 'number' ||
      Date.now() - parsed.writtenAt > PREFILL_TTL_MS
    ) {
      // Expired or malformed — treat as absent and clean up.
      window.sessionStorage.removeItem(PREFILL_KEY);
      return {};
    }
    return {
      fullName: parsed.fullName,
      email: parsed.email,
      phone: parsed.phone,
      description: parsed.description,
    };
  } catch {
    return {};
  }
}

export function clearPrefill() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PREFILL_KEY);
  } catch {
    // no-op
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add .env.example lib/partner/booking-prefill.ts
git commit -m "feat(partner): add booking prefill helpers + env example"
```

---

## Task 2: Update the qualification funnel to write prefill and route to /book

**Files:**
- Modify: `components/partner/qualification-funnel.tsx`

- [ ] **Step 1: Add the import**

At the top of `components/partner/qualification-funnel.tsx`, add to the existing imports:

```ts
import { writePrefill } from '@/lib/partner/booking-prefill';
```

- [ ] **Step 2: Update goNext's qualified branch**

Find the existing block in `goNext` that runs after `qualify(answers)`:

```ts
    // Final step → qualify and route.
    const outcome = qualify(answers);
    // Submission point: replace with `await fetch('/api/partner', ...)` when API exists.
    // Gate the dev log so production DevTools never sees PII (phone, email, name).
    if (process.env.NODE_ENV !== 'production') {
      console.log('partner-with-us submission', { outcome, answers });
    }
    clearAnswers();
    router.push(
      outcome === 'qualified'
        ? '/partner-with-us/qualified'
        : '/partner-with-us/not-qualified',
    );
```

Replace it with:

```ts
    // Final step → qualify and route.
    const outcome = qualify(answers);
    // Submission point: replace with `await fetch('/api/partner', ...)` when API exists.
    // Gate the dev log so production DevTools never sees PII (phone, email, name).
    if (process.env.NODE_ENV !== 'production') {
      console.log('partner-with-us submission', { outcome, answers });
    }
    if (outcome === 'qualified') {
      // Mirror name/email/phone/description into the prefill blob so the
      // Calendly form on /book pre-populates without the user retyping.
      writePrefill(answers);
    }
    clearAnswers();
    router.push(
      outcome === 'qualified'
        ? '/partner-with-us/book'
        : '/partner-with-us/not-qualified',
    );
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/partner/qualification-funnel.tsx
git commit -m "feat(partner): route qualified users to /book with prefill blob"
```

---

## Task 3: Build the Step 2 booking client component

**Files:**
- Create: `types/calendly.d.ts`
- Create: `components/partner/step-two-booking.tsx`

- [ ] **Step 1a: Create the Calendly window-type declaration**

`types/calendly.d.ts`:

```ts
// Ambient typing for the Calendly inline-widget global injected by
// https://assets.calendly.com/assets/external/widget.js. Kept out of the
// component file so its global-augmentation behavior is visible at the
// project type level.
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

export {};
```

If `tsconfig.json` doesn't already include the `types/` directory, add it to the `include` array. Otherwise the file is picked up automatically because `next.config` typegen scans the project root.

- [ ] **Step 1b: Write the component**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/partner/step-two-booking.tsx
git commit -m "feat(partner): add Step 2 booking component with Calendly embed"
```

---

## Task 4: Replace the qualified route with the new /book route

**Files:**
- Delete: `app/partner-with-us/qualified/page.tsx`
- Delete: `app/partner-with-us/qualified/` (the empty dir)
- Create: `app/partner-with-us/book/page.tsx`

- [ ] **Step 1: Delete the qualified route**

```bash
rm -r app/partner-with-us/qualified
```

- [ ] **Step 2: Create the book route**

```tsx
import type { Metadata } from 'next';
import { StepTwoBooking } from '@/components/partner/step-two-booking';

export const metadata: Metadata = {
  title: 'Book Your Call — JAZA Media',
  description:
    'Step 2: pick a time on the JAZA Media discovery-call calendar. We will follow up with a calendar invite and Google Meet link.',
};

export default function BookPage() {
  return <StepTwoBooking />;
}
```

- [ ] **Step 3: Verify TypeScript compiles + Next.js typegen**

Run: `npx next typegen && npx tsc --noEmit`
Expected: types regenerated for the new route, no tsc errors. The deleted `/qualified` route should drop out of `.next/dev/types`.

- [ ] **Step 4: Commit**

```bash
git add app/partner-with-us/
git commit -m "feat(partner): rename /qualified -> /book with StepTwoBooking"
```

---

## Task 5: Create the /booked Congrats page

**Files:**
- Create: `app/partner-with-us/booked/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "You're Booked — JAZA Media",
  // Transient confirmation page. Not useful in search results and would
  // surface as "Congrats you're booked" if indexed.
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:py-24">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
        Congrats — you&apos;re{' '}
        <em className="font-black text-brand-yellow italic">booked</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-neutral-700 md:text-base">
        Check your inbox for the calendar invite. We&apos;ll see you on the
        call.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500 md:text-base">
        A member of our team will reach out before the call to confirm the
        agenda.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-bold tracking-wider text-brand-black uppercase transition-transform hover:scale-[1.02]"
      >
        Back to Home
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles + typegen**

Run: `npx next typegen && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/partner-with-us/booked/page.tsx
git commit -m "feat(partner): add /booked Congrats confirmation page"
```

---

## Task 6: Verify with Playwright — full qualified path lands on /book

**Files:**
- None modified.

The dev server should already be running on `:3000`. If not, start it: `npm run dev` (background).

- [ ] **Step 1: Pre-seed answers to fast-path past the funnel**

Use `mcp__plugin_playwright_playwright__browser_navigate` to `http://localhost:3000/partner-with-us`.

Then use `mcp__plugin_playwright_playwright__browser_evaluate` to set sessionStorage with a complete qualified payload:

```js
() => {
  sessionStorage.setItem('partner-with-us:answers', JSON.stringify({
    location: 'philippines',
    fullName: 'Test User',
    businessType: 'service',
    description: 'Test booking flow.',
    helpType: 'web_dev',
    monthlyRevenue: '150k_500k',
    willingToInvest: 'yes',
    budget: '150k_200k',
    challenge: 'Test booking flow integration.',
    timeline: 'asap',
    phone: '+63 917 111 1111',
    email: 'booking-test@example.com',
  }));
  return 'set';
}
```

Navigate to `?step=12`, then submit:

```js
() => { document.querySelector('form')?.requestSubmit(); return 'sent'; }
```

Expected: URL becomes `http://localhost:3000/partner-with-us/book`.

- [ ] **Step 2: Verify the page chrome**

Run `mcp__plugin_playwright_playwright__browser_snapshot` and confirm:
- Heading: `NEXT, PLEASE BOOK YOUR CALL USING THE CALENDAR BELOW.`
- Subtitle: `Here's how you'll hear from us.`
- A `STEP 2` badge above the heading.

- [ ] **Step 3: Wait for the Calendly iframe to mount, then verify URL params**

Wait for the iframe to appear instead of a hardcoded sleep — flake-resistant on slow CI and can't pass vacuously on a fast machine:

Use `mcp__plugin_playwright_playwright__browser_wait_for` with `text` or use `mcp__plugin_playwright_playwright__browser_evaluate` with a polling loop:

```js
() => new Promise((resolve, reject) => {
  const start = Date.now();
  function poll() {
    const iframe = document.querySelector('iframe[src*="calendly.com"]');
    if (iframe) {
      resolve({ iframePresent: true, src: iframe.getAttribute('src') });
      return;
    }
    if (Date.now() - start > 10_000) {
      resolve({ iframePresent: false, src: null });
      return;
    }
    setTimeout(poll, 100);
  }
  poll();
})
```

Expected:
- `iframePresent: true`
- `src` contains all of:
  - `calendly.com/jazamediaph/discovery-call`
  - `primary_color=181818`
  - `hide_gdpr_banner=1`
  - `name=Test+User` or `name=Test%20User`
  - `email=booking-test%40example.com`
  - `a1=` (the encoded phone)
  - `a2=` (the encoded description)

- [ ] **Step 4: Verify prefill blob was written by the funnel**

```js
() => sessionStorage.getItem('partner-with-us:booking-prefill')
```

Expected: a JSON string containing `fullName`, `email`, `phone`, `description` (the four fields written by `writePrefill`).

---

## Task 7: Verify with Playwright — simulated booking event + edge cases

**Files:**
- None modified.

Calendly's iframe is third-party. We can't book through it in a test, and we can't forge a `MessageEvent` origin (non-configurable on modern Chromium). The component installs a dev-only `window.__partnerHandleScheduled` hook (see Task 3 message-listener effect) that routes through the same `clearPrefill + router.push` path the real handler uses, bypassing the origin check for tests.

- [ ] **Step 1: Verify the test hook is installed**

We're still on `/partner-with-us/book` from Task 6.

```js
() => typeof (window as { __partnerHandleScheduled?: () => void })
  .__partnerHandleScheduled === 'function'
```

Expected: `true`. If `false`, the dev hook didn't install — re-check Task 3's listener effect.

- [ ] **Step 2: Trigger the scheduled handler and verify routing to /booked**

```js
() => new Promise((r) => {
  const w = window as { __partnerHandleScheduled?: () => void };
  w.__partnerHandleScheduled?.();
  setTimeout(() => r(location.href), 500);
})
```

Expected: `http://localhost:3000/partner-with-us/booked`.

- [ ] **Step 3: Verify /booked renders the Congrats screen**

Run `mcp__plugin_playwright_playwright__browser_snapshot` and confirm:
- Heading: `Congrats — you're booked.`
- "booked" wrapped in an emphasis element (italic yellow per the brand).
- Body: `Check your inbox for the calendar invite. We'll see you on the call.`
- Secondary line: `A member of our team will reach out before the call to confirm the agenda.`
- A "Back to Home" link pointing to `/`.

- [ ] **Step 4: Verify prefill blob was cleared on the booking event**

```js
() => sessionStorage.getItem('partner-with-us:booking-prefill')
```

Expected: `null`.

- [ ] **Step 5: Verify the not-qualified path still works AND does not write the prefill blob**

Reset:
```js
() => { sessionStorage.clear(); return 'cleared'; }
```

Navigate to `/partner-with-us`, set up answers with a disqualifier:
```js
() => {
  sessionStorage.setItem('partner-with-us:answers', JSON.stringify({
    location: 'philippines', fullName: 'Test', businessType: 'service',
    description: 'Test not-qualified path.', helpType: 'web_dev',
    monthlyRevenue: '0', willingToInvest: 'yes', budget: '150k_200k',
    challenge: 'Test.', timeline: 'asap',
    phone: '+63 917 111 1111', email: 'nq-test@example.com',
  }));
  return 'set';
}
```

Navigate to `?step=12`, submit. Expected: URL becomes `/partner-with-us/not-qualified`.

After landing on /not-qualified, verify the prefill blob was NOT written:

```js
() => sessionStorage.getItem('partner-with-us:booking-prefill')
```

Expected: `null`. (Only the qualified branch calls `writePrefill`.)

- [ ] **Step 6: Verify direct entry to /book has no prefill in the iframe URL**

Reset:
```js
() => { sessionStorage.clear(); return 'cleared'; }
```

Navigate directly to `http://localhost:3000/partner-with-us/book` (no funnel walk-through). Wait for the iframe to mount and inspect its src:

```js
() => new Promise((r) => {
  const start = Date.now();
  function poll() {
    const iframe = document.querySelector('iframe[src*="calendly.com"]');
    if (iframe) {
      const src = iframe.getAttribute('src') ?? '';
      const url = new URL(src);
      r({
        hasName: url.searchParams.has('name'),
        hasEmail: url.searchParams.has('email'),
        hasA1: url.searchParams.has('a1'),
        hasA2: url.searchParams.has('a2'),
      });
      return;
    }
    if (Date.now() - start > 10_000) {
      r({ timedOut: true });
      return;
    }
    setTimeout(poll, 100);
  }
  poll();
})
```

Expected: all four flags `false`. Direct entry shouldn't pre-populate any field.

- [ ] **Step 2: Verify /booked renders the Congrats screen**

Run `mcp__plugin_playwright_playwright__browser_snapshot` and confirm:
- Heading: `Congrats — you're booked.`
- "booked" wrapped in an emphasis element (italic yellow per the brand).
- Body: `Check your inbox for the calendar invite. We'll see you on the call.`
- A "Back to Home" link pointing to `/`.

- [ ] **Step 3: Verify prefill blob was cleared on the booking event**

```js
() => sessionStorage.getItem('partner-with-us:booking-prefill')
```

Expected: `null`.

- [ ] **Step 4: Verify the not-qualified path still works**

Reset:
```js
() => { sessionStorage.clear(); return 'cleared'; }
```

Navigate to `/partner-with-us`, set up answers with a disqualifier:
```js
() => {
  sessionStorage.setItem('partner-with-us:answers', JSON.stringify({
    location: 'philippines', fullName: 'Test', businessType: 'service',
    description: 'Test not-qualified path.', helpType: 'web_dev',
    monthlyRevenue: '0', willingToInvest: 'yes', budget: '150k_200k',
    challenge: 'Test.', timeline: 'asap',
    phone: '+63 917 111 1111', email: 'nq-test@example.com',
  }));
  return 'set';
}
```

Navigate to `?step=12`, submit. Expected: URL becomes `/partner-with-us/not-qualified`. The qualified-path change in Task 2 must not affect not-qualified routing.

---

## Task 8: Production build + lint + redirect regression check

**Files:**
- None modified.

- [ ] **Step 0: Check next.config for any redirect referencing /qualified**

Before deleting the route in Task 4, verify nothing on the server side maps `/partner-with-us/qualified` to a meaningful response — otherwise the deletion silently 404s anyone with that URL bookmarked.

```bash
grep -rn "partner-with-us/qualified" next.config.* vercel.json public/ 2>/dev/null || echo "no matches"
```

Expected: `no matches`. If anything turns up, decide whether to add a `redirects()` entry mapping `/partner-with-us/qualified` to `/partner-with-us/book` rather than hard-deleting the route.

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: clean compile, no errors. The output should now list:
```
├ ○ /partner-with-us
├ ○ /partner-with-us/book
├ ○ /partner-with-us/booked
└ ○ /partner-with-us/not-qualified
```

`/partner-with-us/qualified` must not appear (it was deleted in Task 4).

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors and no new warnings.

If lint surfaces `react/no-unescaped-entities` errors on the apostrophes in the new pages, escape them with `&apos;` (the project convention; matches `footer.tsx`).

---

## Task 9: Hard-gate the Calendly setup task in README + cleanup

The plan's spec acknowledged the Calendly Invitee-Questions setup, but it was buried. If the user forgets to add those two questions in Calendly, the discovery-call team gets only name + email — phone and business context silently no-op. That's a real operational risk. Surface it in `README.md` so it's the first thing a deploy notices.

**Files:**
- Modify: `README.md` — add a "Partner With Us — booking setup" section.
- Delete (if present): `.playwright-mcp/`

- [ ] **Step 1: Add the README section**

Append to `README.md` (or insert after the existing "Getting Started" section):

```markdown
## Partner With Us — booking setup (REQUIRED before deploy)

The Step 2 booking page (`/partner-with-us/book`) embeds Calendly via the
URL set by `NEXT_PUBLIC_CALENDLY_URL`. Two manual setup steps are required
in the Calendly account that owns this URL — without them, the embed
still works but the team arrives at every discovery call without the
lead's phone number or business context:

### 1. Add two Invitee Questions to the Calendly event

In the Calendly event's "Booking page" → "Invitee Questions" settings,
add **in this order**:

1. "Best contact number" — text type
2. "Tell us about your business" — long text type

Order matters: the booking page passes them as `a1` and `a2` URL params,
which Calendly maps positionally to the additional-question list.

### 2. Set the env var

Local: `cp .env.example .env.local` (the example contains the production
URL as a sane default).

Vercel: set `NEXT_PUBLIC_CALENDLY_URL` in Project Settings → Environment
Variables for Production + Preview environments. The component falls
back to a hardcoded URL if the env var is missing, but configuring it
explicitly lets you swap URLs without a redeploy.
```

- [ ] **Step 2: Remove session artifacts**

```bash
rm -rf .playwright-mcp
git status --short
```

Confirm only intended changes appear.

- [ ] **Step 3: Surface the setup gate in the final commit / summary**

Final commit message and end-of-execution summary to the user must repeat the gate explicitly. Don't trust that the README reads itself.

---

## Self-review checklist (verified before handoff)

**Spec coverage:**

| Spec section | Implemented in |
|---|---|
| Routes (`/book`, `/booked`, `/not-qualified` unchanged) | Tasks 4 + 5 |
| Data flow (qualify → writePrefill → /book → calendly event → clearPrefill → /booked) | Tasks 2 + 3 |
| `step-two-booking.tsx` client component | Task 3 |
| Visual treatment of /book (STEP 2 badge, heading, subtitle, no disclaimer) | Task 3 |
| Visual treatment of /booked (logo, italic-yellow "booked", body, CTA) | Task 5 |
| Calendly URL params (primary_color, hide_gdpr_banner, prefill) | Task 3 |
| `eventScheduled` listener → router.push('/booked') | Task 3 |
| `lib/partner/booking-prefill.ts` (writePrefill, readPrefill, clearPrefill) | Task 1 |
| NEXT_PUBLIC_CALENDLY_URL env var | Task 1 + Task 9 Step 3 |
| Calendly Invitee Questions setup task surfaced to user | Task 9 Step 2 |
| Edge case: direct /book entry with empty prefill | Task 3 (prefill keys absent → URL params absent → Calendly renders empty form) |
| Edge case: /booked refresh | Task 5 (page is fully static) |
| Accessibility: focus on heading on mount | Task 3 |

**Type consistency:**
- `BookingPrefill` defined in Task 1; used (read/write) in Tasks 2 + 3.
- `Answers` reused from existing `lib/partner/questions.ts`.
- All function names (`writePrefill`, `readPrefill`, `clearPrefill`) used consistently across tasks.

**Placeholders:** none — every step has runnable code, an exact command, or a concrete user/tool action.

**Files inventory (final):**

```
Added:
  .env.example
  types/calendly.d.ts
  lib/partner/booking-prefill.ts
  components/partner/step-two-booking.tsx
  app/partner-with-us/book/page.tsx
  app/partner-with-us/booked/page.tsx

Removed:
  app/partner-with-us/qualified/page.tsx (and the now-empty qualified/ dir)

Modified:
  components/partner/qualification-funnel.tsx (write prefill + /qualified -> /book)
  README.md (Partner With Us — booking setup section)
```

No `package.json` changes, no new npm dependencies.
