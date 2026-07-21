# Careers Page — Design Spec

**Date:** 2026-04-29
**Status:** Approved (pending implementation)
**Author:** Claude (paired with @OmharRegidor)

## Goal

Build a public `/careers` landing page that recruits "world-record breaking team" candidates. Three stacked sections: a hero with primary CTA, a values grid that articulates the kind of teammate JAZA Media wants, and a closing "How we work TOGETHER" section showcasing the team. Wire the existing navbar (desktop + mobile) Careers link to the new route.

## Scope

**In scope**
- New static page at `/careers` composed of three new section components
- Three new components in `components/`: `careers-hero.tsx`, `careers-values.tsx`, `careers-together.tsx`
- Image placeholders (shimmer style, matching `featured-yellow-card.tsx`) for every visual slot — no real imagery yet
- Wire the desktop `Navbar` and `MobileMenu` "Careers" links from `href: "#"` to `href: "/careers"`
- `useInView` fade-up animations consistent with `about-hero.tsx`

**Out of scope (placeholder only, follow-up work)**
- Real photos — user will swap placeholders for actual images later
- Job listings: the "View Job Openings" buttons anchor to `#openings`, which lands on Section 3 for now. A real openings list will be added in a follow-up.
- Application form / "Apply" flow
- CMS integration / dynamic content (all copy is hard-coded from the mockup)
- "Support" nav link (still `#`, unrelated)

## Route

| Route       | File                  | Notes                                              |
|-------------|-----------------------|----------------------------------------------------|
| `/careers`  | `app/careers/page.tsx`| Static. Mirrors the structure of `app/about-us/page.tsx`. |

## Page composition

`app/careers/page.tsx`:

```tsx
<AnnouncementBanner />
<Navbar />
<main>
  <CareersHero />
  <CareersValues />
  <CareersTogether />
</main>
<Footer />
<CopyrightBar />
```

`metadata` exports `title: "Careers — JAZA Media"` and a one-line description.

## Section 1 — `components/careers-hero.tsx`

