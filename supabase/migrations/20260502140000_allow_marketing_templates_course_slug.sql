-- Widen the course_slug CHECK constraint on course_requests so it accepts
-- the new 'marketing-templates' lead magnet alongside the two courses.

ALTER TABLE public.course_requests
  DROP CONSTRAINT IF EXISTS course_requests_course_slug_check;

ALTER TABLE public.course_requests
  ADD CONSTRAINT course_requests_course_slug_check
  CHECK (course_slug IN ('marketing', 'lead-generation', 'marketing-templates'));
