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

-- Reuse public.set_updated_at() created by the partner_inquiries migration.
-- That migration must be applied before this one. Running in isolation will
-- fail with "function public.set_updated_at() does not exist".
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
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  END IF;
END $$;
