// lib/supabase/index.ts
/**
 * Supabase Client Exports
 *
 * This file provides a central export point for all Supabase clients.
 *
 * WHICH CLIENT TO USE:
 *
 * 1. Client Components ("use client"):
 *    import { supabase } from '@/lib/supabase/client'
 *
 * 2. Server Components / Server Actions:
 *    import { createServerClient } from '@/lib/supabase/server'
 *    const supabase = await createServerClient()
 *
 * 3. Admin operations (bypasses RLS):
 *    import { createAdminClient } from '@/lib/supabase/admin'
 *    const adminClient = createAdminClient()
 */

// Browser client for Client Components
export { supabase } from './client';

// Server client for Server Components and Server Actions
export { createServerClient, createServerClientWithoutCookies } from './server';

// Admin client for privileged operations (bypasses RLS)
export { createAdminClient } from './admin';
