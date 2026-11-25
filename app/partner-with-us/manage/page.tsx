import type { Metadata } from 'next';

import { ManageBooking } from '@/components/partner/manage-booking';

export const metadata: Metadata = {
  title: 'Manage Your Call — JAZA Media',
  robots: { index: false, follow: false },
};

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <ManageBooking token={token ?? ''} />;
}
