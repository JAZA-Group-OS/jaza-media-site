# Support Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public `/support` page (hero + operational FAQs + contact form) and wire submissions into the admin dashboard with realtime sync, following the patterns already used by Partner Leads / Career Applications / Course Requests.

**Architecture:** Public Next.js route `/support` with a client form that POSTs to `/api/support`. The route validates via Zod, applies CORS allowlist + Upstash rate limit + honeypot, then inserts a row into a new `support_tickets` Supabase table. The admin dashboard gains a new "Support Tickets" tab using `useRealtimeTable<SupportTicket>` to render new submissions in realtime with status filters (new / in_progress / resolved / closed). No email infrastructure, no attachments, no public ticket lookup in v1.

**Tech Stack:** Next.js 16.2.4 + React 19.2.4, TypeScript, Tailwind v4, Radix Accordion, Framer Motion, Zod, Supabase JS + Supabase realtime, Upstash rate limiter, Vitest + jsdom, Playwright via the Playwright MCP.

**Reference spec:** `docs/superpowers/specs/2026-05-03-support-page-design.md`

---

## File Structure

**Create:**
- `app/support/page.tsx` — public page composing hero + faqs + form
- `app/api/support/route.ts` — POST handler: CORS, rate limit, validate, insert
- `components/support-hero.tsx` — hero + contact strip
- `components/support-faqs.tsx` — operational FAQ accordion
- `components/support-contact-card.tsx` — client form with thank-you state
- `components/social-icons.tsx` — extracted SVG components (Gmail/Messenger/Facebook/TikTok/Instagram + `SOCIAL_LINKS` array) shared by footer + support hero
- `components/admin/support-tickets-manager.tsx` — admin manager with realtime + filters
- `lib/validations/support-ticket.ts` — Zod schema + payload type
- `lib/validations/support-ticket.test.ts` — Vitest unit tests for schema
- `supabase/migrations/20260503000000_create_support_tickets.sql` — table + RLS + realtime
- `scripts/playwright-cleanup.ts` — one-shot cleanup of Playwright test rows (deleted at the end of E2E task before commit)
- `.env.test.local.example` — documents env vars used by the manual Playwright run

**Modify:**
- `lib/site-nav.ts` — Support `href` → `/support`
- `lib/types/database.ts` — add `SupportTicket` types + register in `Database` interface
- `components/footer.tsx` — "Send Us Message" CTA → `/support`; consume the extracted `social-icons.tsx`
- `components/admin/admin-navigation.tsx` — add `support` menu item with `LifeBuoy` icon
- `app/(admin)/admin/dashboard/page.tsx` — extend `DashboardTab` union with `'support'`, render `<SupportTicketsManager />` when active
- `.gitignore` — append `.env.test.local`

---

## Task 1: Create the Supabase migration

**Files:**
- Create: `supabase/migrations/20260503000000_create_support_tickets.sql`

- [ ] **Step 1: Write the migration file**

Write `supabase/migrations/20260503000000_create_support_tickets.sql`:

```sql
-- support_tickets
-- Stores submissions from the marketing site's /support contact form.
-- Mirrors the partner_inquiries / career_applications shape so the existing
-- admin dashboard pattern (realtime + new/in_progress/resolved filtering)
-- can be reused without new infra.

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name text NOT NULL,
  email text NOT NULL,
  phone text,

  topic text NOT NULL CHECK (topic IN (
    'general',
    'course_rule_of_10x',
    'course_marketing_templates',
    'application_status',
    'billing',
    'other'
  )),
  subject text NOT NULL,
  message text NOT NULL,

  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_notes text,

  source text NOT NULL DEFAULT 'marketing_site',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
  ON public.support_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON public.support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_topic
  ON public.support_tickets (topic);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin email can read support tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

CREATE POLICY "Only admin email can update support tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_set_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
```

The `set_updated_at()` function already exists from the partner_inquiries migration — we reuse it.

- [ ] **Step 2: Push the migration to Supabase**

Use the management token saved in memory (`jaza-media Supabase PAT`) to push the migration via the Supabase CLI or Management API. If using the CLI:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<token from memory: jaza-media-supabase-pat>"
npx supabase link --project-ref wqgxzjmeqvnnrnjmfvzk
npx supabase db push
```

Expected: migration applied; `npx supabase db diff` reports no drift.

- [ ] **Step 3: Verify the table exists**

Run a quick read against the new table using the admin client (e.g. via a one-off `node -e` script or the Supabase SQL editor):

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'support_tickets';
```

Expected: 1 row returned.

- [ ] **Step 4: Commit the migration**

```powershell
git add supabase/migrations/20260503000000_create_support_tickets.sql
git commit -m "feat(support): add support_tickets table with RLS and realtime"
```

---

## Task 2: Add TypeScript types for support_tickets

**Files:**
- Modify: `lib/types/database.ts`

- [ ] **Step 1: Add the types block**

