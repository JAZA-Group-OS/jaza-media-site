'use client';

/**
 * The admin AI Agent's link to Claude on this computer (claude-bridge/bridge.mjs): Claude Code signed
 * in with this computer's own Claude subscription. Ported from JAZA Finances, local only (no tunnel).
 */
export const BRIDGE_URL = 'http://127.0.0.1:47822';
export type ClaudeModel = 'opus' | 'sonnet' | 'haiku';
export type ClaudeMode = 'site' | 'full';
export type BridgeEvent =
  | { type: 'session'; sessionId: string; model?: string }
  | { type: 'text'; text: string }
  | { type: 'step'; text: string }
  | { type: 'done'; sessionId?: string; error?: string };

// Chrome's Local Network Access: say up front that this call goes to this computer.
const LOCAL = { targetAddressSpace: 'loopback' } as RequestInit;

/** Whether the bridge answers on this computer. Chrome may first ask to allow local network access. */
export async function bridgeAvailable(timeoutMs = 4000): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/status`, { ...LOCAL, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    return res.ok && (await res.json()).app === 'jaza-site-claude-bridge';
  } catch {
    return false;
  }
}

/** Sends one message and calls `on` for every event as Claude works. */
export async function askClaude(
  input: { message: string; sessionId: string | null; model: ClaudeModel; mode: ClaudeMode; context?: string },
  on: (e: BridgeEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BRIDGE_URL}/chat`, {
    ...LOCAL, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!res.ok || !res.body) throw new Error((await res.text().catch(() => '')) || "Claude didn't answer.");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) try { on(JSON.parse(line) as BridgeEvent); } catch { /* partial line */ }
    }
  }
}
