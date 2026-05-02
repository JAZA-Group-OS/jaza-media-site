-- Add follow-up workflow columns to course_requests so admins can track
-- which leads they've already called/contacted from the dashboard.

ALTER TABLE public.course_requests
  ADD COLUMN IF NOT EXISTS follow_up_status text NOT NULL DEFAULT 'new'
    CHECK (follow_up_status IN ('new', 'contacted', 'closed')),
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS idx_course_requests_follow_up_status
  ON public.course_requests (follow_up_status);