Insert this block in `lib/types/database.ts` immediately after the `course_requests` section (before the `INSERT TYPES` heading):

```ts
// ============================================================================
// support_tickets — submissions from /support
// ============================================================================

export type SupportTopic =
  | 'general'
  | 'course_rule_of_10x'
  | 'course_marketing_templates'
  | 'application_status'
  | 'billing'
  | 'other';

export type SupportTicketStatus =
  | 'new'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface SupportTicket {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  topic: SupportTopic;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  admin_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketInsert {
  full_name: string;
  email: string;
  phone?: string | null;
  topic: SupportTopic;
  subject: string;
  message: string;
  status?: SupportTicketStatus;
  admin_notes?: string | null;
  source?: string;
}

export interface SupportTicketUpdate {
  status?: SupportTicketStatus;
  admin_notes?: string | null;
}
```

- [ ] **Step 2: Register in the `Database` interface**

In the `Database['public']['Tables']` block (currently ends with `course_requests`), add:

```ts
support_tickets: {
  Row: SupportTicket;
  Insert: SupportTicketInsert;
  Update: SupportTicketUpdate;
  Relationships: [];
};
```

- [ ] **Step 3: Type-check**

```powershell
npx tsc --noEmit
```

Expected: no errors related to `lib/types/database.ts`.

- [ ] **Step 4: Commit**

```powershell
git add lib/types/database.ts
git commit -m "feat(support): add SupportTicket TS types"
```

---

## Task 3: Write the Zod validation schema (TDD)

**Files:**
- Create: `lib/validations/support-ticket.ts`
- Test: `lib/validations/support-ticket.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/validations/support-ticket.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SupportTicketSchema } from './support-ticket';

const VALID = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555 0100',
  topic: 'general',
  subject: 'Need help with my course access',
  message: 'I cannot log in to the Rule of 10X portal. Help.',
  _hp: '',
} as const;

describe('SupportTicketSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = SupportTicketSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('accepts a payload without phone (optional)', () => {
    const { phone: _phone, ...rest } = VALID;
    const result = SupportTicketSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('accepts a payload without _hp (honeypot field is optional)', () => {
    const { _hp: _hp2, ...rest } = VALID;
    const result = SupportTicketSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing full name', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a name that is too long', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: 'a'.repeat(81) });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown topic value', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, topic: 'unknown_topic' });
    expect(result.success).toBe(false);
  });

  it('accepts every defined topic value', () => {
    const topics = [
      'general',
      'course_rule_of_10x',
      'course_marketing_templates',
      'application_status',
      'billing',
      'other',
    ];
    for (const topic of topics) {
      const result = SupportTicketSchema.safeParse({ ...VALID, topic });
      expect(result.success, `topic=${topic}`).toBe(true);
    }
  });

  it('rejects a subject shorter than 4 chars', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, subject: 'hi' });
    expect(result.success).toBe(false);
  });

  it('rejects a subject longer than 120 chars', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, subject: 'a'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('rejects a message shorter than 10 chars', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, message: 'too short' });
    expect(result.success).toBe(false);
  });

  it('rejects a message longer than 2000 chars', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('trims whitespace on string fields', () => {
    const result = SupportTicketSchema.safeParse({
      ...VALID,
      fullName: '  Jane Doe  ',
      email: '  jane@example.com  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('Jane Doe');
      expect(result.data.email).toBe('jane@example.com');
    }
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```powershell
npm test -- lib/validations/support-ticket.test.ts
```

Expected: FAIL with `Cannot find module './support-ticket'` (or similar — the module doesn't exist yet).

- [ ] **Step 3: Implement the schema**

Create `lib/validations/support-ticket.ts`:

```ts
import { z } from 'zod';

/**
 * Server-side schema for /support form submissions.
 * Mirrors the shape of lib/validations/partner-inquiry.ts.
 *
 * `_hp` is the honeypot. It must be either absent or empty; the API route
 * silently accepts and discards submissions where it's filled.
 */
export const SupportTicketSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(80, 'Full name is too long'),
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .max(254),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal('').transform(() => undefined)),
  topic: z.enum([
    'general',
    'course_rule_of_10x',
    'course_marketing_templates',
    'application_status',
    'billing',
    'other',
  ]),
  subject: z
    .string()
    .trim()
    .min(4, 'Subject is too short')
    .max(120, 'Subject is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Message is too short')
    .max(2000, 'Message is too long'),
  _hp: z.string().optional(),
});

