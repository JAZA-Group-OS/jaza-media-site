# About the Firm — Design Spec

**Date:** 2026-04-27
**Status:** Approved (pending /noxadevteam review on implementation)
**Author:** Claude (paired with @OmharRegidor)

## Goal

Build a new "About the Firm" page that introduces JAZA Media's leadership team in a 4×3 grid, plus per-member bio detail pages. Visual design is a JAZA-branded reinterpretation of acquisition.com/firm.

## Scope

**In scope**
- New listing page at `/about-the-firm` showing the 12 leadership cards
- New dynamic bio page at `/team/[slug]` (one template, twelve members)
- Reusable "Want us to help you explode profit?" CTA section, shared between the listing page and each bio page
- Wiring the existing Navbar's "About the Firm" nav link to the new route

**Out of scope (placeholder only, follow-up tickets)**
- Real bio copy for all 12 members — placeholder copy used; bios in screenshot #3 are inspirational only and will not be reproduced verbatim (third-party source)
- Real names and photos for the 5 unnamed slots (CFO, PPC Manager, UI/UX Manager, Lead Executive Assistant, and one "NAME" entry)
- A photo for Charles Rosario (placeholder card for now)
- Sub-routes for `/careers`, `/support`, `/partner-with-us`, `/about-us`

## Routes

| Route                  | File                                | Notes                                                |
|------------------------|-------------------------------------|------------------------------------------------------|
| `/about-the-firm`      | `app/about-the-firm/page.tsx`       | Static. Composed of header chrome + grid + CTA.      |
| `/team/[slug]`         | `app/team/[slug]/page.tsx`          | Dynamic. `generateStaticParams()` pre-builds all 12. |

`/team/[slug]` calls `notFound()` for unknown slugs.

## Data model

New file `lib/team.ts`:

```ts
export type Accent = "purple"

export type Member = {
  slug: string                // URL-safe, e.g. "jaza", "uiux-manager"
  name: string | null         // null → render the literal "NAME" placeholder
  role: string                // role line, e.g. "MANAGING PARTNER, FOUNDER & CEO"
  image: string | null        // path under /public, null → grey placeholder card
  bioImage?: string           // larger portrait used on the bio page; falls back to image
  accent?: Accent             // reserved for the UI/UX manager's purple frame
  bio?: string[]              // paragraph array; absent → "Bio coming soon" message
}

export const TEAM: Member[]
```

Twelve entries in display order: `jaza`, `bela`, `manny`, `cfo`, `nica`, `omhar`, `ppc-manager`, `jm`, `charles`, `cristal`, `uiux-manager`, `lead-ea`.

Helpers exported:
- `getMember(slug: string): Member | undefined`
- `getAllSlugs(): string[]`

## Components

All new components live in `components/` to match the existing pattern.

### `team-card.tsx`
Single grid cell. Props: `Member`. Renders:
- `border-2` photo frame (color depends on `accent` — default `border-brand-black`, `purple` → `border-purple-500`)
- Photo with `grayscale` filter, OR an empty grey rectangle if `image === null`
- Yellow shelf bar (`h-3 bg-brand-yellow`) directly below the frame
- Name in `text-brand-yellow font-heading font-black uppercase` (literal "NAME" if null)
- Role in `text-brand-black font-bold uppercase tracking-wide`
- "About {firstName}" pill button → `/team/${slug}` (uses Next.js `<Link>`)
- For unnamed slots, the button label degrades to "About Name"

### `team-grid.tsx`
Section wrapper. Renders the "MEET OUR LEADERSHIP TEAM" heading and a 3-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) mapping `TEAM` through `team-card.tsx`. Heading style mirrors the existing `Founders` section's "ABOUT OUR FOUNDERS".

