-- Add phone to course_requests so the admin can actually call people who
-- claimed a lead magnet. Nullable so the rows captured before this change
-- still satisfy the schema; new submissions require phone via the zod
-- schema in lib/validations/course-request.ts.

ALTER TABLE public.course_requests
  ADD COLUMN IF NOT EXISTS phone text;
