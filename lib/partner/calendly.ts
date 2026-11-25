import type { BookingPrefill } from './booking-prefill';

// Defense-in-depth caps on prefill values that flow into the iframe URL.
// writePrefill already slices description; these guards re-enforce limits
// at the URL-compose site so a tampered sessionStorage (browser extension
// or same-origin XSS) can't push the URL to unbounded length.
const MAX = {
  fullName: 100,
  email: 254, // RFC 5321 local-part 64 + @ + domain 253; 254 is the practical max
  phone: 30,
  description: 500,
} as const;

const SCHEDULED_EVENT = 'calendly.event_scheduled';

/**
 * Validates that a string is a Calendly URL we trust embedding. Rejects
 * non-https, non-calendly.com hosts. Used to guard NEXT_PUBLIC_CALENDLY_URL
 * before it reaches `new URL(...)` in the page — so a misconfigured deploy
 * (typo, wrong env, attacker-injected env in a future Vercel preview) falls
 * through to the trusted fallback instead of embedding an attacker's clone.
 */
export function isTrustedCalendlyUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    return (
      url.hostname === 'calendly.com' || url.hostname.endsWith('.calendly.com')
    );
  } catch {
    return false;
  }
}

/**
 * Builds the Calendly inline-widget URL with brand color, GDPR banner
 * suppression, and any prefill fields encoded as query params. Pure
 * function — accepts prefill explicitly so the caller decides where the
 * data comes from (sessionStorage in production, fixtures in tests).
 *
 * Length caps re-enforced here as defense-in-depth on top of writePrefill's
 * write-time slice.
 */
export function buildCalendlyUrl(
  base: string,
  prefill: BookingPrefill = {},
): string {
  const url = new URL(base);
  // Dark, formal theme to match the site (colour params need a paid Calendly plan).
  url.searchParams.set('background_color', '111111');
  url.searchParams.set('text_color', 'f5f5f4');
  url.searchParams.set('primary_color', 'eab308');
  // The funnel's own consent disclaimer covers contact consent for our
  // PH/AU audience. If we ever expand to EU leads we'll need to drop this
  // parameter to comply with GDPR Article 13.
  url.searchParams.set('hide_gdpr_banner', '1');

  if (prefill.fullName) {
    url.searchParams.set('name', prefill.fullName.slice(0, MAX.fullName));
  }
  if (prefill.email) {
    url.searchParams.set('email', prefill.email.slice(0, MAX.email));
  }
  // Calendly indexes additional invitee questions as a1, a2, ... in URL
  // params. The user must add these in the Calendly event settings; if
  // they are missing, Calendly silently ignores the params.
  if (prefill.phone) {
    url.searchParams.set('a1', prefill.phone.slice(0, MAX.phone));
  }
  if (prefill.description) {
    url.searchParams.set(
      'a2',
      prefill.description.slice(0, MAX.description),
    );
  }

  // URLSearchParams encodes spaces as '+', which Calendly shows literally
  // in prefilled fields ("Juan+Dela+Cruz"). Use %20 instead.
  return url.toString().replace(/\+/g, '%20');
}

/**
 * Origin + shape gate for Calendly's postMessage events. This is the
 * security boundary between the iframe and our page — a non-Calendly
 * origin or malformed payload is silently ignored.
 */
export function isCalendlyEvent(e: MessageEvent): boolean {
  return (
    e.origin === 'https://calendly.com' &&
    typeof e.data === 'object' &&
    e.data !== null &&
    typeof (e.data as { event?: unknown }).event === 'string' &&
    ((e.data as { event: string }).event as string).startsWith('calendly.')
  );
}

/**
 * Builds a `message` event handler that fires `onScheduled` exactly when
 * Calendly emits the `event_scheduled` event. Exported for both production
 * use and test wiring.
 */
export function makeCalendlyMessageHandler(
  onScheduled: () => void,
): (e: MessageEvent) => void {
  return function (e: MessageEvent) {
    if (!isCalendlyEvent(e)) return;
    if ((e.data as { event: string }).event !== SCHEDULED_EVENT) return;
    onScheduled();
  };
}
