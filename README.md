This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Partner With Us — booking setup (REQUIRED before deploy)

The Step 2 booking page (`/partner-with-us/book`) embeds Calendly via the
URL set by `NEXT_PUBLIC_CALENDLY_URL`. Two manual setup steps are required
in the Calendly account that owns this URL — without them, the embed
still works but the team arrives at every discovery call without the
lead's phone number or business context:

### 1. Add two Invitee Questions to the Calendly event

In the Calendly event's "Booking page" → "Invitee Questions" settings,
add **in this order**:

1. "Best contact number" — text type
2. "Tell us about your business" — long text type

Order matters: the booking page passes them as `a1` and `a2` URL params,
which Calendly maps positionally to the additional-question list.

### 2. Set the env var

Local: `cp .env.example .env.local` (the example contains the production
URL as a sane default).

Vercel: set `NEXT_PUBLIC_CALENDLY_URL` in Project Settings → Environment
Variables for Production + Preview environments. The component falls
back to a hardcoded URL if the env var is missing, but configuring it
explicitly lets you swap URLs without a redeploy.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