### `explode-profit-cta.tsx`
Self-contained CTA section reused on both new pages. Layout:
- White background
- Two transparent-PNG cutouts (`/images/jaza-footer.webp`, `/images/bela-footer.webp`) anchored bottom-left, slightly overlapping
- Right side: black "WANT US TO HELP YOU EXPLODE PROFIT?" headline, subhead "See how JAZA Media can help", yellow "LEARN MORE" pill button
- Currently links to `#`; can be wired up later

### `team-bio-hero.tsx`
Top of the bio detail page:
- Yellow band background
- Member photo (or grey placeholder) on the left
- Name + role stacked on the right
- Same yellow shelf accent

### Reuse without changes
- `AnnouncementBanner`
- `Navbar` (one-line change: update the `About the Firm` href to `/about-the-firm`)
- `Footer`
- `CopyrightBar`

## Page composition

**`app/about-the-firm/page.tsx`**
```
<AnnouncementBanner />
<Navbar />
<main>
  <TeamGrid />
  <ExplodeProfitCta />
</main>
<Footer />
<CopyrightBar />
```

**`app/team/[slug]/page.tsx`**
```
<AnnouncementBanner />
<Navbar />
<main>
  <TeamBioHero member={member} />
  {/* Bio paragraphs rendered inline in the page file, not a component.
      If member.bio is undefined, render "Bio coming soon" placeholder text. */}
  <ExplodeProfitCta />
</main>
<Footer />
<CopyrightBar />
```

## Visual fidelity rules

- Card photos: grayscale filter to match the screenshots; original color preserved on bio page
- Card frame: `border-2 border-brand-black` (or `border-purple-500` for UI/UX)
- Yellow shelf: 12px tall yellow bar directly under the photo frame
- Photo aspect ratio: ~`aspect-[4/5]`
- Name text: brand-yellow, `font-heading font-black uppercase`, letter-spaced slightly
- Role text: brand-black, `font-bold uppercase`, smaller, two lines allowed
- Button: pill (`rounded-full`), `bg-brand-yellow`, `text-brand-black`, `font-bold`, hover scale ≈1.02 (matches existing `Footer` "Send Us Message" button)
- Section heading: matches existing "ABOUT OUR FOUNDERS" style

## Accessibility

- `<Link>` on every "About X" CTA — keyboard-focusable, no `<div onClick>`
- Cards use semantic `<article>` with an `<h3>` member name
- Photo `alt` text uses `${name} — ${role}`; for unnamed slots, alt is `"Team member placeholder"`
- "MEET OUR LEADERSHIP TEAM" is a single `<h1>` on the listing page; the bio page's `<h1>` is the member's name
- Color contrast on yellow-on-yellow / black-on-yellow combinations verified against WCAG AA

## Responsive behavior

| Breakpoint  | Grid              | Notes                                           |
|-------------|-------------------|-------------------------------------------------|
| `< sm`      | 1 column          | Cards stack full width                          |
| `sm`–`lg`   | 2 columns         |                                                 |
| `≥ lg`      | 3 columns         | Matches the screenshot                          |

CTA section reflows on small screens: cutouts shrink and the headline + button stack vertically rather than overlap.

## Testing strategy

No unit tests for pure-presentation components. Manual QA checklist:
- All 12 cards render with the correct name/role/photo or placeholder
- Each "About X" button navigates to the right `/team/{slug}` page
- Unknown slug → 404
- `/about-the-firm` link in nav resolves
- Layout looks correct at 360px, 768px, 1280px viewports
- Lighthouse a11y score on both new pages ≥ 95

## Review gate

Before merge: invoke `/noxadevteam`. Reviewers expected to comment: **Jazelei** (frontend), **Gemini** (UI/UX), **Android** (mobile/responsive), **Manny** (PM/feature completeness), **Bryl** (scope), **Franco** (QA). Backend (Omhar), DevOps (Gab), and Security (Custodio) have no surface area in this change and may noop.

## Open questions

None at design-doc time. All clarifications (route, placeholder strategy, button behavior, CTA image source) have been resolved with the user.
