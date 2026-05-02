-- Restructure course_requests for the multi-step REQUEST FORM:
--   - Both course cards ("Marketing Course" + "Lead Generation Course") now
--     share a single funnel slug "rule-of-10x". The user chooses the actual
--     asset (10X Marketing vs 10X Advertising) on step 5.
--   - Templates funnel keeps slug "marketing-templates" with 4 template
--     options on step 5.
--
-- New columns capture the multi-step form data:
--   - shipping_*        — physical shipping address (5 fields)
--   - selected_asset    — what they chose on step 5
--
-- Both old slugs ('marketing', 'lead-generation') are removed from the CHECK.
-- Pre-existing rows with those slugs were intentionally cleaned out before
-- this migration (see the "remove mock data" cleanup), so the constraint
-- swap is safe without backfill.

-- 1) Replace the slug CHECK to the new two-value enum.
ALTER TABLE public.course_requests
  DROP CONSTRAINT IF EXISTS course_requests_course_slug_check;

ALTER TABLE public.course_requests
  ADD CONSTRAINT course_requests_course_slug_check
  CHECK (course_slug IN ('rule-of-10x', 'marketing-templates'));

-- 2) Add new fields. Empty-string DEFAULT lets the ALTER succeed even on a
-- non-empty table (PG14 supports volatile defaults but we go conservative
-- here). The default is dropped immediately afterward so future inserts
-- must supply real values via the API/zod layer.
ALTER TABLE public.course_requests
  ADD COLUMN IF NOT EXISTS shipping_street text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_state text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_country text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_postal text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS selected_asset text NOT NULL DEFAULT '';

ALTER TABLE public.course_requests
  ALTER COLUMN shipping_street  DROP DEFAULT,
  ALTER COLUMN shipping_city    DROP DEFAULT,
  ALTER COLUMN shipping_state   DROP DEFAULT,
  ALTER COLUMN shipping_country DROP DEFAULT,
  ALTER COLUMN shipping_postal  DROP DEFAULT,
  ALTER COLUMN selected_asset   DROP DEFAULT;
