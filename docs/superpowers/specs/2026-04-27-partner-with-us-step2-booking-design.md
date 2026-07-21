# Partner With Us — Step 2 Booking

**Status:** Design approved (awaiting written-spec review)
**Date:** 2026-04-27
**Owner:** jaza.intern@gmail.com

## Goal

Replace the placeholder `/qualified` thank-you page with a Calendly-embedded booking step. Qualified users from the 12-step qualification funnel land here, pick a time on the JAZA Media discovery-call calendar, fill in their details (pre-filled from qualification answers), and on successful booking are routed to a Congrats confirmation screen.

## Non-goals

- No custom calendar widget. Calendly's inline embed handles the calendar grid, time slots, time zone selection, details form, and confirmation email.
- No JAZA-side database of bookings. Calendly is the source of truth; team confirmations come via Calendly's notifications.
- No payment integration. Discovery calls are free.
- No multi-event-type selection. Single fixed event: the `discovery-call` URL.

## Routes

```
app/partner-with-us/
  book/page.tsx              ← Step 2 booking page (replaces qualified/page.tsx)
  booked/page.tsx            ← Congrats confirmation (new)
  not-qualified/page.tsx     ← unchanged
```

`qualified/` is deleted in this change. `qualification-funnel.tsx` updates its qualified outcome target from `/partner-with-us/qualified` to `/partner-with-us/book` — one line.

## Data flow

1. User completes 12-step funnel → `qualify(answers)` returns `'qualified'`.
2. `qualification-funnel.tsx` reads the answers from sessionStorage, stashes them under a new key `partner-with-us:booking-prefill`, then routes to `/partner-with-us/book`. The original `partner-with-us:answers` storage is cleared on the funnel side as before.
3. `/book` page reads the prefill blob, passes name + email + phone + description through to `react-calendly`'s `prefill` and `utm` props.
4. User picks a time and confirms. Calendly fires its `eventScheduled` postMessage event.
5. `react-calendly`'s `onEventScheduled` callback fires. We clear the prefill blob and `router.push('/partner-with-us/booked')`.
6. Calendly sends the user a calendar invite + Google Meet link by email. JAZA's Calendly account also gets the booking.

## Components

```
components/partner/
  step-two-booking.tsx       ← "use client", reads prefill, renders header + InlineWidget,
                               handles onEventScheduled, routes to /booked.
```

The `/book` and `/booked` page files are server components for metadata; `step-two-booking.tsx` is the only new client component.

## Visual treatment

