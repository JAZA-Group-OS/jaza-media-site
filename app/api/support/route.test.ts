import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

import { POST } from './route';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_ORIGIN = 'http://localhost:3000';

const VALID_BODY = {
  fullName: 'Test User',
  email: 'test@example.com',
  topic: 'general',
  subject: 'A real subject',
  message: 'A message that is long enough to pass the schema.',
};

function buildRequest(body: unknown, originHeader: string | null = ALLOWED_ORIGIN) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (originHeader) headers.set('origin', originHeader);
  return new Request('https://localhost/api/support', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/support', () => {
  let insert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    insert = vi.fn().mockResolvedValue({ error: null });
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: () => ({ insert }),
    });
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: true,
      remaining: 7,
      resetMs: 600_000,
    });
  });

  it('rejects disallowed origin with 403', async () => {
    const res = await POST(buildRequest(VALID_BODY, 'https://evil.example.com'));
    expect(res.status).toBe(403);
    expect(insert).not.toHaveBeenCalled();
  });

  it('returns 429 when rate-limited and includes Retry-After header', async () => {
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetMs: 60_000,
    });
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
    expect(insert).not.toHaveBeenCalled();
  });

  it('returns 400 on malformed JSON body', async () => {
    const res = await POST(buildRequest('{not-json'));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Invalid JSON');
    expect(insert).not.toHaveBeenCalled();
  });

  it('returns 400 with Zod issues on invalid payload', async () => {
    const res = await POST(buildRequest({ ...VALID_BODY, email: 'not-an-email' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; issues: { path: unknown[] }[] };
    expect(body.error).toBe('Invalid input');
    expect(body.issues.length).toBeGreaterThan(0);
    expect(insert).not.toHaveBeenCalled();
  });

  it('honeypot non-empty: 200 success with NO insert call', async () => {
    const res = await POST(buildRequest({ ...VALID_BODY, _hp: 'spam-bot-was-here' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);
    expect(insert).not.toHaveBeenCalled();
  });

  it('valid payload: 200 success with one insert carrying the right shape', async () => {
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Test User',
        email: 'test@example.com',
        topic: 'general',
        subject: 'A real subject',
        source: 'marketing_site',
      }),
    );
  });

  it('returns 500 when Supabase insert errors, never echoing the body', async () => {
    insert.mockResolvedValue({ error: { code: '42P01', message: 'relation not found' } });
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Failed to save your message');
    expect(JSON.stringify(body)).not.toContain('Test User');
  });
});
