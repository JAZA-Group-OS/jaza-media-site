// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/types/database';

/**
 * Admin Supabase client with Service Role Key
 *
 * ⚠️  WARNING: This client BYPASSES Row Level Security (RLS)
 *
 * USE THIS ONLY FOR:
 * - Admin operations that need to bypass RLS
 * - Seeding data
 * - Background jobs
 * - Operations where you've verified the user is an admin
 *
 * NEVER USE THIS:
 * - In client-side code
 * - In public API routes without proper authentication
 * - For regular user operations
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Creates a Supabase admin client that bypasses RLS
 *
 * @throws {Error} If SUPABASE_SERVICE_ROLE_KEY is not configured
 *
 * @example
 * // In a protected Server Action after verifying admin
 * const adminClient = createAdminClient()
 * await adminClient.from('bookings').delete().eq('id', bookingId)
 */
export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
        'This is required for admin operations. ' +
        'Get it from your Supabase dashboard: Settings > API > service_role key',
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
