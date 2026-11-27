-- Book a Call: two calendars (1 = CEO, 2 = Sales team) + lead scoring.
-- Leads answer 5 questions on /book-a-call; the server scores them and
-- routes to the CEO calendar, the Sales calendar, or auto-nurture (no call).

-- 1) Allow a second settings row and name each calendar.
ALTER TABLE public.booking_settings DROP CONSTRAINT IF EXISTS booking_settings_id_check;
ALTER TABLE public.booking_settings ADD CONSTRAINT booking_settings_id_check CHECK (id IN (1, 2));
ALTER TABLE public.booking_settings ADD COLUMN IF NOT EXISTS label text;
UPDATE public.booking_settings SET label = 'CEO' WHERE id = 1 AND label IS NULL;
-- Sales calendar starts as a copy of the CEO hours/rules, without Google.
INSERT INTO public.booking_settings (id, label, timezone, slot_minutes, buffer_minutes, min_notice_hours, max_days_ahead, weekly_hours, host_email, google_calendar_id)
SELECT 2, 'Sales team', timezone, slot_minutes, buffer_minutes, min_notice_hours, max_days_ahead, weekly_hours, host_email, 'primary'
FROM public.booking_settings WHERE id = 1
ON CONFLICT (id) DO NOTHING;

-- 2) Every booking belongs to one calendar; overlaps are only blocked within a calendar.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS calendar_id smallint NOT NULL DEFAULT 1 REFERENCES public.booking_settings(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS lead_id uuid;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
  calendar_id WITH =,
  tstzrange(start_at, end_at) WITH &&
) WHERE (status = 'confirmed');

-- 3) Every Book a Call form submission, booked or not.
CREATE TABLE IF NOT EXISTS public.booking_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  service text NOT NULL,
  company_size text NOT NULL,
  budget text NOT NULL,
  start_when text NOT NULL,
  decision_maker text NOT NULL,
  score int NOT NULL,
  tier text NOT NULL CHECK (tier IN ('ceo', 'sales', 'nurture')),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booking_leads_created ON public.booking_leads (created_at DESC);
ALTER TABLE public.booking_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admin email can read booking leads"
  ON public.booking_leads FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

-- 4) Two paths: "Book with CEO" (paid via GCash, no questions) or "Book with Sales team" (questions).
ALTER TABLE public.booking_leads ADD COLUMN IF NOT EXISTS path text NOT NULL DEFAULT 'sales' CHECK (path IN ('ceo', 'sales'));
ALTER TABLE public.booking_leads ADD COLUMN IF NOT EXISTS payment_ref text;
ALTER TABLE public.booking_leads ALTER COLUMN service DROP NOT NULL;
ALTER TABLE public.booking_leads ALTER COLUMN company_size DROP NOT NULL;
ALTER TABLE public.booking_leads ALTER COLUMN budget DROP NOT NULL;
ALTER TABLE public.booking_leads ALTER COLUMN start_when DROP NOT NULL;
ALTER TABLE public.booking_leads ALTER COLUMN decision_maker DROP NOT NULL;
