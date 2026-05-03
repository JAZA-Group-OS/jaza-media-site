# Support page — design spec

**Date:** 2026-05-03
**Owner:** jaza.intern@gmail.com
**Status:** Approved (pending user spec review)

---

## 1. Goal

Wire up the `Support` slot in the site nav (currently `href="#"` in `lib/site-nav.ts`) with a real, useful Support page at `/support`. Submissions are saved to Supabase and surface in the existing admin dashboard with the same realtime + status-tracking workflow used for Partner Leads and Career Applications.

## 2. Non-goals (v1)

The following are out of scope and intentionally deferred:

- Email auto-reply / outbound notifications (no Resend / SendGrid wiring)
- File attachments (no storage bucket, no magic-byte validation)
- Threaded admin replies inside the dashboard
- Public ticket lookup by ID for users
- CAPTCHA (rate limit + honeypot + Origin allowlist are sufficient for v1)
- A second auth mechanism for end users — submissions are anonymous

## 3. User-facing surface

### 3.1 Route
New public route: `app/support/page.tsx`. Server-rendered; client components only where interactivity is needed (form, FAQ accordion).

### 3.2 Page composition
1. `AnnouncementBanner` (existing)
2. `Navbar` (existing)
3. `SupportHero` — new component. Headline "How can we help?", short sub-headline, and a contact strip:
   - Email link (`support@jazamedia.com` — replace with the real address before launch; placeholder in code)
   - Social icons (reuse the icon SVGs already in `components/footer.tsx` — extract to `components/social-icons.tsx` so footer and Support page share them; existing footer hrefs that are still `#` stay `#` for now)
4. `SupportFaqs` — new component. Accordion of operational questions, distinct from the home page FAQ. Headline "Help & FAQs". 6–8 entries spanning course access, application status, partnership follow-up, billing.
5. `SupportContactCard` — new component. "Still need help?" headline + contact form. On successful submit, swap form for an inline thank-you state ("We've got your message. We'll reply within 2 business days.") with a button to submit another.
6. `Footer` (existing)
7. `CopyrightBar` (existing)

### 3.3 Form fields
| Field | Required | Validation |
|---|---|---|
| Full name | yes | 2–80 chars |
| Email | yes | RFC 5322 (Zod `z.string().email()`) |
| Phone | no | optional, 7–20 chars when present |
| Topic | yes | enum (see 3.4) |
| Subject | yes | 4–120 chars |
| Message | yes | 10–2000 chars |
| `_hp` honeypot | hidden | must be empty |

### 3.4 Topic enum
- `general` — General Inquiry
- `course_rule_of_10x` — Course Help — Rule of 10X
- `course_marketing_templates` — Course Help — Marketing Templates
- `application_status` — Application / Partnership Status
- `billing` — Billing / Payment
- `other` — Other

### 3.5 Existing surfaces to update
- `lib/site-nav.ts` — change `Support` `href` from `"#"` to `"/support"`.
- `components/footer.tsx` — change "Send Us Message" CTA `href` from `/partner-with-us` to `/support`.

## 4. API

