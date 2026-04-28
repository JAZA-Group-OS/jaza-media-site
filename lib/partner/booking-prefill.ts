import type { Answers } from './questions';

const PREFILL_KEY = 'partner-with-us:booking-prefill';
// 30 minutes. After this, the blob is treated as stale and cleared.
// Prevents User A's PII from pre-populating User B's Calendly form on a
// shared browser if A abandoned without booking.
const PREFILL_TTL_MS = 30 * 60 * 1000;
// Length floor enforced at the boundary so the contract is explicit and
// any future caller of writePrefill can't blow past it.
const MAX_DESCRIPTION_CHARS = 500;

export type BookingPrefill = {
  fullName?: string;
  email?: string;
  phone?: string;
  description?: string;
};

type StoredPrefill = BookingPrefill & {
  writtenAt: number;
};

export function writePrefill(answers: Answers) {
  if (typeof window === 'undefined') return;
  const stored: StoredPrefill = {
    fullName: answers.fullName,
    email: answers.email,
    phone: answers.phone,
    description: answers.description?.slice(0, MAX_DESCRIPTION_CHARS),
    writtenAt: Date.now(),
  };
  try {
    window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify(stored));
  } catch {
    // private mode — silently no-op; user retypes in Calendly
  }
}

export function readPrefill(): BookingPrefill {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredPrefill>;
    if (
      typeof parsed.writtenAt !== 'number' ||
      Date.now() - parsed.writtenAt > PREFILL_TTL_MS
    ) {
      // Expired or malformed — treat as absent and clean up.
      window.sessionStorage.removeItem(PREFILL_KEY);
      return {};
    }
    return {
      fullName: parsed.fullName,
      email: parsed.email,
      phone: parsed.phone,
      description: parsed.description,
    };
  } catch {
    return {};
  }
}

export function clearPrefill() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PREFILL_KEY);
  } catch {
    // no-op
  }
}
