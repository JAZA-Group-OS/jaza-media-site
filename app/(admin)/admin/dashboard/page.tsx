import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/admin/config';
import AdminDashboardClient from './dashboard-client';

// Authoritative server-side admin gate (defense-in-depth). Even if the proxy
// is ever bypassed — a matcher misconfiguration, or a future Next.js release
// dropping the deprecated convention — the dashboard HTML/RSC is never served
// to a non-admin session. Runs before any client JS ships.
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ booking_google?: string; tab?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email !== ADMIN_EMAIL) {
    // On the admin subdomain this resolves to the login page; the proxy leaves
    // /admin/login ungated so there's no redirect loop.
    redirect('/admin/login');
  }

  // Returning from the Google Calendar connect flow → open the Discovery Calls tab.
  // ?tab=support deep-links straight to the Support Desk.
  const { booking_google, tab } = await searchParams;
  const initialTab = booking_google ? 'bookings' : tab === 'support' ? 'support' : 'overview';
  return <AdminDashboardClient initialTab={initialTab} />;
}
