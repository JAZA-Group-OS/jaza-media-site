-- course_requests
-- Stores claim submissions from /courses/[slug] (the "Take this Course" CTA
-- on the home page's FREE ADVANCE MARKETING section). One row per claim;
-- the API route also fires off the course-delivery email best-effort.

CREATE TABLE IF NOT EXISTS public.course_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  course_slug text NOT NULL CHECK (course_slug IN ('marketing', 'lead-generation')),

  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,

  email_sent_at timestamptz,
  email_error text,

  source text NOT NULL DEFAULT 'courses_site',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_requests_created_at
  ON public.course_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_requests_course_slug
  ON public.course_requests (course_slug);
CREATE INDEX IF NOT EXISTS idx_course_requests_email
  ON public.course_requests (email);

-- RLS — anon cannot read. Service role bypasses RLS for the API route.
-- Authenticated admin can read + update.
ALTER TABLE public.course_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin email can read course requests"
  ON public.course_requests FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

CREATE POLICY "Only admin email can update course requests"
  ON public.course_requests FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

-- Reuse the public.set_updated_at() function created by the
-- partner_inquiries migration (CREATE OR REPLACE there means it's safe to
-- assume the function exists). If running this migration in isolation, the
-- partner_inquiries migration must be applied first.
DROP TRIGGER IF EXISTS course_requests_set_updated_at
  ON public.course_requests;
CREATE TRIGGER course_requests_set_updated_at
  BEFORE UPDATE ON public.course_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
