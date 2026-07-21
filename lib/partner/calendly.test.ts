import { describe, it, expect } from 'vitest';
import {
  buildCalendlyUrl,
  isCalendlyEvent,
  isTrustedCalendlyUrl,
  makeCalendlyMessageHandler,
} from './calendly';

const BASE = 'https://calendly.com/jazamediaph/discovery-call';

describe('isTrustedCalendlyUrl', () => {
  it('accepts a valid Calendly https URL', () => {
    expect(isTrustedCalendlyUrl(BASE)).toBe(true);
  });

  it('accepts a Calendly subdomain', () => {
    expect(
      isTrustedCalendlyUrl('https://api.calendly.com/some/path'),
    ).toBe(true);
  });

  it('rejects http (non-tls)', () => {
    expect(
      isTrustedCalendlyUrl('http://calendly.com/jazamediaph/discovery-call'),
    ).toBe(false);
  });

  it('rejects a non-calendly host', () => {
    expect(
      isTrustedCalendlyUrl('https://calendly.com.evil.com/booking'),
    ).toBe(false);
  });

  it('rejects a calendly-looking string that isn\'t a URL', () => {
    expect(isTrustedCalendlyUrl('not a url')).toBe(false);
    expect(isTrustedCalendlyUrl('')).toBe(false);
  });

  it('rejects javascript: scheme', () => {
    expect(isTrustedCalendlyUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('buildCalendlyUrl', () => {
  it('always sets brand color and hides the GDPR banner', () => {
    const result = buildCalendlyUrl(BASE);
    const url = new URL(result);
    expect(url.searchParams.get('primary_color')).toBe('181818');
    expect(url.searchParams.get('hide_gdpr_banner')).toBe('1');
  });

  it('omits prefill params when the prefill is empty', () => {
    const result = buildCalendlyUrl(BASE);
    const url = new URL(result);
    expect(url.searchParams.has('name')).toBe(false);
    expect(url.searchParams.has('email')).toBe(false);
    expect(url.searchParams.has('a1')).toBe(false);
    expect(url.searchParams.has('a2')).toBe(false);
  });

  it('encodes the full prefill into name/email/a1/a2', () => {
    const result = buildCalendlyUrl(BASE, {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+63 917 111 1111',
      description: 'I run a bakery.',
    });
    const url = new URL(result);
    expect(url.searchParams.get('name')).toBe('Jane Doe');
    expect(url.searchParams.get('email')).toBe('jane@example.com');
    expect(url.searchParams.get('a1')).toBe('+63 917 111 1111');
    expect(url.searchParams.get('a2')).toBe('I run a bakery.');
  });

  it('caps description at 500 chars (defense-in-depth)', () => {
    const longDescription = 'x'.repeat(1000);
    const result = buildCalendlyUrl(BASE, { description: longDescription });
    const url = new URL(result);
    expect(url.searchParams.get('a2')?.length).toBe(500);
  });

  it('caps fullName at 100, email at 254, phone at 30', () => {
    const result = buildCalendlyUrl(BASE, {
      fullName: 'a'.repeat(500),
      email: 'b'.repeat(500) + '@example.com',
      phone: '9'.repeat(500),
    });
    const url = new URL(result);
    expect(url.searchParams.get('name')?.length).toBe(100);
    expect(url.searchParams.get('email')?.length).toBe(254);
    expect(url.searchParams.get('a1')?.length).toBe(30);
  });

  it('encodes special characters safely', () => {
    const result = buildCalendlyUrl(BASE, {
      description: 'A&B + C/D = "test"',
    });
    const url = new URL(result);
    expect(url.searchParams.get('a2')).toBe('A&B + C/D = "test"');
    // The serialized URL should not contain a raw &, +, /, =, or " in the
    // value — they should be percent-encoded.
    expect(result).toContain('a2=');
    expect(result).toMatch(/a2=A%26B\+%2B\+C%2FD\+%3D\+%22test%22/);
  });
});

describe('isCalendlyEvent', () => {
  function makeEvent(opts: {
    origin?: string;
    data?: unknown;
  }): MessageEvent {
    // Note: MessageEvent.origin is read-only when set via `init`. We use the
    // standard MessageEvent constructor + initMessageEvent-style options.
    return new MessageEvent('message', {
      origin: opts.origin ?? '',
      data: opts.data,
    });
  }

  it('accepts a real Calendly origin with calendly.* event name', () => {
    expect(
      isCalendlyEvent(
        makeEvent({
          origin: 'https://calendly.com',
          data: { event: 'calendly.event_scheduled' },
        }),
      ),
    ).toBe(true);
  });

  it('rejects non-Calendly origins even with the right shape', () => {
    expect(
      isCalendlyEvent(
        makeEvent({
          origin: 'https://evil.com',
          data: { event: 'calendly.event_scheduled' },
        }),
      ),
    ).toBe(false);
  });

  it('rejects http://calendly.com (downgrade attempt)', () => {
    expect(
      isCalendlyEvent(
        makeEvent({
          origin: 'http://calendly.com',
          data: { event: 'calendly.event_scheduled' },
        }),
      ),
    ).toBe(false);
  });

  it('rejects a calendly-prefixed look-alike origin', () => {
    expect(
      isCalendlyEvent(
        makeEvent({
          origin: 'https://calendly.com.evil.com',
          data: { event: 'calendly.event_scheduled' },
        }),
      ),
    ).toBe(false);
  });

  it('rejects events whose name does not start with calendly.', () => {
    expect(
      isCalendlyEvent(
        makeEvent({
          origin: 'https://calendly.com',
          data: { event: 'event_scheduled' },
        }),
      ),
    ).toBe(false);
  });

  it('rejects null / non-object data', () => {
    expect(
      isCalendlyEvent(
        makeEvent({ origin: 'https://calendly.com', data: null }),
      ),
    ).toBe(false);
    expect(
      isCalendlyEvent(
        makeEvent({ origin: 'https://calendly.com', data: 'string' }),
      ),
    ).toBe(false);
  });

  it('rejects events with a missing event field', () => {
    expect(
      isCalendlyEvent(
        makeEvent({
          origin: 'https://calendly.com',
          data: { payload: 'whatever' },
        }),
      ),
    ).toBe(false);
  });
});

describe('makeCalendlyMessageHandler', () => {
  it('fires onScheduled only on a valid event_scheduled message', () => {
    let count = 0;
    const handler = makeCalendlyMessageHandler(() => {
      count += 1;
    });

    handler(
      new MessageEvent('message', {
        origin: 'https://calendly.com',
        data: { event: 'calendly.event_scheduled' },
      }),
    );
    expect(count).toBe(1);

    // Other Calendly events shouldn't trigger.
    handler(
      new MessageEvent('message', {
        origin: 'https://calendly.com',
        data: { event: 'calendly.profile_page_viewed' },
      }),
    );
    expect(count).toBe(1);

    // Non-Calendly origin shouldn't trigger.
    handler(
      new MessageEvent('message', {
        origin: 'https://evil.com',
        data: { event: 'calendly.event_scheduled' },
      }),
    );
    expect(count).toBe(1);
  });
});
