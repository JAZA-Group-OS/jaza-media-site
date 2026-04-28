# Partner With Us — Step 2 Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/partner-with-us/qualified` with a Calendly-embedded booking page (`/partner-with-us/book`), and add a `/partner-with-us/booked` Congrats confirmation that the embed routes to on successful booking.

**Architecture:** Calendly's official inline-widget script (`https://assets.calendly.com/assets/external/widget.js`) is loaded via `next/script` and renders into a div with the URL passed by data attribute. We listen for the `calendly.event_scheduled` `postMessage` event to detect successful bookings and `router.push` to `/booked`. Qualification answers are mirrored from the funnel's sessionStorage into a separate prefill blob so they can be auto-populated into Calendly's form via URL query params.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, Tailwind v4. **No new dependencies** — using the vanilla Calendly embed instead of the `react-calendly` npm package mentioned in the spec, because:
- `react-calendly` v4.x has React 16–18 peer-dep ranges; installing under React 19 needs `--legacy-peer-deps` and the maintainership status is unclear.
- The vanilla integration is ~25 lines for the embed + listener; less surface area than learning a wrapper library's prop conventions.
- End-user experience and prefill capability are identical.

If a future upgrade wants `react-calendly`, it's a swap of one component file. The data flow (sessionStorage prefill, postMessage event) doesn't change.

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

export type BookingPrefill = {
  fullName?: string;
  email?: string;
  phone?: string;
  description?: string;
};

export function writePrefill(answers: Answers) {
  if (typeof window === 'undefined') return;
  const prefill: BookingPrefill = {
    fullName: answers.fullName,
    email: answers.email,
    phone: answers.phone,
    description: answers.description,
  };
  try {
    window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    // private mode — silently no-op; user retypes in Calendly
  }
}

