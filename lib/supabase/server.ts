import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

/**
 * Server-side Supabase client (cookie-aware, can refresh sessions).
 *
 * USE IN: Server Components, Server Actions, API Route Handlers.
 *
 * The cookie set/remove operations are best-effort — Next.js may not allow
 * mutating cookies from a pure Server Component, but the SSR client tries
 * gracefully and continues.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component contexts can't write cookies — middleware/route
            // handlers will refresh on the next request.
          }
        },
      },
    },
  );
}

/**
 * Public-data Supabase client without session context.
 * Use for fetching data that doesn't depend on the user's session.
 */
export function createServerClientWithoutCookies() {
  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}
