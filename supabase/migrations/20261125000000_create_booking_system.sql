-- Built-in discovery-call booking (replaces Calendly).
-- One host. Settings live in a single row (id = 1). All writes from the public
-- site go through server routes using the service-role key; RLS only lets the
-- admin email read from the dashboard.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.booking_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  timezone text NOT NULL DEFAULT 'Asia/Manila',
  slot_minutes int NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 10 AND 240),
  buffer_minutes int NOT NULL DEFAULT 15 CHECK (buffer_minutes BETWEEN 0 AND 120),
  min_notice_hours int NOT NULL DEFAULT 12 CHECK (min_notice_hours BETWEEN 0 AND 336),
  max_days_ahead int NOT NULL DEFAULT 30 CHECK (max_days_ahead BETWEEN 1 AND 180),
  -- {"1":[["09:00","17:00"]], ...}  keys 0 = Sunday … 6 = Saturday, host timezone
  weekly_hours jsonb NOT NULL DEFAULT '{"1":[["09:00","17:00"]],"2":[["09:00","17:00"]],"3":[["09:00","17:00"]],"4":[["09:00","17:00"]],"5":[["09:00","17:00"]]}'::jsonb,
  host_email text,
  google_refresh_token text,
  google_calendar_id text NOT NULL DEFAULT 'primary',
  google_account_email text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.booking_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.booking_days_off (
  day date PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  description text,
  invitee_timezone text,
  manage_token text NOT NULL UNIQUE,
  google_event_id text,
  meet_url text,
  reminder_24h_sent_at timestamptz,
  reminder_1h_sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at > start_at),
  -- No double-booking: two confirmed bookings can never overlap.
  CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE INDEX IF NOT EXISTS idx_bookings_start ON public.bookings (start_at);

ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_days_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin email can read bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'jaza.intern@gmail.com');

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
