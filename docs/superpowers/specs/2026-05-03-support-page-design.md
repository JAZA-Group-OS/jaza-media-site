# Support page — design spec

**Date:** 2026-05-03
**Owner:** jaza.intern@gmail.com
**Status:** Revised after Noxa Dev Team review (2026-05-03 v2). Folds in P0+P1 fixes from Jazelei, Omhar, Custodio, Franco, Gemini, Manny.

---

## 1. Goal

Wire up the `Support` slot in the site nav (currently `href="#"` in `lib/site-nav.ts`) with a real, useful Support page at `/support`. Submissions are saved to Supabase and surface in the existing admin dashboard with the same realtime + status-tracking workflow used for Partner Leads and Career Applications.

## 2. Non-goals (v1)

The following are out of scope and intentionally deferred:

- Outbound user-facing email auto-reply (no Resend / SendGrid wiring; the user gets the on-page thank-you state, no inbox confirmation)
- File attachments (no storage bucket, no magic-byte validation)
- Threaded admin replies inside the dashboard
- Public ticket lookup by ID for users
- CAPTCHA (rate limit + honeypot + Origin allowlist are sufficient for v1)
- A second auth mechanism for end users — submissions are anonymous

## 2a. Admin notification (v1, in-scope, no code change)

To enforce the "we'll reply within 2 business days" promise we make in the public copy, configure a **Supabase Database Webhook** in the project dashboard so that every `INSERT` into `support_tickets` POSTs to a Slack (or Discord) incoming-webhook URL. This is dashboard-only configuration — no application code changes — but it closes the operational gap between submission and admin awareness. Listed as a launch-checklist item in §11; not a code task in the implementation plan.

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
| Full name | yes | 2–80 chars after trim, rejects whitespace-only |
| Email | yes | RFC 5322 (Zod `z.string().email()`), max 254 chars |
| Phone | no | optional, 7–20 chars and matching `/^\+?[\d\s\-().]{7,20}$/` when present (defense-in-depth against XSS-bearing strings into admin views) |
| Topic | yes | enum (see 3.4); UI shows a disabled `Select a topic` placeholder so users actively choose |
| Subject | yes | 4–120 chars after trim |
| Message | yes | 10–2000 chars after trim; UI shows a live `(n / 2000)` counter |
| `_hp` honeypot | hidden | optional in the schema; if non-empty the API silently 200s with no DB write |

### 3.4 Topic enum
- `general` — General Inquiry
- `course_rule_of_10x` — Course Help — Rule of 10X
- `course_marketing_templates` — Course Help — Marketing Templates
- `career_application_status` — Career Application Status
- `partnership_followup` — Partnership Follow-Up
- `billing` — Billing / Payment
- `other` — Other

The pre-revision spec used a single `application_status` value covering both audiences. Splitting it removes admin-side routing ambiguity (career applicants and partner leads need different reviewers).

### 3.5 Existing surfaces to update
- `lib/site-nav.ts` — change `Support` `href` from `"#"` to `"/support"`.
- `components/footer.tsx`:
  - **Keep** the existing "Send Us Message" → `/partner-with-us` CTA (renamed to **"Partner With Us"**) so the partner funnel is not degraded.
  - **Add** a second adjacent CTA "Contact Us" → `/support` styled as a secondary outline button (border-brand-yellow, transparent fill).
  - The two CTAs sit side-by-side on desktop and stack on mobile.

## 4. API

