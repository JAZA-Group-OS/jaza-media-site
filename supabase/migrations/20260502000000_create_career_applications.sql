-- career_applications
-- Stores submissions from the /careers/apply qualification funnel.

CREATE TABLE IF NOT EXISTS public.career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  facebook text,

  -- Qualification fields
  location text NOT NULL CHECK (location IN ('luzon', 'visayas', 'mindanao')),
  position text NOT NULL CHECK (position IN (
    'advertiser',
    'sales_closer',
    'social_media_manager',
    'graphic_artist',
    'video_editor',
    'other'
  )),
  description text NOT NULL,

  -- Uploaded file references (Supabase Storage public URLs)
  resume_url text NOT NULL,
  resume_filename text NOT NULL,
  resume_size_bytes integer NOT NULL,
  resume_mime_type text NOT NULL,

  portfolio_url text NOT NULL,
  portfolio_filename text NOT NULL,
  portfolio_size_bytes integer NOT NULL,
  portfolio_mime_type text NOT NULL,

  -- Admin workflow state
  follow_up_status text NOT NULL DEFAULT 'new'
    CHECK (follow_up_status IN ('new', 'contacted', 'closed')),
  admin_notes text,

  -- Tracking
  source text NOT NULL DEFAULT 'careers_site',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_applications_created_at
  ON public.career_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_applications_position
  ON public.career_applications (position);
CREATE INDEX IF NOT EXISTS idx_career_applications_follow_up_status
  ON public.career_applications (follow_up_status);

-- RLS — anon cannot insert/read. Service role bypasses RLS for the API route.
-- Authenticated admin can read and update.
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin email can read career applications"
  ON public.career_applications FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

CREATE POLICY "Only admin email can update career applications"
  ON public.career_applications FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

-- Reuse the public.set_updated_at() trigger function created by the
-- partner_inquiries migration (CREATE OR REPLACE there means it's safe to
-- assume the function exists). If running this migration in isolation, the
-- partner_inquiries migration must be applied first.
DROP TRIGGER IF EXISTS career_applications_set_updated_at
  ON public.career_applications;
CREATE TRIGGER career_applications_set_updated_at
  BEFORE UPDATE ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Storage buckets
-- Files are stored in two PUBLIC buckets so the admin dashboard can
-- preview/download via the saved URL without signed-URL plumbing. Both
-- buckets have insert/select policies scoped to anonymous + admin so the
-- careers funnel can upload without auth.
INSERT INTO storage.buckets (id, name, public)
  VALUES ('career_resumes', 'career_resumes', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('career_portfolios', 'career_portfolios', true)
  ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload (the API route is the only writer; it uses the
-- service role which bypasses RLS regardless, but having an explicit policy
-- documents intent and lets a future direct-upload flow use anon keys).
CREATE POLICY "Anyone can upload career resumes"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'career_resumes');

CREATE POLICY "Anyone can upload career portfolios"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'career_portfolios');

CREATE POLICY "Public can read career resumes"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'career_resumes');

CREATE POLICY "Public can read career portfolios"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'career_portfolios');
