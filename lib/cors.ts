/**
 * Origin allowlist + preflight handling for our public POST endpoints.
 *
 * The forms are called same-origin in normal flows, so CORS isn't strictly
 * required — but pinning an Origin allowlist denies cross-site form posts
 * by other domains and documents the intended caller surface.
 *
 * Override the production allowlist with the comma-separated env var
 * `CORS_ALLOWED_ORIGINS` if the site is rehosted at a new domain.
 */

const STATIC_ALLOWLIST = [
  'https://jaza-media.com',
  'https://www.jaza-media.com',
  'https://admin.jaza-media.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

function getAllowlist(): string[] {
  const env = process.env.CORS_ALLOWED_ORIGINS;
  if (!env) return STATIC_ALLOWLIST;
  return env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const list = getAllowlist();
  if (list.includes(origin)) return true;
  // Vercel preview deployments — *.vercel.app under any project.
  try {
    const host = new URL(origin).host;
    if (host.endsWith('.vercel.app')) return true;
  } catch {
    // ignore malformed Origin
  }
  return false;
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!isAllowed(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin!,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  };
}

/**
 * If the request is an OPTIONS preflight, return a 204 with the allowed
 * CORS headers (or 403 if the origin isn't allowlisted). Returns null for
 * non-preflight requests so the caller continues to the real handler.
 */
export function handlePreflight(request: Request): Response | null {
  if (request.method !== 'OPTIONS') return null;
  const origin = request.headers.get('origin');
  if (!isAllowed(origin)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

/**
 * Reject same-method requests whose Origin header is set but not in the
 * allowlist. Origin-less requests (server-to-server, curl) are allowed
 * through — they don't carry browser cookies, so CSRF isn't a concern.
 */
export function rejectDisallowedOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (isAllowed(origin)) return null;
  return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
