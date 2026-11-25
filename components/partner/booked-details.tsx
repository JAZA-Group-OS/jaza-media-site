'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Shows the booked time (in the visitor's own timezone) and the manage link
// on /partner-with-us/booked. Renders nothing when opened without params.
export function BookedDetails() {
  const params = useSearchParams();
  const start = params.get('start');
  const token = params.get('token');
  if (!start || Number.isNaN(Date.parse(start))) return null;
  const when = new Date(start).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 px-6 py-5">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-neutral-600 uppercase">Your call</p>
      <p className="mt-2 text-lg font-bold text-brand-black">{when}</p>
      {token && (
        <Link href={`/partner-with-us/manage?token=${encodeURIComponent(token)}`} className="mt-2 inline-block text-sm text-neutral-700 underline hover:text-brand-black">
          Reschedule or cancel
        </Link>
      )}
    </div>
  );
}
