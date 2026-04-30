# Careers Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static `/careers` landing page with three stacked sections (hero, values grid, "How we work TOGETHER") plus wire the existing navbar Careers link to the new route.

**Architecture:** One new App Router page (`app/careers/page.tsx`) composing three new section components. All copy is hard-coded from the mockup. Real images are out of scope — every visual slot uses the existing `animate-about-shimmer` placeholder. Two existing nav files (`navbar.tsx`, `mobile-menu.tsx`) get a one-line `href` change each.

**Tech Stack:** Next.js 16.2.4, React 19, TypeScript strict, Tailwind CSS v4. No new dependencies. Vitest + jsdom are installed but no component tests exist for marketing sections — verification is `next build` (catches type/import errors) plus visual smoke testing in the dev server (`npm run dev`).

**Spec:** `docs/superpowers/specs/2026-04-29-careers-page-design.md`

**Important Next.js 16 caveats** (verified against `node_modules/next/dist/docs/` and existing pages):
- App Router only; the `pages/` dir is gone. New route lives at `app/careers/page.tsx`.
- Section components must declare `"use client"` because they use the `useInView` hook (intersection observer).
- The page file itself stays a Server Component and exports `metadata`.

**Brand tokens / animations already available** (no need to add anything):
- Colors: `bg-brand-yellow` (#ffca26), `text-brand-black` (#181818), `bg-neutral-100`/`bg-neutral-200` greys
- Fonts: `font-heading`, `font-display`
- Animations (in `app/globals.css`): `animate-about-fade-up`, `animate-about-pop-in`, `animate-about-shimmer` — all already respect `prefers-reduced-motion`
- Hook: `useInView` from `@/lib/use-in-view`

---

## File Structure

| File                                    | Purpose                                                        | Status |
|-----------------------------------------|----------------------------------------------------------------|--------|
| `app/careers/page.tsx`                  | Server page: metadata + chrome + three sections                | Create |
| `components/careers-hero.tsx`           | Section 1 — headline, subhead, CTA, image placeholder          | Create |
| `components/careers-values.tsx`         | Section 2 — heading, intro, 3×2 grid, bottom CTA               | Create |
| `components/careers-together.tsx`       | Section 3 — `id="openings"` anchor, framed heading, image      | Create |
| `components/navbar.tsx`                 | Change Careers link `href` from `"#"` to `"/careers"`          | Modify |
| `components/mobile-menu.tsx`            | Change Careers link `href` from `"#"` to `"/careers"`          | Modify |

**Why three section components instead of one big file:** each section has a distinct visual rhythm and its own `useInView` orchestration. Splitting keeps each file ~80–120 lines, mirrors the pattern used for `about-us` (`about-hero.tsx`, `featured-yellow-card.tsx`, etc.), and makes future copy edits low-risk.

---

### Task 1: Scaffold the route with placeholder sections

Create the page file and three empty section components first so the route resolves and we can iterate visually section-by-section.

**Files:**
- Create: `app/careers/page.tsx`
- Create: `components/careers-hero.tsx`
- Create: `components/careers-values.tsx`
- Create: `components/careers-together.tsx`

- [ ] **Step 1: Write `app/careers/page.tsx`**

```tsx
import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CareersHero } from "@/components/careers-hero";
import { CareersTogether } from "@/components/careers-together";
import { CareersValues } from "@/components/careers-values";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Careers — JAZA Media",
  description:
    "Join a world-record breaking team. JAZA Media is hiring disciplined teammates who lead with trust and play to win.",
};

export default function CareersPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <CareersHero />
        <CareersValues />
        <CareersTogether />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
```

- [ ] **Step 2: Write a placeholder `components/careers-hero.tsx`**

```tsx
"use client";

export function CareersHero() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-brand-black">CareersHero placeholder</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write a placeholder `components/careers-values.tsx`**

```tsx
"use client";

export function CareersValues() {
  return (
    <section className="bg-neutral-100 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-brand-black">CareersValues placeholder</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write a placeholder `components/careers-together.tsx`**

```tsx
"use client";

export function CareersTogether() {
  return (
    <section id="openings" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-brand-black">CareersTogether placeholder</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Verify the route compiles**

Run:
```bash
npm run dev
```
Expected: dev server starts, `localhost:3000/careers` renders three placeholder lines stacked under the existing navbar/footer chrome. No console or terminal errors.

Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 6: Commit**

```bash
git add app/careers/page.tsx components/careers-hero.tsx components/careers-values.tsx components/careers-together.tsx
git commit -m "feat(careers): scaffold /careers route with placeholder sections"
```

---

### Task 2: Build the hero section (`careers-hero.tsx`)

**Files:**
- Modify: `components/careers-hero.tsx` (replace the placeholder body)

- [ ] **Step 1: Replace `components/careers-hero.tsx` with the full hero**

```tsx
"use client";

import { useInView } from "@/lib/use-in-view";

function HeroImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-4 border-white bg-white/90 shadow-inner lg:aspect-auto lg:h-full"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

export function CareersHero() {
  const { ref: headlineRef, inView: headlineIn } =
    useInView<HTMLHeadingElement>();
  const { ref: copyRef, inView: copyIn } = useInView<HTMLDivElement>();
  const { ref: imageRef, inView: imageIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <h1
              ref={headlineRef}
              className={`font-heading text-[32px] font-bold leading-[1.15] tracking-tight text-brand-black md:text-[40px] lg:text-5xl xl:text-[56px] ${
                headlineIn ? "animate-about-fade-up" : "opacity-0"
              }`}
            >
              Join a{" "}
              <span className="bg-brand-yellow px-1 underline decoration-brand-black decoration-2 underline-offset-4">
                world-record
              </span>
              <br className="hidden md:block" /> breaking team!
            </h1>

            <div
              ref={copyRef}
              style={{ animationDelay: copyIn ? "120ms" : undefined }}
              className={copyIn ? "animate-about-fade-up" : "opacity-0"}
            >
              <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-black/90 md:text-lg">
                We&apos;re seeking teammates who lead with trust, work with
                discipline, and play to win as a team.
              </p>

              <a
                href="#openings"
                className="mt-6 inline-block rounded-full bg-brand-yellow px-6 py-3 font-heading text-sm font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:text-base"
              >
                View Job Openings
              </a>
            </div>
          </div>

          <div
            ref={imageRef}
            style={{ animationDelay: imageIn ? "200ms" : undefined }}
            className={`lg:h-full ${
              imageIn ? "animate-about-pop-in" : "opacity-0"
            }`}
          >
            <HeroImagePlaceholder />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual smoke test**

Run `npm run dev`. Visit `localhost:3000/careers`. Verify:
- Headline reads "Join a world-record breaking team!" with "world-record" wrapped in a yellow highlight + black underline.
- Subhead and yellow "View Job Openings" pill render below the headline.
- A shimmering rectangular placeholder occupies the right column on desktop, stacks below the headline on mobile.
- Clicking "View Job Openings" jumps to the bottom (Section 3 still placeholder, OK).

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add components/careers-hero.tsx
git commit -m "feat(careers): implement hero section with headline and CTA"
```

---

### Task 3: Build the values grid section (`careers-values.tsx`)

**Files:**
- Modify: `components/careers-values.tsx` (replace the placeholder body)

- [ ] **Step 1: Replace `components/careers-values.tsx` with the full values section**

```tsx
"use client";

import { useInView } from "@/lib/use-in-view";

type ValueCard = {
  title: string;
  paragraphs: string[];
};

const VALUES: ValueCard[] = [
  {
    title: "You build with the long game in mind.",
    paragraphs: [
      "You're not here for shortcuts. You care about creating businesses that compound over years, not months.",
      "That means focusing on fundamentals, building systems that scale, and making decisions that stand the test of time.",
    ],
  },
  {
    title: "You hold a high standard.",
    paragraphs: [
      "Excellence isn't optional.",
      "You take ownership, sweat the details, and deliver work you're proud of.",
      "More than that, you raise the bar for the people around you, because you know high standards pull the whole team forward.",
    ],
  },
  {
    title: "You value people over hype.",
    paragraphs: [
      "You know real businesses aren't built on trends or noise…",
      "They're built on trust. You invest in relationships, lead with integrity, and focus on what drives lasting results for founders, teams, and customers.",
    ],
  },
];

// Document order maps directly onto the 3×2 grid:
//   row 1: image, value[0]
//   row 2: value[1], image
//   row 3: image, value[2]
type Cell =
  | { kind: "image"; key: string }
  | { kind: "text"; value: ValueCard };

const CELLS: Cell[] = [
  { kind: "image", key: "img-1" },
  { kind: "text", value: VALUES[0] },
  { kind: "text", value: VALUES[1] },
  { kind: "image", key: "img-2" },
  { kind: "image", key: "img-3" },
  { kind: "text", value: VALUES[2] },
];

function CellImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] w-full overflow-hidden rounded-md border-4 border-white bg-white/90 shadow-inner"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

function ValueTextCard({ value }: { value: ValueCard }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-md bg-white p-5 shadow-sm md:p-6">
      <h3 className="font-heading text-base font-bold text-brand-black md:text-lg">
        {value.title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-black/90 md:text-[15px]">
        {value.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function GridCell({ cell, index }: { cell: Cell; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${index * 60}ms` : undefined }}
      className={inView ? "animate-about-fade-up" : "opacity-0"}
    >
      {cell.kind === "image" ? (
        <CellImagePlaceholder />
      ) : (
        <ValueTextCard value={cell.value} />
      )}
    </div>
  );
}

export function CareersValues() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-neutral-100 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={headRef}
          className={`mx-auto max-w-3xl text-center ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="font-heading text-[26px] font-bold leading-tight text-brand-black md:text-3xl lg:text-[34px]">
            We want disciplined team players who trust and{" "}
            <span className="underline decoration-2 underline-offset-4">
              win together.
            </span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-brand-black/90 md:text-[15px]">
            At JAZA Media you&apos;ll help entrepreneurs build real businesses
            with strong foundations, scalable systems, and lasting impact. Our
            mission is straightforward: make real world business scaling
            program accessible to everyone. We set a high bar, move with
            urgency, and measure ourselves by results. If you want to create —
            and work with a team that plays to win — you&apos;ll fit right in.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          {CELLS.map((cell, i) => (
            <GridCell
              key={cell.kind === "image" ? cell.key : cell.value.title}
              cell={cell}
              index={i}
            />
          ))}
        </div>

        <div
          ref={ctaRef}
          className={`mt-10 text-center ${
            ctaIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <a
            href="#openings"
            className="inline-block rounded-full bg-brand-yellow px-6 py-3 font-heading text-sm font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:text-base"
          >
            View Job Openings
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual smoke test**

Run `npm run dev`. Visit `localhost:3000/careers`. Verify:
- Centered H2 reads "We want disciplined team players who trust and win together." with "win together." underlined (no yellow highlight).
- Intro paragraph centered below.
- Six cells in a 3×2 grid: image, text, text, image, image, text — text cards are white, image cells shimmer.
- On mobile, cells stack into a single column in the same order.
- Bottom-centered yellow "View Job Openings" pill jumps to Section 3.
- All cells fade up as you scroll.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add components/careers-values.tsx
git commit -m "feat(careers): implement values grid section"
```

---

### Task 4: Build the "How we work TOGETHER" section (`careers-together.tsx`)

**Files:**
- Modify: `components/careers-together.tsx` (replace the placeholder body)

- [ ] **Step 1: Replace `components/careers-together.tsx` with the full section**

```tsx
"use client";

import { useInView } from "@/lib/use-in-view";

function GroupImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[16/9] w-full overflow-hidden rounded-md border-4 border-white bg-white/90 shadow-inner"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

export function CareersTogether() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: imgRef, inView: imgIn } = useInView<HTMLDivElement>();

  return (
    <section id="openings" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={headRef}
          className={`flex justify-center ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="inline-block rounded-md border-2 border-violet-600 px-6 py-3 font-heading text-[26px] font-bold uppercase tracking-tight text-brand-black md:text-3xl lg:text-[34px]">
            How we work TOGETHER!
          </h2>
        </div>

        <div
          ref={imgRef}
          style={{ animationDelay: imgIn ? "120ms" : undefined }}
          className={`mt-10 ${
            imgIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <GroupImagePlaceholder />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual smoke test**

Run `npm run dev`. Visit `localhost:3000/careers`. Verify:
- A centered heading "How we work TOGETHER!" sits inside a violet rectangular outline.
- Below it, a wide landscape shimmer placeholder (16:9 ratio).
- Both "View Job Openings" buttons (hero and values) now scroll smoothly to this section's anchor.
- Section's outer wrapper has `id="openings"` (inspect with devtools to confirm).

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add components/careers-together.tsx
git commit -m "feat(careers): implement 'How we work TOGETHER' closing section"
```

---

### Task 5: Wire the navbar Careers link

**Files:**
- Modify: `components/navbar.tsx`
- Modify: `components/mobile-menu.tsx`

- [ ] **Step 1: Update `components/navbar.tsx`**

Find the `NAV_LINKS` array near the top of the file:

```ts
const NAV_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "About the Firm", href: "/about-the-firm" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "#" },
  { label: "Support", href: "#" },
];
```

Change the Careers entry's `href` to `/careers`:

```ts
const NAV_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "About the Firm", href: "/about-the-firm" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "/careers" },
  { label: "Support", href: "#" },
];
```

(The `isInternalRoute` helper already routes any `/`-prefixed href through `<Link>`, so no other changes are needed.)

- [ ] **Step 2: Update `components/mobile-menu.tsx`**

The same `NAV_LINKS` array is duplicated in the mobile menu. Apply the same one-line change:

```ts
const NAV_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "About the Firm", href: "/about-the-firm" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "/careers" },
  { label: "Support", href: "#" },
];
```

- [ ] **Step 3: Visual smoke test**

Run `npm run dev`. From the home page (`localhost:3000`), click "Careers" in the desktop navbar — it should navigate to `/careers`. Resize the viewport below `md:` (or use devtools mobile emulation), open the hamburger menu, and click "Careers" — it should also navigate to `/careers` and close the menu.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add components/navbar.tsx components/mobile-menu.tsx
git commit -m "feat(nav): wire 'Careers' link to /careers in navbar and mobile menu"
```

---

### Task 6: Final verification — build, lint, full-page review

**Files:** none (verification only)

- [ ] **Step 1: Type-check via production build**

Run:
```bash
npm run build
```
Expected: build completes without errors. The summary should list `/careers` as a static route. If the build prints type errors, fix them and re-run before committing.

- [ ] **Step 2: Lint**

Run:
```bash
npm run lint
```
Expected: no errors. (Warnings already present in the repo are acceptable; do not introduce new ones.)

- [ ] **Step 3: End-to-end visual review in dev mode**

Run `npm run dev` and walk through the page once at desktop width and once at mobile width:

Desktop checklist:
- [ ] Navbar "Careers" link is highlighted/clickable and lands on `/careers`
- [ ] Hero: "world-record" highlight is yellow + underlined; team-photo placeholder shimmers on the right
- [ ] Hero CTA scrolls to Section 3
- [ ] Values: heading underline on "win together."; intro paragraph centered; 3×2 grid in correct image/text order; cells fade up on scroll
- [ ] Bottom CTA in values section scrolls to Section 3
- [ ] Section 3 heading framed in violet; group-photo placeholder is full-width landscape
- [ ] Footer + copyright bar appear below

Mobile checklist (devtools mobile emulation):
- [ ] Hamburger menu's "Careers" navigates to `/careers`
- [ ] All sections stack to a single column
- [ ] Grid cell order is preserved (image, text, text, image, image, text)
- [ ] Yellow CTAs remain centered and tappable
- [ ] No horizontal scroll

If any checkbox fails, fix in place and re-verify. If everything passes, stop the dev server.

- [ ] **Step 4: Clean up Playwright artifacts (if any)**

If a `.playwright-mcp/` directory or stray screenshot PNGs appeared in the project root during browser-driven verification, delete them before the final commit:

```bash
rm -rf .playwright-mcp
ls *.png 2>/dev/null
```

(Only delete root-level PNGs that you created during this task; do NOT touch anything under `public/`.)

- [ ] **Step 5: Final status check**

```bash
git status
git log --oneline -10
```

Expected: working tree clean. The last 5 commits should match the per-task commits from Tasks 1–5 in order.

---

## Self-review

**Spec coverage:**
- New `/careers` route → Task 1
- Three new section components → Tasks 1 (scaffold) + 2/3/4 (implementations)
- Image placeholders (shimmer) for every visual slot → all three section tasks
- Navbar + MobileMenu wiring → Task 5
- `useInView` fade-up animations → Tasks 2/3/4
- Both CTAs anchor to `#openings` (Section 3) → Tasks 2 + 3 + 4
- `metadata` export with title/description → Task 1

No spec requirement is missing.

**Placeholder scan:** No "TBD"/TODO; every code block is complete and ready to paste.

**Type / name consistency:** `CareersHero`, `CareersValues`, `CareersTogether` are exported from their files and imported in the page exactly once. `id="openings"` appears only on the Section 3 `<section>`. The `ValueCard`/`Cell` types stay local to `careers-values.tsx` and aren't referenced elsewhere.

**Scope:** Six tasks, six commits, ~250 lines of new TSX total. Single-PR sized.
