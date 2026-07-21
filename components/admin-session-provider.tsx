'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * Client-side BACKUP gate. Its only job is to avoid a flash of dashboard UI
 * before the authoritative server checks have run, and to bounce the user to
 * /login the moment their session ends (e.g. logout in another tab).
 *
 * The authoritative admin checks live server-side: the proxy gates the
 * subdomain on the admin email, the dashboard Server Component re-verifies
 * the session, and Supabase RLS scopes every row to the admin. This component
 * therefore checks only for a VALID SESSION — it deliberately does not know
 * the admin email, so that address never ships in the public JS bundle.
 */
export default function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session) {
        router.replace('/login');
        return;
      }
      setChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#FFB829] border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
