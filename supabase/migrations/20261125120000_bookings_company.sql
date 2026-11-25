-- Optional company / brand name on bookings (shown in emails + admin).
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS company text;