export type SupportTicketPayload = z.infer<typeof SupportTicketSchema>;
```

- [ ] **Step 4: Run tests, verify they pass**

```powershell
npm test -- lib/validations/support-ticket.test.ts
```

Expected: all tests PASS (13/13).

- [ ] **Step 5: Commit**

```powershell
git add lib/validations/support-ticket.ts lib/validations/support-ticket.test.ts
git commit -m "feat(support): add Zod schema with unit tests"
```

---

## Task 4: Build the API route

**Files:**
- Create: `app/api/support/route.ts`

- [ ] **Step 1: Create the route handler**

Create `app/api/support/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { SupportTicketSchema } from '@/lib/validations/support-ticket';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  corsHeaders,
  handlePreflight,
  rejectDisallowedOrigin,
} from '@/lib/cors';
import type { SupportTicketInsert } from '@/lib/types/database';

export const runtime = 'nodejs';

// 3 submissions per IP per 10 minutes — looser than partner's 5/10 because
// support legitimately gets repeat submitters; tight enough to block spam.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 3 };

export async function OPTIONS(request: Request) {
  return handlePreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const originReject = rejectDisallowedOrigin(request);
  if (originReject) return originReject;
  const cors = corsHeaders(request.headers.get('origin'));

  const ip = getClientIp(request);
  const limit = await rateLimit(`support:${ip}`, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...cors,
          'Retry-After': String(Math.ceil(limit.resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: cors });
  }

  const parsed = SupportTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400, headers: cors },
    );
  }

  const data = parsed.data;

  // Honeypot trip: silently succeed without writing. Don't tell bots.
  if (data._hp && data._hp.length > 0) {
    return NextResponse.json({ success: true }, { headers: cors });
  }

  const ticketRow: SupportTicketInsert = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
    topic: data.topic,
    subject: data.subject,
    message: data.message,
    source: 'marketing_site',
  };

  try {
    const supabase = createAdminClient();
    const { error } = await (
      supabase.from('support_tickets') as unknown as {
        insert: (row: SupportTicketInsert) => Promise<{ error: Error | null }>;
      }
    ).insert(ticketRow);

    if (error) {
      console.error('[api/support] insert failed:', (error as { code?: string }).code, error.message);
      return NextResponse.json(
        { error: 'Failed to save your message' },
        { status: 500, headers: cors },
      );
    }

    return NextResponse.json({ success: true }, { headers: cors });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/support] unexpected error:', message);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: cors });
  }
}
```

- [ ] **Step 2: Type-check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke test the route locally**

Start dev server in a separate terminal: `npm run dev`. Then in another:

```powershell
curl -X POST http://localhost:3000/api/support `
  -H "Content-Type: application/json" `
  -H "Origin: http://localhost:3000" `
  -d '{"fullName":"Curl Test","email":"curl@example.com","topic":"general","subject":"Curl smoke test","message":"This is a smoke test message that is long enough."}'
```

Expected: `{"success":true}` and a row visible in the Supabase Studio for `support_tickets`. Delete this row from Supabase Studio before continuing.

- [ ] **Step 4: Commit**

```powershell
git add app/api/support/route.ts
git commit -m "feat(support): add POST /api/support with rate limit and validation"
```

---

## Task 5: Extract social icons into a shared component

**Files:**
- Create: `components/social-icons.tsx`
- Modify: `components/footer.tsx`

- [ ] **Step 1: Create the shared module**

Create `components/social-icons.tsx`:

```tsx
import type { ComponentType, SVGProps } from 'react';

type IconProps = { className?: string };

export function GmailIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 4H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-10 6.25L2 8.24V6l10 6.25L22 6v2.24Z" />
    </svg>
  );
}

export function MessengerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.14 2 11.22c0 2.89 1.46 5.48 3.75 7.18V22l3.42-1.88c.91.25 1.87.39 2.83.39 5.5 0 10-4.14 10-9.28S17.5 2 12 2Zm1.03 12.52-2.56-2.73-4.99 2.73 5.49-5.83 2.6 2.73 4.94-2.73-5.48 5.83Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.39 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

export type SocialLink = {
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
};

// Hrefs are placeholders — replace with real URLs when the channels are
// publicly published. Using `#` keeps the icons visible without misleading.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Gmail', href: '#', Icon: GmailIcon },
  { label: 'Messenger', href: '#', Icon: MessengerIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'TikTok', href: '#', Icon: TikTokIcon },
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
];

export type { IconProps as SocialIconProps, SVGProps };
```

- [ ] **Step 2: Update `components/footer.tsx` to consume the shared module**

Replace the icon component definitions and `SOCIALS` array in `components/footer.tsx` with an import. Concretely, delete lines 6–52 (the `GmailIcon` through `SOCIALS` block) and add at the top:

```tsx
import { SOCIAL_LINKS } from '@/components/social-icons';
```

Then update the JSX that maps over the socials to use `SOCIAL_LINKS` instead of `SOCIALS`. The map body is otherwise unchanged.

- [ ] **Step 3: Verify build still works**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Manually open http://localhost:3000 and confirm the footer still renders the same icons.**

- [ ] **Step 5: Commit**

```powershell
git add components/social-icons.tsx components/footer.tsx
git commit -m "refactor: extract social icons for shared use across footer and support"
```

---

## Task 6: Build the SupportHero component

**Files:**
- Create: `components/support-hero.tsx`

- [ ] **Step 1: Implement**

Create `components/support-hero.tsx`:

```tsx
import { SOCIAL_LINKS } from '@/components/social-icons';

