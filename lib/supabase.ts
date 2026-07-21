// lib/supabase.ts
/**
 * Supabase Client - Backwards Compatibility Export
 *
 * This file maintains backwards compatibility with existing code that imports
 * from '@/lib/supabase'. New code should import from '@/lib/supabase/client'
 * or '@/lib/supabase/server' directly.
 *
 * MIGRATION GUIDE:
 * ----------------
 * Old: import { supabase } from '@/lib/supabase'
 * New: import { supabase } from '@/lib/supabase/client'
 *
 * For Server Components/Actions:
 * import { createServerClient } from '@/lib/supabase/server'
 * const supabase = await createServerClient()
 */

// Re-export the browser client for backwards compatibility
export { supabase } from './supabase/client';

// Also export server utilities for convenience
export {
  createServerClient,
  createServerClientWithoutCookies,
} from './supabase/server';
export { createAdminClient } from './supabase/admin';
