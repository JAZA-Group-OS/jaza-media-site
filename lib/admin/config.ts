/**
 * Single source of truth for the admin identity on the SERVER side.
 *
 * Read by the proxy auth gate (proxy.ts) and the upload route. Override in
 * any environment with the `ADMIN_EMAIL` env var; the fallback preserves the
 * original hardcoded value so existing deployments keep working.
 *
 * IMPORTANT: import this ONLY from server code (proxy, route handlers, server
 * components). Importing it into a Client Component would inline the address
 * into the public JS bundle. The client-side backup gate deliberately checks
 * only for a valid session, not this email.
 *
 * NOTE: the Supabase RLS policies also pin this address. Changing admins
 * therefore requires BOTH setting ADMIN_EMAIL here AND a migration updating
 * the policies — the database can't read this constant.
 */
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL?.trim() || 'jaza.intern@gmail.com';