### 4.1 Endpoint
`POST /api/support` — `app/api/support/route.ts`. Same shape as `app/api/partner/route.ts`:
- `runtime = 'nodejs'`
- `OPTIONS` handler returns CORS preflight via `handlePreflight`
- `POST` handler:
  1. Reject disallowed origin via `rejectDisallowedOrigin`
  2. Rate limit `support:${ip}` via `lib/rate-limit.ts`, **3 requests per 10 minutes** (looser than partner's 5/10 because support legitimately gets repeat submitters; tight enough to block spam)
  3. Parse JSON body, return 400 on parse failure
  4. Validate via `SupportTicketSchema` (Zod)
  5. Honeypot check: if `_hp` is non-empty, return 200 success silently with no DB write (don't tell bots they were caught)
  6. Insert via admin Supabase client into `support_tickets`
  7. On insert error: log the error code/message only (never the row payload — PII), return 500 with generic message

### 4.2 Validation schema
New file: `lib/validations/support-ticket.ts`. Mirrors `lib/validations/partner-inquiry.ts`'s structure. Exports `SupportTicketSchema` and `SupportTicketInput` type.

### 4.3 Failure UX on the form
- Network / 5xx → inline error: "Couldn't send your message right now. Please try again, or email us directly at support@jazamedia.com." with a `mailto:` link as fallback.
- 400 validation → field-level error messages from Zod issues (path → message map).
- 429 rate limited → "You're sending messages too quickly. Please wait a few minutes and try again."

## 5. Data model

### 5.1 Table
New migration: `supabase/migrations/20260503000000_create_support_tickets.sql`.

```sql
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

No DELETE policy in v1 — there's no admin UI surface that calls delete, so YAGNI. The Playwright cleanup step deletes its own test rows via a one-shot service-role script (see 8.2), which bypasses RLS independently of the policy set. If we ever add "delete ticket" to the admin UI, add the policy then.

### 5.2 TypeScript types
Add to `lib/types/database.ts`:
- `SupportTicket` row type
- `SupportTicketInsert` insert type
- `SupportTicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed'`
- `SupportTopic` enum union

## 6. Admin dashboard integration

### 6.1 Navigation
`components/admin/admin-navigation.tsx` — add menu item:
```ts
{ id: 'support', label: 'Support Tickets', icon: LifeBuoy }
```
(`LifeBuoy` from `lucide-react`.)

### 6.2 Dashboard page
`app/(admin)/admin/dashboard/page.tsx` — extend `DashboardTab` union with `'support'`, add render branch.

### 6.3 Manager component
New file: `components/admin/support-tickets-manager.tsx`. Pattern-copy `components/admin/partner-leads-manager.tsx`:
- Realtime data via `useRealtimeTable<SupportTicket>('support_tickets')`
- Filter tabs: All / New / In Progress / Resolved / Closed (same pill pattern, with counts)
- Expandable rows showing `subject`, full `message`, topic label (human-readable), contact info, created_at
- Status dropdown per row to update via Supabase client (RLS allows it)
- Loading skeleton + error states matching existing managers

## 7. Validation, security, error handling

- **Origin allowlist:** reuse `lib/cors.ts` — rejects requests from disallowed origins.
- **Rate limit:** `support:${ip}` via existing Upstash-backed `lib/rate-limit.ts`, `{ windowMs: 10 * 60 * 1000, max: 3 }`. Returns 429 with `Retry-After`.
- **Honeypot:** silent 200 + no DB write when `_hp` is non-empty.
- **PII handling:** server logs error code/message only; never the request body.
- **Input length caps** (above) prevent log/DB pollution from extremely large submissions.
- **RLS:** anon has zero capability on the table; only admin email JWT can read/update/delete.
- **No service-role usage on the client** — admin reads/updates use the user's authenticated session, just like the existing managers do.

## 8. Testing

### 8.1 Unit (Vitest)
- `lib/validations/support-ticket.test.ts` — valid payload passes; each required field missing fails with the right path; topic enum boundaries; length caps (subject > 120 chars rejects, message > 2000 rejects, name < 2 rejects, etc.); empty `_hp` accepted, the schema allows the field optionally.
- Tests run via `npm test` (existing Vitest setup).

### 8.2 Manual end-to-end via Playwright MCP

Use the Playwright MCP tool (`mcp__plugin_playwright_playwright__*`) to drive a real browser through the full happy path. This is a one-time verification before commit, not a persisted test in the repo.

**Setup:**
- Start dev server: `npm run dev` (in a separate background process).
- Read admin credentials from local environment, never from the spec or test code:
  - `PLAYWRIGHT_ADMIN_EMAIL` and `PLAYWRIGHT_ADMIN_PASSWORD` set in a local-only `.env.test.local` (must be in `.gitignore`).
  - Loaded via `dotenv` at test-script run time, or read directly from `process.env` if the runner already loads it.
- Generate a unique marker: `subject = "PLAYWRIGHT_E2E_" + Date.now()` so cleanup can target only test rows.

**Steps:**
1. Navigate to `http://localhost:3000/support`.
2. Take a snapshot — confirm hero, FAQs, and contact form are visible.
3. Fill the form: name `Playwright Test`, email `playwright-e2e@jazamedia.test`, topic `General Inquiry`, subject = unique marker, message `Automated end-to-end test — safe to delete.`.
4. Submit. Confirm inline thank-you state appears.
5. Navigate to `http://localhost:3000/admin/login`. Sign in using env-var credentials.
6. Click the "Support Tickets" tab.
7. Locate the row whose subject matches the unique marker. Verify topic, name, email, and full message render correctly when the row is expanded.
8. Change status `new → in_progress`, then `in_progress → resolved`. Refresh the page; confirm the latest status persisted.
9. **Cleanup:** still authenticated as admin, run a Supabase delete via the in-page session — easiest path is to add a temporary one-shot admin cleanup script (`scripts/playwright-cleanup.ts`) that uses the service-role key (read from env) to `DELETE FROM support_tickets WHERE subject LIKE 'PLAYWRIGHT_E2E_%'` and prints the count deleted. Run it after the Playwright run.
10. Re-open the Support Tickets tab and verify the marker row is gone.
11. Stop the dev server.

**Pass criteria:** all 11 steps green, cleanup reports ≥1 row deleted, dashboard shows the row gone.

**Commit gate:** do not run `git commit` on the implementation until the manual Playwright run is fully green and cleanup has verified zero leftover test rows.

### 8.3 Build / lint gates
- `npm run lint` clean
- `npm run build` succeeds
- `npm test` clean

## 9. Files to create / change

**Create:**
- `app/support/page.tsx`
- `app/api/support/route.ts`
- `components/support-hero.tsx`
- `components/support-faqs.tsx`
- `components/support-contact-card.tsx`
- `components/social-icons.tsx` (extracted from footer for reuse)
- `components/admin/support-tickets-manager.tsx`
- `lib/validations/support-ticket.ts`
- `lib/validations/support-ticket.test.ts`
- `supabase/migrations/20260503000000_create_support_tickets.sql`
- `scripts/playwright-cleanup.ts` (deleted after E2E run, before commit)
- `.env.test.local.example` — documents `PLAYWRIGHT_ADMIN_EMAIL` / `PLAYWRIGHT_ADMIN_PASSWORD` env vars

**Modify:**
- `lib/site-nav.ts` — Support `href` → `/support`
- `lib/types/database.ts` — add `SupportTicket` types
- `components/footer.tsx` — "Send Us Message" CTA `href` → `/support`; consume the extracted `social-icons.tsx`
- `components/admin/admin-navigation.tsx` — add Support Tickets menu item
- `app/(admin)/admin/dashboard/page.tsx` — add `'support'` tab + render branch
- `.gitignore` — ensure `.env.test.local` is ignored

## 10. Decisions log

| Decision | Choice | Reason |
|---|---|---|
| Form scope | Unified topic dropdown (Q1 option D) | Matches real-world support page UX; one URL; admin filters by topic |
| Admin sync | Full Supabase realtime + dashboard tab (Q2 option A) | Reuses established pattern; near-zero new architecture |
| Layout | FAQ-first, form below (Q3 option A) | Self-service deflection; fewer trivial tickets |
| FAQ duplication | Two FAQs serving different audiences (Q4-followup option A) | Home FAQ = marketing; Support FAQ = operational. No overlap. |
| Auth on form | Anonymous | Matches Partner / Careers / Course forms |
| Attachments | None v1 | Adds storage + RLS + magic-byte validation; not justified |
| Email | None v1 | Email infra (Resend/SendGrid) is its own scope |
| Rate limit | 3 / 10min / IP | Looser than partner's 5/10 because support gets more legit repeat submitters |
| Footer CTA | Repoint to `/support` | Button label "Send Us Message" matches Support better than Partner |
| Verification | Manual Playwright E2E with cleanup before commit | User-requested gate; ensures no stale test data |