**`/book` page (matches Image #11):**
- Page chrome shared by the existing `app/partner-with-us/layout.tsx` (Navbar + Footer + CopyrightBar).
- Yellow `STEP 2` pill — same `bg-brand-yellow text-brand-black rounded-md px-5 py-1.5 font-heading text-sm font-black uppercase` styling as the funnel's STEP badge.
- Heading: **"NEXT, PLEASE BOOK YOUR CALL USING THE CALENDAR BELOW."** in `font-heading text-3xl md:text-5xl font-black tracking-tight text-brand-black`. No italic/yellow word — different from the funnel's `WE *SCALE* GREAT COMPANIES` heading.
- Subtitle (smaller, neutral): **"Here's how you'll hear from us."** in `text-base md:text-lg text-neutral-700 mt-3`.
- Calendly `InlineWidget` below, full width on mobile, capped to `max-w-5xl` on desktop, `min-h-[700px]` so the Calendly UI has room to breathe.
- No disclaimer paragraph (Image #11 doesn't show one — Calendly handles its own GDPR + booking-policy UI).

**`/booked` page (Image #13 with corrected copy):**
- Page chrome from layout.
- Centered: JAZA logo block (font-display "JAZA" + "MEDIA"), reused from the qualified/not-qualified pattern.
- Heading: **"Congrats — you&apos;re *booked*."** with `booked` wrapped in `<em class="font-black text-brand-yellow italic">`.
- Body: **"Check your inbox for the calendar invite. We&apos;ll see you on the call."** in `text-sm md:text-base text-neutral-700`.
- CTA: **"Back to Home"** as a yellow pill button linking to `/`, same style as the existing qualified-page CTA.

## Calendly integration

**Package:** `react-calendly` (latest). Tree-shakeable; we only import `InlineWidget`.

**Props:**

```tsx
<InlineWidget
  url={`${calendlyUrl}?primary_color=181818&hide_gdpr_banner=1`}
  prefill={{
    name: prefill.fullName,
    email: prefill.email,
    customAnswers: {
      a1: prefill.phone,
      a2: prefill.description,
    },
  }}
  styles={{ height: '700px' }}
/>
```

The `customAnswers` keys (`a1`, `a2`) match Calendly's "additional questions" indexing — JAZA's Calendly event needs an "Additional Question" for phone (`a1`) and one for "Tell us about your business" (`a2`) wired in the Calendly UI for these to populate.

**Setup task for the user (one-time, not code):** in the Calendly event's "Booking page" → "Invitee Questions" settings, add two questions in this order: (1) "Best contact number" (text), (2) "Tell us about your business" (long text). Without these, Calendly will still book correctly using the default name + email fields; the phone/description prefill is a UX nicety that silently no-ops if the questions don't exist.

**Brand color:** `primary_color=181818` (brand black). Calendly uses it for the selected-day fill, the time-slot button background, and the Schedule Meeting button.

**GDPR banner:** hidden via the URL param since the funnel's own consent disclaimer already covers contact consent for Philippine + Australian leads.

**Event listening:**

```tsx
<InlineWidget
  ...
  pageSettings={{ ... }}
  onEventScheduled={() => {
    clearPrefill();
    router.push('/partner-with-us/booked');
  }}
/>
```

`react-calendly` exposes a typed callback API; no manual `window.addEventListener('message', ...)` needed.

## Pre-fill flow

The qualification-funnel currently calls `clearAnswers()` before routing on submit. We add a tiny extra step: copy the relevant fields into a prefill blob first.

In `lib/partner/booking-prefill.ts` (new):

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

`qualification-funnel.tsx` calls `writePrefill(answers)` before `clearAnswers()` on the qualified branch. `step-two-booking.tsx` calls `readPrefill()` once on mount and passes the result into `InlineWidget`. `clearPrefill()` is called in the `onEventScheduled` handler.

## Configuration

`.env.example` (committed):

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/jazamediaph/discovery-call
```

`.env.local` (gitignored, already in .gitignore via `.env*`) carries the same value for dev. Vercel project settings carry it for prod.

`step-two-booking.tsx` reads `process.env.NEXT_PUBLIC_CALENDLY_URL` at build time. If unset, it falls back to the production URL hard-coded as a safe default — degraded experience without the env var, but still works.

## Edge cases

- **Direct entry to `/book` without going through funnel:** prefill blob is empty. Calendly renders with empty fields. User retypes manually. No error, just a worse UX.
- **Stale prefill from a prior session:** prefill is overwritten on every qualified outcome and cleared on successful booking. If a user qualifies, abandons before booking, and someone else uses the same browser, the second user could see the first user's name pre-filled in Calendly. Best-effort; user edits the field if wrong. Not a security issue (no PII visible to the new user beyond what Calendly's form would expose anyway).
- **Calendly script blocked (ad-blockers, restrictive CSPs):** `InlineWidget` shows its own loading state indefinitely. Acceptable degraded behavior; we can add a "Trouble loading? Email us at …" fallback in a follow-up.
- **User books, then refreshes `/booked`:** the page is fully static — no state, no problem. They can re-navigate to `/` via the CTA.
- **User books, then navigates back to `/book`:** prefill was cleared by `onEventScheduled`. Calendly shows fresh empty form. User could double-book in theory; Calendly itself handles deduplication on its side.
- **iOS Safari restrictions:** Calendly's iframe handles its own keyboard/scroll behavior. Tested under their own QA — not our problem to solve.

## Accessibility

- The STEP 2 chrome above the embed is plain semantic HTML (`<h1>`, `<p>`); same patterns as the funnel header.
- The Calendly iframe carries its own a11y. `react-calendly` doesn't override anything that would break it.
- Focus management on `/booked` mount: focus the heading via a `tabIndex={-1} ref` + `useEffect`, same pattern we landed on for the funnel.

## Review gate

Per user's standing preference (memory: noxadevteam review gate): both pre-impl review on this spec + plan, AND post-impl review on the actual code.
