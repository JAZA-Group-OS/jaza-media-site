-- Secure career_resumes / career_portfolios buckets.
--
-- The original migration created both buckets as PUBLIC and granted anon
-- INSERT + SELECT — this meant anyone on the internet could enumerate every
-- applicant's resume/portfolio file by guessing the timestamp-filename key
-- format. The API route uses the service role to write, so the anon policies
-- were never required for the intended flow.
--
-- This migration:
--   1) flips both buckets to private
--   2) drops the anon INSERT and anon SELECT policies
--   3) adds an admin-email-only SELECT policy so the dashboard can still
--      issue signed URLs for the assigned admin
--
-- After this migration, file URLs stored as Storage public URLs stop
-- working. The admin dashboard will read each file via
-- `supabase.storage.from(bucket).createSignedUrl(path, 3600)` instead.

UPDATE storage.buckets SET public = false WHERE id = 'career_resumes';
UPDATE storage.buckets SET public = false WHERE id = 'career_portfolios';

DROP POLICY IF EXISTS "Anyone can upload career resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload career portfolios" ON storage.objects;
DROP POLICY IF EXISTS "Public can read career resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public can read career portfolios" ON storage.objects;

CREATE POLICY "Admin can read career resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'career_resumes'
    AND (auth.jwt() ->> 'email') = 'jaza.intern@gmail.com'
  );

CREATE POLICY "Admin can read career portfolios"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'career_portfolios'
    AND (auth.jwt() ->> 'email') = 'jaza.intern@gmail.com'
  );
