-- Enable Supabase Realtime broadcast for the three lead tables so the admin
-- dashboard receives INSERT/UPDATE events as new submissions arrive.
--
-- Realtime in Supabase works by adding tables to the supabase_realtime
-- publication. RLS still applies to the broadcast: subscribers only receive
-- rows they are allowed to SELECT, which on these tables is restricted to
-- the admin email (see the policies created by each table's migration).
--
-- Idempotent: silently no-ops if the table is already in the publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'partner_inquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_inquiries;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'career_applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.career_applications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'course_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.course_requests;
  END IF;
END $$;
