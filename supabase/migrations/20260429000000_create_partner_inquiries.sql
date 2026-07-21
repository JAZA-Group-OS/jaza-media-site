-- partner_inquiries
-- Stores submissions from the marketing site's qualification funnel.
-- Captures all 12 funnel fields plus the computed qualification outcome.

CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,

  -- Business profile (12-question funnel fields)
  location text,
  business_type text,
  business_description text,
  help_type text,
  monthly_revenue text,
  challenge text,

  -- Investment signals
  willing_to_invest text,
  budget text,
  timeline text,

  -- Qualification result computed from disqualifier rules
  outcome text NOT NULL CHECK (outcome IN ('qualified', 'not_qualified')),

  -- Admin workflow state
  follow_up_status text NOT NULL DEFAULT 'new'
    CHECK (follow_up_status IN ('new', 'contacted', 'closed')),
  admin_notes text,

  -- Tracking
  source text NOT NULL DEFAULT 'marketing_site',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_inquiries_created_at
  ON public.partner_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_inquiries_outcome
  ON public.partner_inquiries (outcome);
CREATE INDEX IF NOT EXISTS idx_partner_inquiries_follow_up_status
  ON public.partner_inquiries (follow_up_status);

-- RLS — anon cannot insert/read. Service role bypasses RLS for the API route.
-- Authenticated users (admins) can read and update.
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;

-- Restrict to the specific admin email. Replace with a custom claim check
-- (e.g. auth.jwt()->'app_metadata'->>'role') if multiple admins are added later.
CREATE POLICY "Only admin email can read inquiries"
  ON public.partner_inquiries FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

CREATE POLICY "Only admin email can update inquiries"
  ON public.partner_inquiries FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

-- Auto-bump updated_at on UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS partner_inquiries_set_updated_at ON public.partner_inquiries;
CREATE TRIGGER partner_inquiries_set_updated_at
  BEFORE UPDATE ON public.partner_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