- Background: white. Container `max-w-5xl mx-auto px-4`, vertical padding `py-12 md:py-16`.
- Two-column on `lg:`, single column stacked on smaller breakpoints.
- **Left column (text):**
  - H1: `Join a [world-record] breaking team!`
    - "world-record" wrapped in a `<span>` with `bg-brand-yellow` highlight + black `underline decoration-2 underline-offset-4` (matches the mockup's underlined yellow word)
    - Same font ramp as `about-hero.tsx` H1 (`font-heading`, `text-[32px] md:text-[40px] lg:text-5xl xl:text-[56px]`, bold)
  - Subhead paragraph: "We're seeking teammates who lead with trust, work with discipline, and play to win as a team."
  - CTA: yellow pill button, label **"View Job Openings"**, href `#openings`. Reusable inline button (rounded-full, `bg-brand-yellow`, `text-brand-black`, `font-heading font-bold`, hover darken).
- **Right column (image placeholder):**
  - Landscape ratio (`aspect-[4/3]` on mobile, fills column on `lg:`)
  - Shimmer style same as `featured-yellow-card.tsx`'s `ImagePlaceholder` (white border + animated shimmer)
- Animations: `useInView` fade-up on headline, subhead+CTA, image — staggered 0/120/200ms.

## Section 2 — `components/careers-values.tsx`

- Background: light grey (`bg-neutral-100`). Container `max-w-5xl mx-auto px-4`, padding `py-12 md:py-16`.
- **Heading block (centered, max-w-3xl):**
  - H2: `We want disciplined team players who trust and [win together.]`
    - "win together." wrapped in a `<span>` with `underline decoration-2 underline-offset-4`. No yellow highlight (per mockup).
    - `font-heading text-[26px] md:text-3xl lg:text-[34px]` bold, black.
  - Intro paragraph (verbatim from mockup):
    > "At JAZA Media you'll help entrepreneurs build real businesses with strong foundations, scalable systems, and lasting impact. Our mission is straightforward: make real world business scaling program accessible to everyone. We set a high bar, move with urgency, and measure ourselves by results. If you want to create — and work with a team that plays to win — you'll fit right in."
- **3×2 grid** (`grid-cols-1 md:grid-cols-2`, gap-4 md:gap-6, mt-10):
  Cells in document order:

  | # | Cell type | Content |
  |---|-----------|---------|
  | 1 | Image     | Shimmer placeholder, `aspect-[4/3]`, rounded |
  | 2 | Text card | **You build with the long game in mind.** / "You're not here for shortcuts. You care about creating businesses that compound over years, not months." / "That means focusing on fundamentals, building systems that scale, and making decisions that stand the test of time." |
  | 3 | Text card | **You hold a high standard.** / "Excellence isn't optional." / "You take ownership, sweat the details, and deliver work you're proud of." / "More than that, you raise the bar for the people around you, because you know high standards pull the whole team forward." |
  | 4 | Image     | Shimmer placeholder |
  | 5 | Image     | Shimmer placeholder |
  | 6 | Text card | **You value people over hype.** / "You know real businesses aren't built on trends or noise…" / "They're built on trust. You invest in relationships, lead with integrity, and focus on what drives lasting results for founders, teams, and customers." |

  - Text cards: `bg-white rounded-md p-5 md:p-6 shadow-sm`. Title `font-heading font-bold text-base md:text-lg`. Body `text-sm md:text-[15px] leading-relaxed`. Vertically centered within the cell (`flex flex-col justify-center`).
  - Image cells share the shimmer placeholder component (extract to a small local helper or reuse `featured-yellow-card`'s if convenient — see Implementation notes).
- **CTA below grid (centered, mt-10):** yellow pill "View Job Openings" → `#openings`.
- Animations: each grid cell fades up with staggered delays (e.g. 60ms × index).

## Section 3 — `components/careers-together.tsx`

- Background: white. Container `max-w-5xl mx-auto px-4`, padding `py-12 md:py-16`.
- The section's outer wrapper carries `id="openings"` so both "View Job Openings" buttons scroll here.
- **Heading box (centered):**
  - H2: `How we work TOGETHER!`
  - Wrapped in a violet/purple bordered box: `border-2 border-violet-600 rounded-md px-6 py-3 inline-block`. Heading itself stays `font-heading font-bold` black text (matches mockup — violet is just the rectangle outline).
- **Below heading: full-width image placeholder**
  - `aspect-[16/9]` (or close), `rounded-md`, shimmer fill.
  - Same shimmer style as elsewhere.
- Animations: heading fades up first, image fades up second.

## Navigation wiring

Edit `components/navbar.tsx` and `components/mobile-menu.tsx`:

```ts
{ label: "Careers", href: "/careers" }
```

(was `"#"` in both files). No other nav changes.

## Conventions reused

- `font-heading`, `font-display`, `text-brand-black`, `bg-brand-yellow` — existing brand tokens.
- `useInView` hook from `@/lib/use-in-view` — same pattern as `about-hero.tsx` / `featured-yellow-card.tsx`.
- `animate-about-fade-up`, `animate-about-shimmer` — already defined in `globals.css`/Tailwind config; reuse.
- Container width `max-w-5xl px-4` — matches the rest of the marketing pages.
- Section components are client components (`"use client"`) because of `useInView`.

## Implementation notes

- **Image placeholder extraction:** rather than duplicate the shimmer placeholder across three new files, factor it into a tiny shared helper — e.g., a local `ShimmerPlaceholder` in each component is fine, or lift one into `components/ui/shimmer-placeholder.tsx` if the pattern repeats outside this PR. Default: keep it local to careers components for now to avoid premature abstraction; revisit if a fourth caller appears.
- **Yellow CTA button:** there's no shared "yellow pill" component yet (about-the-firm uses one inline). Mirror the existing inline pattern; do not introduce a new shared component.
- **Highlighted heading words:** prior pages use both `<mark>` (about-hero.tsx) and inline `<span>` styling. Use a `<span>` with explicit Tailwind classes for consistency with how the mockup renders ("world-record" yellow + underline; "win together." underline only).
- **Anchor jump behavior:** `#openings` will jump-scroll by default. Smooth scrolling is already enabled site-wide via `scroll-behavior: smooth` if present in `globals.css` — verify; if not, no extra work needed (jump-to is acceptable).

## Acceptance criteria

- Visiting `/careers` renders all three sections in order, with placeholder shimmer panels where the user will later drop images.
- Both "View Job Openings" buttons scroll to Section 3 (the `#openings` anchor).
- The desktop navbar's "Careers" link and the mobile menu's "Careers" link both navigate to `/careers`.
- Page is responsive: mobile (single column), tablet/desktop (two columns where designed).
- No TypeScript or build errors; Next.js dev server compiles without warnings.
- Matches the supplied mockups for layout, copy, and the highlighted-word treatment.

## Risks / open items

- The "openings" anchor lands on the wrong section visually until a real openings list is added — acceptable as a placeholder; user agreed.
- Real images (hero team photo, three values photos, group photo) are pending from the user. Placeholders are deliberately neutral so they're easy to swap.
