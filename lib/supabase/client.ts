import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database';

/**
 * Browser-side Supabase client.
 * Uses cookies (not localStorage) so the session is readable by Server Components,
 * middleware, and Route Handlers — required for server-side auth gating.
 *
 * USE IN: Client Components, event handlers, custom hooks.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.',
  );
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
