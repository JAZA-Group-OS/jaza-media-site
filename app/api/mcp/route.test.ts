// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const KEY = 'k'.repeat(40);
const req = (body: unknown, key?: string) => new Request('http://x/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
  body: JSON.stringify(body),
});

afterEach(() => vi.unstubAllEnvs());

describe('/api/mcp', () => {
  it('refuses everything when no key is configured', async () => {
    vi.stubEnv('CLAUDE_CONNECTOR_KEY', '');
    expect((await POST(req({ jsonrpc: '2.0', id: 1, method: 'ping' }, KEY))).status).toBe(401);
  });
  it('refuses a wrong key', async () => {
    vi.stubEnv('CLAUDE_CONNECTOR_KEY', KEY);
    expect((await POST(req({ jsonrpc: '2.0', id: 1, method: 'ping' }, 'x'.repeat(40)))).status).toBe(401);
  });
  it('lists the tools with the right key', async () => {
    vi.stubEnv('CLAUDE_CONNECTOR_KEY', KEY);
    const res = await POST(req({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, KEY));
    const body = await res.json();
    expect(body.result.tools.map((t: { name: string }) => t.name)).toContain('change_ticket');
  });
});