export function readPrefill(): BookingPrefill {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(PREFILL_KEY);
    return raw ? (JSON.parse(raw) as BookingPrefill) : {};
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
- Create: `components/partner/step-two-booking.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { readPrefill, clearPrefill } from '@/lib/partner/booking-prefill';

const FALLBACK_CALENDLY_URL =
  'https://calendly.com/jazamediaph/discovery-call';

// Calendly's official postMessage event for a successful booking.
const SCHEDULED_EVENT = 'calendly.event_scheduled';

// Window augmentation for Calendly's globally-injected helper. Defined locally
// to avoid leaking into other modules.
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

function isCalendlyEvent(e: MessageEvent): boolean {
  return (
    e.origin === 'https://calendly.com' &&
    typeof e.data === 'object' &&
    e.data !== null &&
    typeof (e.data as { event?: unknown }).event === 'string' &&
    ((e.data as { event: string }).event as string).startsWith('calendly.')
  );
}

function buildCalendlyUrl(base: string): string {
  // Compose URL params: brand color + hide the GDPR banner (the funnel's own
  // disclaimer covers consent for our PH/AU audience) + prefill from the
  // qualification answers if present.
  const url = new URL(base);
  url.searchParams.set('primary_color', '181818');
  url.searchParams.set('hide_gdpr_banner', '1');

  const prefill = readPrefill();
  if (prefill.fullName) url.searchParams.set('name', prefill.fullName);
  if (prefill.email) url.searchParams.set('email', prefill.email);
  // Calendly indexes additional invitee questions as a1, a2, ... in URL
  // params. The user must add these in the Calendly event settings; if they
  // are missing, Calendly silently ignores the params.
  if (prefill.phone) url.searchParams.set('a1', prefill.phone);
  if (prefill.description) url.searchParams.set('a2', prefill.description);

  return url.toString();
}

export function StepTwoBooking() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Build the URL once on mount. Memoizing avoids re-reading sessionStorage
  // on every render.
  const calendlyUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_CALENDLY_URL ?? FALLBACK_CALENDLY_URL;
    return buildCalendlyUrl(base);
  }, []);

  // Move focus to the heading on mount for keyboard / screen-reader users.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Initialize Calendly inline widget when both the container and the script
  // are ready. Two entry paths:
  //  - First page load: script loads via <Script>, onLoad flips scriptLoaded,
  //    this effect re-runs and inits the widget.
  //  - SPA navigation back to /book: <Script> is a no-op (browser cached the
  //    asset), but window.Calendly already exists from the prior load, so
  //    the immediate-init branch fires on mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === 'undefined' || !window.Calendly) return;
    // Clear any previous render so SPA-navigation re-mounts get a clean slate.
    container.innerHTML = '';
    window.Calendly.initInlineWidget({
      url: calendlyUrl,
      parentElement: container,
    });
  }, [scriptLoaded, calendlyUrl]);

  // Listen for Calendly's "event scheduled" postMessage to detect a
  // successful booking, then route to /booked.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!isCalendlyEvent(e)) return;
      if ((e.data as { event: string }).event !== SCHEDULED_EVENT) return;
      clearPrefill();
      router.push('/partner-with-us/booked');
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
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
          Here&apos;s how you&apos;ll hear from us.
        </p>
      </div>

      <div
        ref={containerRef}
        className="mt-10"
        style={{ minWidth: '320px', height: '700px' }}
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

- [ ] **Step 3: Verify Calendly iframe mounts with correct URL params**

Use `mcp__plugin_playwright_playwright__browser_evaluate`:

```js
() => new Promise((r) => setTimeout(() => {
  const iframe = document.querySelector('iframe[src*="calendly.com"]');
  const src = iframe?.getAttribute('src') ?? null;
  return r({ iframePresent: !!iframe, src });
}, 3000))
```

Expected:
- `iframePresent: true` (after the Calendly script loads — the 3s wait gives it time)
- `src` contains:
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

## Task 7: Verify with Playwright — simulated booking event lands on /booked

**Files:**
- None modified.

Calendly's iframe is third-party — we can't actually book through it in a test. Simulate the postMessage event directly to verify our listener wiring.

- [ ] **Step 1: Dispatch the event_scheduled postMessage**

We're still on `/partner-with-us/book` from Task 6. The listener checks `e.origin === 'https://calendly.com'`, which we can't fake from the page context (browsers set origin from the actual sender). Instead, dispatch from inside the Calendly iframe — but the iframe is sandboxed. Easiest verification: temporarily relax the origin check in dev for the verification step, OR dispatch to the window with a synthetic event object.

The simplest reliable verification: open the page and use `Object.defineProperty` on a `MessageEvent` to spoof origin:

```js
() => {
  const e = new MessageEvent('message', {
    data: { event: 'calendly.event_scheduled' },
  });
  Object.defineProperty(e, 'origin', { value: 'https://calendly.com' });
  window.dispatchEvent(e);
  return new Promise((r) => setTimeout(() => r(location.href), 500));
}
```

Expected: URL becomes `http://localhost:3000/partner-with-us/booked`.

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

## Task 8: Production build + lint check

**Files:**
- None modified.

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

## Task 9: Cleanup Playwright artifacts + final state

**Files:**
- Delete (if present): `.playwright-mcp/`

- [ ] **Step 1: Remove session artifacts**

```bash
rm -rf .playwright-mcp
git status --short
```

Confirm only intended changes appear in the status.

- [ ] **Step 2: Verify the Calendly setup task is communicated to the user**

The plan's spec already documented this, but the executing engineer must surface it in the final commit/summary message:

> **Action required by the user:** in your Calendly event's "Booking page" → "Invitee Questions" settings, add two questions: **(1) "Best contact number" (text), (2) "Tell us about your business" (long text)**. Without these, Calendly will still book correctly using the default name + email fields; only the phone/description prefill silently no-ops.

- [ ] **Step 3: Set NEXT_PUBLIC_CALENDLY_URL in Vercel**

Production deployment step (not code): add the env var in Vercel project settings → Environment Variables. Without it, the page falls back to the hardcoded `FALLBACK_CALENDLY_URL` in `step-two-booking.tsx`, which is also `https://calendly.com/jazamediaph/discovery-call`. The fallback exists so a missing env var doesn't break the page; the env var exists so you can swap URLs without a redeploy.

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
  lib/partner/booking-prefill.ts
  components/partner/step-two-booking.tsx
  app/partner-with-us/book/page.tsx
  app/partner-with-us/booked/page.tsx

Removed:
  app/partner-with-us/qualified/page.tsx (and the now-empty qualified/ dir)

Modified:
  components/partner/qualification-funnel.tsx (write prefill + /qualified -> /book)
```

No `package.json` changes, no new npm dependencies.