### 4.1 Endpoint
`POST /api/support` — `app/api/support/route.ts`. Same shape as `app/api/partner/route.ts`:
- `runtime = 'nodejs'`
- `OPTIONS` handler returns CORS preflight via `handlePreflight`
- `POST` handler:
  1. Reject disallowed origin via `rejectDisallowedOrigin`
  2. Rate limit `support:${ip}` via `lib/rate-limit.ts`, **8 requests per 10 minutes** — chosen to actually be looser than partner's 5/10 (matching the original intent that support sees more legit repeat submitters: a user clarifying, then re-submitting after a typo). Tight enough to deny floods. Returns 429 with `Retry-After` and `X-RateLimit-Remaining` headers.
  3. Parse JSON body, return 400 on parse failure
  4. Validate via `SupportTicketSchema` (Zod)
  5. Honeypot check: if `_hp` is non-empty, return 200 success silently with no DB write (don't tell bots they were caught)
  6. Insert via admin Supabase client into `support_tickets`
  7. On insert error: log the error code/message only (never the row payload — PII), return 500 with generic message

### 4.2 Validation schema
New file: `lib/validations/support-ticket.ts`. Mirrors `lib/validations/partner-inquiry.ts`'s structure. Exports `SupportTicketSchema` and `SupportTicketInput` type.

### 4.3 Failure UX on the form
- Network / 5xx → inline error rendered as JSX (not a plain interpolated string) so the email is a clickable `<a href="mailto:...">` link inside the sentence: "Couldn't send your message right now. Please try again, or email us directly at <SUPPORT_EMAIL>." Critical that the mailto stays clickable — this is the user's escape hatch in the exact moment the form has failed them.
- 400 validation → field-level error messages from Zod issues (path → message map). Banner-level copy: "Check the fields marked in red." (Not "highlighted" — the fields are flagged with red text underneath, not visual highlights.)
- 429 rate limited → "You're sending messages too quickly. Please wait a few minutes and try again."
- During submit → button shows "Sending…" with `aria-busy="true"` and an inline spinner glyph; the button is `disabled` to prevent double-submit.
- On success transition → a `useEffect` calls `.focus()` on the thank-you heading so keyboard users don't lose context (WCAG 2.4.3).

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
    'career_application_status',
    'partnership_followup',
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

-- Idempotent: avoid "relation already member of publication" on re-apply.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  END IF;
END $$;
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
- **Rate limit:** `support:${ip}` via existing Upstash-backed `lib/rate-limit.ts`, `{ windowMs: 10 * 60 * 1000, max: 8 }`. Returns 429 with `Retry-After`.
- **Honeypot:** silent 200 + no DB write when `_hp` is non-empty.
- **PII handling:** server logs error code/message only; never the request body.
- **Input length caps** (above) prevent log/DB pollution from extremely large submissions.
- **RLS:** anon has zero capability on the table; only admin email JWT can read/update/delete.
- **No service-role usage on the client** — admin reads/updates use the user's authenticated session, just like the existing managers do.

## 8. Testing

### 8.1 Unit (Vitest)
- `lib/validations/support-ticket.test.ts` — schema-level coverage:
  - Valid full payload accepted; each required field missing fails with the correct Zod issue path
  - Topic enum: each defined value accepted; one unknown value rejected
  - Length **boundary** cases (off-by-one on both sides):
    - `fullName` 1 char fails, 2 chars passes, 80 passes, 81 fails
    - `phone` 6 fails, 7 passes, 20 passes, 21 fails
    - `subject` 3 fails, 4 passes, 120 passes, 121 fails
    - `message` 9 fails, 10 passes, 2000 passes, 2001 fails
    - `email` 254 chars passes, 255 fails
  - Whitespace-only `fullName` rejects after `.trim()` (not just empty string)
  - Phone format regex: rejects `<script>1234567</script>`; accepts `+1 (555) 010-0100`
  - At least one Unicode/CJK case (`"Jose Rizal — Nación"`, emoji in subject) accepted
  - `_hp` field accepted whether absent, empty, or non-empty (the schema must NOT enforce empty — the API handler does that policy)
- `app/api/support/route.test.ts` — handler-level integration tests calling the exported `POST` function directly with mocked `rateLimit` and admin Supabase client:
  - Honeypot non-empty → returns 200 with no insert call
  - Malformed JSON body → 400 with `error: 'Invalid JSON'`
  - Disallowed Origin header → 403
  - Rate-limit exceeded → 429 with `Retry-After`
  - Valid payload → 200 with `success: true` and exactly one insert call carrying the right shape
- Tests run via `npm test` (existing Vitest + jsdom setup).

### 8.2 Manual end-to-end via Playwright MCP

Use the Playwright MCP tool (`mcp__plugin_playwright_playwright__*`) to drive a real browser through the full happy path. This is a one-time verification before commit, not a persisted test in the repo.

**Setup:**
- Start dev server: `npm run dev` (in a separate background process).
- Read admin credentials from local environment, never from the spec or test code:
  - `E2E_AUTH_EMAIL` and `E2E_AUTH_PASSWORD` set in a local-only `.env.test.local` (must be in `.gitignore`). Generic var names so the file's contents aren't an enumeration roadmap.
  - Loaded via `dotenv` at test-script run time, or read directly from `process.env` if the runner already loads it.
- Generate a unique marker: `subject = "PLAYWRIGHT_E2E_" + Date.now()` so cleanup can target only test rows. Capture the exact marker string in a variable for cleanup verification.

**Steps:**
1. Navigate to `http://localhost:3000/support`.
2. Take a snapshot — confirm hero, FAQs, and contact form are visible.
3. Fill the form: name `Playwright Test`, email `playwright-e2e@jazamedia.test`, topic `General Inquiry`, subject = unique marker, message `Automated end-to-end test — safe to delete.`.
4. Submit. `browser_wait_for` the thank-you heading text "We've got your message". Take a snapshot.
5. Navigate to `http://localhost:3000/admin/login`. Sign in using env-var credentials.
6. Click the "Support Tickets" tab.
7. **`browser_wait_for` the unique marker text in the page** before any assertion (realtime delivery may lag the page render). Then verify topic, name, email, and full message render correctly when the row is expanded.
8. Change status `new → in_progress`. `browser_wait_for` the In Progress badge to appear. Then `in_progress → resolved`, wait again. Refresh the page; `browser_wait_for` the Resolved badge to confirm persistence.
9. **Cleanup:** run the one-shot service-role script (`scripts/playwright-cleanup.ts`) which executes `DELETE FROM support_tickets WHERE subject LIKE 'PLAYWRIGHT_E2E_%' RETURNING id` and prints the count deleted. The script reads `SUPABASE_SERVICE_ROLE_KEY` from `.env.test.local` and bypasses RLS.
10. Re-open the Support Tickets tab. `browser_wait_for` confirms the **exact marker subject** is no longer present (use a polling check for absence, e.g. snapshot scan).
11. **Footer regression smoke:** navigate to `http://localhost:3000/`, take a snapshot, assert all 5 social-icon `aria-label` values render in the footer (`Gmail`, `Messenger`, `Facebook`, `TikTok`, `Instagram`) — guards against the social-icons extraction silently breaking the existing footer.
12. Stop the dev server. Delete `scripts/playwright-cleanup.ts` (one-shot file, not committed).

**Pass criteria:** all 12 steps green; cleanup script's printed deletion count includes the unique marker captured in setup (not just `≥1`); dashboard confirms the exact marker row is gone; footer snapshot in step 11 shows all 5 socials.

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
- `app/api/support/route.test.ts` — Vitest integration tests for the API route (honeypot, 400, 403, 429, success)
- `scripts/playwright-cleanup.ts` (deleted after E2E run, before commit)
- `.env.test.local.example` — documents generic env vars (`E2E_AUTH_EMAIL`, `E2E_AUTH_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`)

**Modify:**
- `lib/site-nav.ts` — Support `href` → `/support`
- `lib/types/database.ts` — add `SupportTicket` types
- `components/footer.tsx` — KEEP the existing partner CTA (rename label → "Partner With Us"), ADD a second "Contact Us" → `/support` CTA next to it; consume the extracted `social-icons.tsx`
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
| User-facing email | None v1 | Resend/SendGrid is its own scope |
| Admin notification | Supabase Database Webhook → Slack/Discord on `INSERT` (dashboard config, no code) | Closes the SLA gap without building email infra; chosen after Manny's review flagged the unenforceable promise |
| Rate limit | **8 / 10min / IP** (revised from 3 to actually be looser than partner's 5/10) | Support legitimately sees 3+ repeat submissions from one user (typo, follow-up, clarification); 8 keeps headroom while denying floods |
| Footer CTA | **Keep partner CTA + add second support CTA** (revised from repoint) | Repointing would have downgraded the partner funnel — Manny's catch |
| Topic enum | **Split `application_status` into `career_application_status` and `partnership_followup`** (revised) | Removes admin routing ambiguity — Manny's catch |
| Phone validation | Add format regex to Zod schema | Defense in depth — Custodio's catch |
| Migration realtime | Wrap `ALTER PUBLICATION` in `IF NOT EXISTS` guard | Idempotency for re-runs — Omhar's catch |
| Focus rings | `focus-visible:ring-2 ring-brand-yellow ring-offset-2` (not bare border-color change) | WCAG 2.4.7 / 1.4.11 — Gemini's catch |
| Error mailto | Render as JSX `<a href="mailto:">` (not interpolated string) | Click target preserved at the worst moment — Gemini's catch |
| Verification | Manual Playwright E2E with `browser_wait_for` polls + footer regression snapshot + exact-marker cleanup verification | User-requested gate plus Franco's flake/regression hardening |

## 11. Launch checklist (operational, not code)

Items that MUST be done before linking the page from production navigation. None of these block the implementation plan from running, but the page must not be promoted publicly until they're complete.

- [ ] Replace placeholder `support@jazamedia.com` in `components/support-hero.tsx` and `components/support-contact-card.tsx` with the real support inbox address (or stand up the `support@` MX). If the address bounces, the 5xx error fallback breaks the user's last escape hatch.
- [ ] Configure Supabase Database Webhook on `INSERT` into `support_tickets` to POST to a Slack (or Discord) incoming webhook URL. Supabase dashboard → Database → Webhooks → Create. No application code involved. Test by inserting a manual row and confirming the Slack channel receives the notification.
- [ ] Confirm the Vercel project's `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars are set (otherwise rate limiter falls back to per-instance memory, which is insufficient under serverless multi-instance).
- [ ] Verify `CORS_ALLOWED_ORIGINS` includes the canonical production hostname (or relies on the `STATIC_ALLOWLIST` defaults).
- [ ] Validate the SLA copy ("2 business days" in hero subheadline + thank-you state, "3–5 business days" / "2 weeks" in FAQ entries) against current ops capacity. Adjust if the team can't realistically hit the promise.
- [ ] Sanity-check the public footer renders both CTAs ("Partner With Us" + "Contact Us") on mobile and desktop.