const SUPPORT_EMAIL = 'support@jazamedia.com';

export function SupportHero() {
  return (
    <section className="bg-brand-black pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow">
          Support
        </p>
        <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-white md:text-5xl">
          How can we help?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-heading text-base leading-relaxed text-white/70 md:text-lg">
          Browse common answers below, or send us a message and our team will get
          back to you within 2 business days.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-5">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center rounded-full border border-brand-yellow/40 px-5 py-2 font-heading text-sm font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-brand-black"
          >
            {SUPPORT_EMAIL}
          </a>

          <ul className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="text-white/70 transition-colors hover:text-brand-yellow"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

The `SUPPORT_EMAIL` constant is a placeholder — flag for the user to replace before launch with the real address.

- [ ] **Step 2: Verify lint + types**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```powershell
git add components/support-hero.tsx
git commit -m "feat(support): add SupportHero component"
```

---

## Task 7: Build the SupportFaqs component

**Files:**
- Create: `components/support-faqs.tsx`

- [ ] **Step 1: Implement**

Create `components/support-faqs.tsx`:

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SUPPORT_FAQS = [
  {
    q: "How do I access my course after I submitted the claim form?",
    a: "Once your claim is processed, our team sends the access details to the email you used on the form within 2 business days. If you haven't received anything by then, message us using the form below and include the email you signed up with.",
  },
  {
    q: "I haven't heard back about my partner inquiry — how long does review take?",
    a: "Partner inquiries are reviewed within 3–5 business days. If you submitted more than a week ago and still haven't received an update, send us a note here with the email and full name you used so we can locate your inquiry.",
  },
  {
    q: "I applied for a career role. When will I hear back?",
    a: "We review applications on a rolling basis and prioritize roles that are actively hiring. If you submitted within the last 2 weeks, please give us time to review. After 2 weeks, you're welcome to follow up here.",
  },
  {
    q: "There was a problem with my payment / charge / refund.",
    a: "Reach out using the form below and choose Billing / Payment as the topic. Include the email used at checkout and any reference number you received. We'll respond within 2 business days.",
  },
  {
    q: "Can I update the information I submitted on a form?",
    a: "Yes — send us a message with the original email you used and what you'd like changed. We'll update the record on our side and confirm back.",
  },
  {
    q: "How do I report a bug or issue with the site?",
    a: "Use the form below, choose Other as the topic, and describe what you were doing and what went wrong. A screenshot or screen recording link helps a lot.",
  },
];

export function SupportFaqs() {
  return (
    <section className="bg-surface-grey py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-heading text-2xl font-extrabold tracking-tight text-brand-black md:text-3xl">
          Help & FAQs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-heading text-sm text-neutral-600 md:text-base">
          Quick answers to the questions our support team gets the most.
        </p>

        <Accordion className="mt-12">
          {SUPPORT_FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`support-faq-${i}`}
              className="!border-b-2 !border-dotted !border-neutral-500/70"
            >
              <AccordionTrigger className="py-4 text-left font-heading text-lg font-bold text-brand-black hover:no-underline md:text-[22px]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-neutral-700 md:text-lg">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lint + type-check**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```powershell
git add components/support-faqs.tsx
git commit -m "feat(support): add SupportFaqs operational accordion"
```

---

## Task 8: Build the SupportContactCard form component

**Files:**
- Create: `components/support-contact-card.tsx`

- [ ] **Step 1: Implement**

Create `components/support-contact-card.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Topic =
  | "general"
  | "course_rule_of_10x"
  | "course_marketing_templates"
  | "application_status"
  | "billing"
  | "other";

const TOPIC_OPTIONS: { value: Topic; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "course_rule_of_10x", label: "Course Help — Rule of 10X" },
  { value: "course_marketing_templates", label: "Course Help — Marketing Templates" },
  { value: "application_status", label: "Application / Partnership Status" },
  { value: "billing", label: "Billing / Payment" },
  { value: "other", label: "Other" },
];

const SUPPORT_EMAIL = "support@jazamedia.com";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function SupportContactCard() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setState({ kind: "submitting" });

    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || undefined,
      topic: String(fd.get("topic") ?? ""),
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      _hp: String(fd.get("_hp") ?? ""),
    };

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setState({ kind: "success" });
        return;
      }

      if (res.status === 400) {
        const data = (await res.json().catch(() => ({}))) as {
          issues?: { path: (string | number)[]; message: string }[];
        };
        const errs: Record<string, string> = {};
        for (const issue of data.issues ?? []) {
          const key = String(issue.path[0] ?? "");
          if (key) errs[key] = issue.message;
        }
        setFieldErrors(errs);
        setState({ kind: "error", message: "Please fix the highlighted fields." });
        return;
      }

      if (res.status === 429) {
        setState({
          kind: "error",
          message: "You're sending messages too quickly. Please wait a few minutes and try again.",
        });
        return;
      }

      setState({
        kind: "error",
        message: `Couldn't send your message right now. Please try again, or email us directly at ${SUPPORT_EMAIL}.`,
      });
    } catch {
      setState({
        kind: "error",
        message: `Couldn't reach our servers. Please try again, or email us directly at ${SUPPORT_EMAIL}.`,
      });
    }
  }

  if (state.kind === "success") {
    return (
      <section className="bg-brand-black py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-2xl border border-brand-yellow/30 bg-white/5 p-10">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow">
              Message received
            </p>
            <h2 className="mt-4 font-heading text-2xl font-extrabold text-white md:text-3xl">
              We&apos;ve got your message.
            </h2>
            <p className="mt-3 font-heading text-base text-white/70 md:text-lg">
              Our team will reply within 2 business days. Keep an eye on the inbox you used.
            </p>
            <button
              type="button"
              onClick={() => setState({ kind: "idle" })}
              className="mt-8 inline-flex items-center rounded-full bg-brand-yellow px-6 py-2.5 font-heading text-sm font-bold text-brand-black transition-transform hover:scale-[1.02]"
            >
              Send another message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-black py-16 md:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-center font-heading text-2xl font-extrabold text-white md:text-3xl">
          Still need help?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-heading text-sm text-white/70 md:text-base">
          Send us a message and we&apos;ll reply within 2 business days.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
          noValidate
        >
          <Field label="Full name" name="fullName" required error={fieldErrors.fullName} />
          <Field label="Email" name="email" type="email" required error={fieldErrors.email} />
          <Field label="Phone (optional)" name="phone" error={fieldErrors.phone} />

          <div>
            <label
              htmlFor="topic"
              className="mb-1.5 block font-heading text-sm font-semibold text-white"
            >
              Topic <span className="text-brand-yellow">*</span>
            </label>
            <select
              id="topic"
              name="topic"
              required
              defaultValue="general"
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 font-heading text-sm text-white outline-none focus:border-brand-yellow"
            >
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.topic && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.topic}</p>
            )}
          </div>

          <Field label="Subject" name="subject" required error={fieldErrors.subject} />

          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block font-heading text-sm font-semibold text-white"
            >
              Message <span className="text-brand-yellow">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              maxLength={2000}
              className="w-full resize-y rounded-md border border-white/15 bg-black/40 px-3 py-2.5 font-heading text-sm text-white outline-none focus:border-brand-yellow"
            />
            {fieldErrors.message && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.message}</p>
            )}
          </div>

          {/* Honeypot — visually hidden, but tab-accessible bots will still fill it */}
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />

          {state.kind === "error" && (
            <p className="text-sm text-red-400" role="alert">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={state.kind === "submitting"}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-yellow px-6 py-3 font-heading text-sm font-bold text-brand-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.kind === "submitting" ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block font-heading text-sm font-semibold text-white">
        {label}
        {required && <span className="text-brand-yellow"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 font-heading text-sm text-white outline-none focus:border-brand-yellow"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```powershell
git add components/support-contact-card.tsx
git commit -m "feat(support): add contact form with thank-you state and error handling"
```

---

## Task 9: Build the /support page

**Files:**
- Create: `app/support/page.tsx`

- [ ] **Step 1: Implement the page**

Create `app/support/page.tsx`:

```tsx
import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SupportContactCard } from "@/components/support-contact-card";
import { SupportFaqs } from "@/components/support-faqs";
import { SupportHero } from "@/components/support-hero";

export const metadata = {
  title: "Support — JAZA Media",
  description:
    "Get help with your JAZA Media course, partnership inquiry, application, or billing. Browse FAQs or send us a message.",
};

export default function SupportPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <SupportHero />
        <SupportFaqs />
        <SupportContactCard />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
```

- [ ] **Step 2: Lint + type-check**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Eyeball the page**

Start dev server (`npm run dev`), open `http://localhost:3000/support`. Check:
- Hero renders with email + social icons
- FAQ accordion expands/collapses
- Form renders all 6 fields + topic dropdown shows all 6 options

- [ ] **Step 4: Commit**

```powershell
git add app/support/page.tsx
git commit -m "feat(support): add /support route composing hero, faqs, contact"
```

---

## Task 10: Wire up site nav and footer CTA

**Files:**
- Modify: `lib/site-nav.ts`
- Modify: `components/footer.tsx`

- [ ] **Step 1: Repoint Support nav link**

In `lib/site-nav.ts`, change:

```ts
{ label: "Support", href: "#" },
```

to:

```ts
{ label: "Support", href: "/support" },
```

- [ ] **Step 2: Repoint footer "Send Us Message" CTA**

In `components/footer.tsx`, find the Link:

```tsx
<Link
  href="/partner-with-us"
  className="inline-flex items-center rounded-full bg-brand-yellow px-6 py-2.5 font-heading text-sm font-bold text-brand-black transition-transform hover:scale-[1.02]"
>
  Send Us Message
</Link>
```

Change `href="/partner-with-us"` to `href="/support"`.

- [ ] **Step 3: Verify**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean. Manually open `http://localhost:3000` and click "Support" in the nav and "Send Us Message" in the footer — both should land on `/support`.

- [ ] **Step 4: Commit**

```powershell
git add lib/site-nav.ts components/footer.tsx
git commit -m "feat(support): wire Support nav link and footer CTA to /support"
```

---

## Task 11: Build the admin SupportTicketsManager

**Files:**
- Create: `components/admin/support-tickets-manager.tsx`

- [ ] **Step 1: Implement**

Create `components/admin/support-tickets-manager.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import type { SupportTicket, SupportTicketStatus, SupportTopic } from '@/lib/types/database';

type FilterTab = 'all' | SupportTicketStatus;

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_COLORS: Record<SupportTicketStatus, string> = {
  new: 'bg-[#FFB829]/20 text-[#FFB829] border-[#FFB829]/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-300 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const TOPIC_LABELS: Record<SupportTopic, string> = {
  general: 'General Inquiry',
  course_rule_of_10x: 'Course — Rule of 10X',
  course_marketing_templates: 'Course — Marketing Templates',
  application_status: 'Application Status',
  billing: 'Billing / Payment',
  other: 'Other',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const FILTER_TABS: FilterTab[] = ['all', 'new', 'in_progress', 'resolved', 'closed'];

export default function SupportTicketsManager() {
  const {
    rows: tickets,
    setRows: setTickets,
    loading,
    error,
  } = useRealtimeTable<SupportTicket>('support_tickets');

  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      new: tickets.filter((t) => t.status === 'new').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
    }),
    [tickets],
  );

  async function updateStatus(id: string, next: SupportTicketStatus) {
    setUpdatingId(id);
    const { error: updateError } = await (
      supabase.from('support_tickets') as unknown as {
        update: (vals: { status: SupportTicketStatus }) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      }
    )
      .update({ status: next })
      .eq('id', id);

    if (!updateError) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <p className="font-semibold mb-1">Failed to load tickets</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">Support Tickets</h2>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-1.5 sm:flex-wrap">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab;
              const muted = !active && counts[tab] === 0;
              const label = tab === 'all' ? 'All' : STATUS_LABELS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#FFB829] text-black'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } ${muted ? 'opacity-40' : ''}`}
                >
                  {label}
                  <span className={`ml-1 ${active ? 'opacity-70' : 'opacity-50'}`}>
                    ({counts[tab]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-center">
          <p className="text-gray-400 mb-2">No support tickets yet</p>
          <p className="text-xs text-gray-500">Submissions from /support will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, index) => {
            const isExpanded = expandedId === ticket.id;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="rounded-lg bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1a1a1a] hover:border-[#FFB829]/30 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  className="w-full p-4 sm:p-5 text-left"
                >
                  <div className="space-y-3.5 sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate">{ticket.full_name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{ticket.email}</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white/5 text-gray-300 border border-white/10">
                        {TOPIC_LABELS[ticket.topic]}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${STATUS_COLORS[ticket.status]}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <p className="font-semibold truncate">{ticket.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{ticket.email}</p>
                    </div>
                    <div className="sm:col-span-4 text-sm font-semibold text-white truncate">
                      {ticket.subject}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white/5 text-gray-300 border border-white/10 truncate">
                        {TOPIC_LABELS[ticket.topic]}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${STATUS_COLORS[ticket.status]}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                    <div className="sm:col-span-1 flex justify-end text-gray-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-[#1a1a1a] p-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <DetailItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={ticket.email} />
                      <DetailItem
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Phone"
                        value={ticket.phone ?? '—'}
                      />
                      <DetailItem
                        icon={<Tag className="w-3.5 h-3.5" />}
                        label="Topic"
                        value={TOPIC_LABELS[ticket.topic]}
                      />
                      <DetailItem
                        icon={<Calendar className="w-3.5 h-3.5" />}
                        label="Submitted"
                        value={formatDate(ticket.created_at)}
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subject</p>
                      <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Message</p>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(['new', 'in_progress', 'resolved', 'closed'] as SupportTicketStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(ticket.id, status)}
                            disabled={updatingId === ticket.id || ticket.status === status}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                              ticket.status === status
                                ? STATUS_COLORS[status]
                                : 'bg-transparent text-gray-400 border-[#2a2a2a] hover:border-[#FFB829]/40 hover:text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Mark {STATUS_LABELS[status]}
                          </button>
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-gray-200">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```powershell
git add components/admin/support-tickets-manager.tsx
git commit -m "feat(admin): add SupportTicketsManager with realtime + status filters"
```

---

## Task 12: Wire Support tab into the admin dashboard

**Files:**
- Modify: `components/admin/admin-navigation.tsx`
- Modify: `app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Add Support menu item**

In `components/admin/admin-navigation.tsx`:

1. Add `LifeBuoy` to the lucide-react import:
   ```ts
   import {
     LayoutDashboard,
     TrendingUp,
     Briefcase,
     BookOpen,
     FileBox,
     LifeBuoy,
     ChevronDown,
     Menu,
     X,
   } from 'lucide-react';
   ```
2. Append to `MENU_ITEMS`:
   ```ts
   { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
   ```

- [ ] **Step 2: Render Support tab in the dashboard**

In `app/(admin)/admin/dashboard/page.tsx`:

1. Add the import:
   ```tsx
   import SupportTicketsManager from '@/components/admin/support-tickets-manager';
   ```
2. Extend the `DashboardTab` union to include `'support'`:
   ```ts
   type DashboardTab =
     | 'overview'
     | 'leads'
     | 'applications'
     | 'course-rule-of-10x'
     | 'course-marketing-templates'
     | 'support';
   ```
3. Add the render branch after the existing course-marketing-templates branch:
   ```tsx
   {activeTab === 'support' && <SupportTicketsManager />}
   ```

- [ ] **Step 3: Verify**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: clean. Manually:
- Sign into `/admin/login`
- Confirm "Support Tickets" appears in the sidebar
- Click it; the manager renders with "No support tickets yet" empty state

- [ ] **Step 4: Commit**

```powershell
git add components/admin/admin-navigation.tsx app/(admin)/admin/dashboard/page.tsx
git commit -m "feat(admin): add Support Tickets tab to dashboard"
```

---

## Task 13: Run all build / lint / test gates

**Files:** none (verification step)

- [ ] **Step 1: Lint**

```powershell
npm run lint
```

Expected: zero errors.

- [ ] **Step 2: Type-check**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Unit tests**

```powershell
npm test
```

Expected: all tests green, including the new `lib/validations/support-ticket.test.ts` (13 tests).

- [ ] **Step 4: Production build**

```powershell
npm run build
```

Expected: build succeeds; the route `/support` and `/api/support` appear in the route output.

If any of the above fails, fix in place — do not proceed to Task 14.

---

## Task 14: Manual Playwright E2E + cleanup (REQUIRED before final commit)

This task uses the Playwright MCP server (`mcp__plugin_playwright_playwright__*` tools). It is a one-time manual verification, not a persisted Playwright project in the repo.

**Files (temporary, deleted at end of task):**
- Create: `.env.test.local.example`
- Create: `scripts/playwright-cleanup.ts` (deleted at end of task)

- [ ] **Step 1: Document and prepare env vars**

Append `.env.test.local` to `.gitignore`:

```powershell
"`n.env.test.local" | Add-Content -Path .gitignore
```

Create `.env.test.local.example`:

```env
# Local-only credentials for the manual Playwright verification of /support.
# Copy to `.env.test.local` (gitignored) and fill in real values.
PLAYWRIGHT_ADMIN_EMAIL=
PLAYWRIGHT_ADMIN_PASSWORD=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
```

The developer fills `.env.test.local` locally with the admin credentials and the Supabase URL + service role key (from the Supabase dashboard or existing local `.env.local`).

- [ ] **Step 2: Start the dev server**

```powershell
npm run dev
```

Run in a background terminal. Wait until "Ready" appears.

- [ ] **Step 3: Drive the E2E flow via Playwright MCP**

Generate a unique marker for this run: `PLAYWRIGHT_E2E_<timestamp>`. Then via the Playwright MCP browser tools:

1. `browser_navigate` → `http://localhost:3000/support`
2. `browser_snapshot` — confirm hero, FAQ accordion, contact form are present
3. `browser_fill_form` with:
   - Full name: `Playwright Test`
   - Email: `playwright-e2e@jazamedia.test`
   - Phone: leave blank
   - Topic: `general`
   - Subject: the unique marker (e.g. `PLAYWRIGHT_E2E_1714723200000`)
   - Message: `Automated end-to-end test — safe to delete.`
4. `browser_click` on "Send message"
5. `browser_snapshot` — confirm "We've got your message." thank-you state appears
6. `browser_navigate` → `http://localhost:3000/admin/login`
7. `browser_fill_form` with email + password from env vars (the developer types these directly into the MCP call from `.env.test.local` — never hardcoded in this plan)
8. After login, `browser_click` on the "Support Tickets" sidebar link
9. `browser_snapshot` — confirm a row exists where the visible subject matches the unique marker
10. Expand the row by clicking it. Verify:
    - Email matches `playwright-e2e@jazamedia.test`
    - Topic shows `General Inquiry`
    - Subject matches the unique marker
    - Message matches what was submitted
11. Click "Mark In Progress". Wait 500ms. Confirm the status pill updates to In Progress.
12. Click "Mark Resolved". Wait 500ms. Confirm pill updates to Resolved.
13. `browser_navigate` to a different tab (Partner Leads) and back to Support. Confirm the row's status persisted as Resolved (not reverted).

- [ ] **Step 4: Write the cleanup script**

Create `scripts/playwright-cleanup.ts`:

```ts
/**
 * One-shot deletion of Playwright E2E test rows from support_tickets.
 * Uses the service role to bypass RLS. Deletes rows whose subject starts
 * with the marker prefix. Run with `npx tsx scripts/playwright-cleanup.ts`
 * after a Playwright run, then DELETE THIS FILE before committing.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await supabase
    .from('support_tickets')
    .delete()
    .like('subject', 'PLAYWRIGHT_E2E_%')
    .select('id');

  if (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }

  console.log(`Deleted ${data?.length ?? 0} Playwright test row(s).`);
}

main();
```

- [ ] **Step 5: Run cleanup**

Load `.env.test.local` and run:

```powershell
npx --yes dotenv-cli -e .env.test.local -- npx --yes tsx scripts/playwright-cleanup.ts
```

(`dotenv-cli` and `tsx` are downloaded ad-hoc via `npx --yes` so the dev does not need to add them as deps for a one-time script.)

Expected output: `Deleted 1 Playwright test row(s).` (or more if multiple test runs accumulated).

- [ ] **Step 6: Re-verify the row is gone**

In the Playwright browser session, refresh the Support Tickets tab. Confirm the marker row is no longer visible.

- [ ] **Step 7: Stop the dev server and clean up the cleanup script**

Stop `npm run dev`. Then:

```powershell
git rm --cached scripts/playwright-cleanup.ts 2>$null
Remove-Item scripts/playwright-cleanup.ts
# Remove the empty scripts/ folder if nothing else lives there:
if ((Get-ChildItem scripts -Force | Measure-Object).Count -eq 0) { Remove-Item scripts }
```

The `.env.test.local.example` and `.gitignore` change stay — they document the env vars for future runs.

- [ ] **Step 8: Commit the env example + gitignore update**

```powershell
git add .gitignore .env.test.local.example
git commit -m "chore: document Playwright E2E env vars (.env.test.local)"
```

**Pass criteria for Task 14:** Steps 1–7 all green; cleanup deleted ≥1 row; row no longer visible in admin tab; `scripts/playwright-cleanup.ts` no longer exists in working tree.

If any step fails: fix the underlying issue (likely in earlier tasks), re-run Task 14 from Step 3. Do not proceed to Task 15 until everything is green and the test row is cleaned up.

---

## Task 15: Final review and push

**Files:** none

- [ ] **Step 1: Re-run all gates**

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Expected: all green.

- [ ] **Step 2: Confirm git status is clean**

```powershell
git status
```

Expected: `working tree clean`. No dangling `scripts/playwright-cleanup.ts`, no uncommitted changes.

- [ ] **Step 3: Verify the support_tickets table has zero test rows**

In Supabase Studio (or via the cleanup script run a second time):

```sql
SELECT count(*) FROM public.support_tickets WHERE subject LIKE 'PLAYWRIGHT_E2E_%';
```

Expected: `0`.

- [ ] **Step 4: Push to origin**

Only after explicit user confirmation:

```powershell
git push origin main
```

---

## Self-review notes (run after writing the plan, before handing off)

Spec coverage check (each spec section → which task implements it):
- §3.1 route — Task 9
- §3.2 page composition — Tasks 6/7/8/9
- §3.3 form fields — Task 8
- §3.4 topic enum — Tasks 1/2/3
- §3.5 nav + footer wiring — Task 10
- §4.1 endpoint — Task 4
- §4.2 validation schema — Task 3
- §4.3 form failure UX — Task 8
- §5.1 table + RLS + realtime — Task 1
- §5.2 TS types — Task 2
- §6.1 admin nav — Task 12
- §6.2 dashboard branch — Task 12
- §6.3 manager component — Task 11
- §7 security/error handling — Task 4
- §8.1 Vitest unit — Task 3
- §8.2 Playwright E2E + cleanup — Task 14
- §8.3 build/lint/test gates — Task 13
- §9 files list — covered across tasks
- §10 decisions — informational; embedded in task choices

Type consistency check: `SupportTicket`, `SupportTopic`, `SupportTicketStatus`, `SupportTicketInsert`, `SupportTicketUpdate`, `SupportTicketSchema`, `SupportTicketPayload` — all defined in Tasks 2/3 and consumed identically in Tasks 4 and 11. The component prop name `tickets` and table name `support_tickets` are consistent throughout.

Placeholder scan: no TODO / TBD / "implement later" / "similar to" references; every code-modifying step shows the full code or full diff snippet.
