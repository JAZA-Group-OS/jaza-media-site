-- support desk
-- Turns public.support_tickets (messages from the site's /support form) into
-- desk tickets: a human ticket number, a priority, an assignee, and an
-- internal notes/activity thread for the admin.
--
-- Safe for the existing form: every new column has a default or is nullable,
-- so /api/support's INSERT keeps working unchanged.
-- Re-runnable (IF NOT EXISTS / DROP ... IF EXISTS throughout).

-- 1) Ticket number: JM-1, JM-2 ... backfilled in submission order.
CREATE SEQUENCE IF NOT EXISTS public.support_ticket_number_seq;

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS number bigint;

WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS n
  FROM public.support_tickets
  WHERE number IS NULL
)
UPDATE public.support_tickets t
SET number = o.n + COALESCE((SELECT max(number) FROM public.support_tickets), 0)
FROM ordered o
WHERE t.id = o.id;

SELECT setval(
  'public.support_ticket_number_seq',
  GREATEST(COALESCE((SELECT max(number) FROM public.support_tickets), 0), 1),
  (SELECT count(*) > 0 FROM public.support_tickets WHERE number IS NOT NULL)
);

ALTER TABLE public.support_tickets
  ALTER COLUMN number SET DEFAULT nextval('public.support_ticket_number_seq'),
  ALTER COLUMN number SET NOT NULL;
ALTER SEQUENCE public.support_ticket_number_seq OWNED BY public.support_tickets.number;

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_number
  ON public.support_tickets (number);

-- 2) Priority and assignee.
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assignee text;

ALTER TABLE public.support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_priority_check;
ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_priority_check
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

CREATE INDEX IF NOT EXISTS idx_support_tickets_priority
  ON public.support_tickets (priority);

-- 3) Internal thread: admin notes/replies and change events.
CREATE TABLE IF NOT EXISTS public.support_ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'note' CHECK (kind IN ('note', 'event')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  author_email text NOT NULL DEFAULT (auth.jwt() ->> 'email'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket
  ON public.support_ticket_comments (ticket_id, created_at);

ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;

-- Same admin-email pin as support_tickets (see lib/admin/config.ts).
DROP POLICY IF EXISTS "Only admin email can read support ticket comments"
  ON public.support_ticket_comments;
CREATE POLICY "Only admin email can read support ticket comments"
  ON public.support_ticket_comments FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

DROP POLICY IF EXISTS "Only admin email can add support ticket comments"
  ON public.support_ticket_comments;
CREATE POLICY "Only admin email can add support ticket comments"
  ON public.support_ticket_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'jaza.intern@gmail.com'
    AND author_email = (auth.jwt() ->> 'email')
  );

-- Live updates for the desk's thread.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'support_ticket_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_ticket_comments;
  END IF;
END $$;
