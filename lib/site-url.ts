// Resolves the canonical absolute base URL for this deployment, used when
// we need to embed a self-link in an outbound email (e.g., the PDF download
// link in the course-delivery email). Hardcoding a domain here means the
// link breaks anywhere the canonical domain isn't live yet — env-driven
// resolution keeps it correct in local dev, Vercel previews, and prod.
//
// Resolution order:
//   1. SITE_URL              — explicit override (prefer in production)
//   2. VERCEL_PROJECT_PRODUCTION_URL — set by Vercel for prod deployments
//   3. VERCEL_URL            — set by Vercel for any deployment (preview)
//   4. http://localhost:3000 — local dev fallback
export function getSiteBaseUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

// Resolve a possibly-relative URL to an absolute one. Absolute inputs are
// returned untouched so that off-site links (Calendly, future hosted assets)
// keep working.
export function toAbsoluteUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  const base = getSiteBaseUrl();
  return `${base}${input.startsWith('/') ? '' : '/'}${input}`;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}
