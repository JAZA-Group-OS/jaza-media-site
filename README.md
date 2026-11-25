This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Partner With Us — built-in booking (replaces Calendly)

Step 2 (`/partner-with-us/book`) uses JAZA's own booking system:
`lib/booking/*`, `app/api/booking/*`, admin tab **Discovery Calls**.

Setup:

1. **Database** — run `supabase/migrations/20261125000000_create_booking_system.sql`
   in the Supabase SQL editor, plus the pg_cron job that POSTs to
   `/api/booking/reminders` every 5 minutes with
   `Authorization: Bearer $BOOKING_CRON_SECRET`.
2. **Env vars (Vercel)** — `BOOKING_CRON_SECRET`, `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SITE_URL`.
3. **Google** — create an OAuth client (Web) in Google Cloud with the Calendar
   API enabled; authorised redirect URI:
   `https://admin.<domain>/api/booking/google/callback`. Then in the admin
   dashboard → Discovery Calls → **Connect Google Calendar**.

Without Google connected, bookings still work (no Meet link, no busy-time sync).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
