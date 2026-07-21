import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Webhook endpoint — DISABLED until signature verification is implemented.
 *
 * Per Custodio's audit (H1): forwarding `payload.source` from a caller-controlled
 * header without signature verification creates a forgery surface. This endpoint
 * is intentionally dead until each webhook source has its own HMAC verification
 * wired in (e.g. `svix` for Resend, provider-specific signatures for payments).
 *
 * To re-enable a specific source, add a verifier that:
 *   1. Reads the provider's signature header
 *   2. Computes HMAC-SHA256 over the raw request body using the shared secret
 *   3. Compares with `crypto.timingSafeEqual`
 *   4. Only then routes to the handler
 *
 * Do not remove this gate without doing all four steps.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Webhook endpoint is disabled',
      reason:
        'Signature verification not yet implemented. Configure HMAC verification before enabling.',
    },
    { status: 501 },
  );
}
