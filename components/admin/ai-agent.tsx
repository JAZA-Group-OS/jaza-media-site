'use client';

import ThinkingRobot from './thinking-robot';
import ChatMarkdown from './chat-markdown';

import { Bot, Plus, RefreshCw, Sparkles, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AiAssistant from '@/components/admin/ai-assistant';
import { askClaude, bridgeAvailable, type ClaudeMode, type ClaudeModel } from '@/lib/admin/claude-bridge';

type Msg = { role: 'user' | 'assistant'; content: string };
type Status = 'checking' | 'connected' | 'offline';

const STARTERS = ['Which support tickets are open?', 'Any new partner leads this week?', 'What discovery calls are coming up?', 'Summarise the latest career applications'];
const PREFS_KEY = 'jaza-admin-claude';

function savedPrefs(): { model?: ClaudeModel; mode?: ClaudeMode } {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}'); } catch { return {}; }
}

/**
 * The admin's AI Agent page: Claude Code on this computer (its own Claude subscription, no API key)
 * through claude-bridge/bridge.mjs. When the bridge isn't running it shows how to start it, and the
 * built-in AI server assistant when that is set up.
 */
export default function AiAgent({ fallbackAi = false }: { fallbackAi?: boolean }) {
  const [status, setStatus] = useState<Status>('checking');
  const [model, setModel] = useState<ClaudeModel>('sonnet');
  const [mode, setMode] = useState<ClaudeMode>('site');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [session, setSession] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  const check = useCallback(async () => {
    setStatus('checking');
    setStatus((await bridgeAvailable()) ? 'connected' : 'offline');
  }, []);

  useEffect(() => {
    const p = savedPrefs();
    queueMicrotask(() => {
      if (p.model) setModel(p.model);
      if (p.mode) setMode(p.mode);
      loaded.current = true;
    });
    void bridgeAvailable().then((ok) => setStatus(ok ? 'connected' : 'offline'));
    return () => abort.current?.abort();
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ model, mode })); } catch { /* private mode */ }
  }, [model, mode]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, steps]);

  const send = async (q: string) => {
    const message = q.trim();
    if (!message || busy) return;
    setMsgs((m) => [...m, { role: 'user', content: message }, { role: 'assistant', content: '' }]);
    setText('');
    setBusy(true);
    setSteps([]);
    let answer = '';
    const update = (content: string) => setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content }]);
    const ctl = new AbortController();
    abort.current = ctl;
    try {
      await askClaude({ message, sessionId: session, model, mode, context: 'JAZA Media admin · AI Agent page' }, (e) => {
        if (e.type === 'session') setSession(e.sessionId);
        else if (e.type === 'step') setSteps((s) => [...s.slice(-3), e.text]);
        else if (e.type === 'text') { answer = answer ? `${answer}\n\n${e.text}` : e.text; update(answer); }
        else if (e.type === 'done') {
          if (e.sessionId) setSession(e.sessionId);
          if (e.error) { answer = answer ? `${answer}\n\n${e.error}` : e.error; update(answer); }
        }
      }, ctl.signal);
      if (!answer) update('Claude finished without an answer. Try asking again.');
    } catch (e) {
      if (ctl.signal.aborted) update(answer ? `${answer}\n\n(Stopped.)` : 'Stopped.');
      else {
        update(e instanceof Error ? e.message : "Claude on this computer didn't answer. Check that the bridge is running.");
        void check();
      }
    } finally {
      setBusy(false);
      setSteps([]);
      abort.current = null;
    }
  };

  const chip = 'rounded-full border border-adm-line-strong px-3 py-1 text-[12px] text-adm-text-2 hover:border-adm-accent';
  const dot = status === 'connected' ? 'bg-green-500' : status === 'checking' ? 'bg-adm-accent animate-pulse' : 'bg-red-500';
  const label = status === 'connected' ? 'Claude on this computer is connected' : status === 'checking' ? 'Looking for Claude on this computer…' : 'Claude on this computer is not running';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-adm-line bg-adm-surface px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] text-adm-text">
          <span aria-hidden className={`size-2.5 rounded-full ${dot}`} />
          {label}
        </span>
        <button type="button" onClick={() => void check()} disabled={status === 'checking'}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-adm-muted hover:text-adm-text disabled:opacity-50">
          <RefreshCw className="size-3.5" aria-hidden /> Check again
        </button>
        {status === 'connected' && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select aria-label="Model" value={model} disabled={busy} onChange={(e) => setModel(e.target.value as ClaudeModel)}
              className="h-8 rounded-lg border border-adm-line-strong bg-adm-bg px-2 text-[12.5px] text-adm-text">
              <option value="opus">Opus</option>
              <option value="sonnet">Sonnet</option>
              <option value="haiku">Haiku</option>
            </select>
            <select aria-label="Access" value={mode} disabled={busy} onChange={(e) => setMode(e.target.value as ClaudeMode)}
              className="h-8 rounded-lg border border-adm-line-strong bg-adm-bg px-2 text-[12.5px] text-adm-text"
              title="Site data: the admin data, web search and reading files. Full access: like Claude Desktop with every permission on this computer.">
              <option value="site">Site data only</option>
              <option value="full">Full access</option>
            </select>
            <button type="button" title="New chat" aria-label="New chat" disabled={busy}
              onClick={() => { setMsgs([]); setSession(null); }}
              className="grid size-8 place-items-center rounded-lg border border-adm-line-strong text-adm-muted hover:text-adm-text disabled:opacity-50">
              <Plus className="size-4" />
            </button>
          </div>
        )}
      </div>

      {status === 'offline' && (
        <section className="flex flex-col gap-3 rounded-2xl border border-adm-line bg-adm-surface p-5 text-[13.5px] text-adm-text-2">
          <h2 className="text-[15px] font-semibold text-adm-text">Start Claude on this computer</h2>
          <p>The AI Agent runs Claude Code on this Mac with your own Claude subscription, so there is no API key. Run these once in Terminal:</p>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>Sign in to Claude Code (skip if done): <code className="rounded bg-adm-bg px-1.5 py-0.5 text-adm-accent">claude</code> then <code className="rounded bg-adm-bg px-1.5 py-0.5 text-adm-accent">/login</code></li>
            <li>Start the bridge now and at every login:
              <pre className="mt-1 overflow-x-auto rounded-lg bg-adm-bg p-3 text-[12.5px] text-adm-text">cd ~/Documents/jaza-media-site && sh claude-bridge/install.sh</pre>
            </li>
            <li>Optional, so Claude can read tickets, leads, applications and bookings: connect the site (the key is the site&apos;s CLAUDE_CONNECTOR_KEY):
              <pre className="mt-1 overflow-x-auto rounded-lg bg-adm-bg p-3 text-[12.5px] text-adm-text">claude mcp add --scope user --transport http jaza-media-site https://jazamedia.com/api/mcp --header &quot;Authorization: Bearer YOUR_KEY&quot;</pre>
            </li>
          </ol>
          <p className="text-[12.5px] text-adm-subtle">Then press Check again. Chrome may ask to allow access to devices on your local network: allow it. Works only on the computer running the bridge.</p>
        </section>
      )}

      {status === 'offline' && fallbackAi && (
        <section className="flex flex-col gap-2">
          <p className="text-[12.5px] text-adm-subtle">Meanwhile, the built-in AI server can help with support tickets:</p>
          <AiAssistant inline />
        </section>
      )}

      {status === 'connected' && (
        <div className="flex h-[min(680px,72vh)] flex-col rounded-2xl border border-adm-line bg-adm-bg">
          <div className="flex min-h-48 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {msgs.length === 0 && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-2 text-[13.5px] text-adm-text">
                  <Sparkles className="size-4 text-adm-accent" aria-hidden />
                  Claude {model[0].toUpperCase() + model.slice(1)} on your Claude subscription.
                </p>
                <p className="text-[13px] text-adm-subtle">
                  {mode === 'full'
                    ? 'Full access: it can also work on this computer and on the website code. It asks before changing anything.'
                    : 'Ask about support tickets, partner leads, applications, bookings or course requests. It asks before changing anything.'}
                </p>
                {STARTERS.map((s) => <button key={s} type="button" onClick={() => void send(s)} className={`${chip} self-start`}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => (!m.content && busy && i === msgs.length - 1) ? null : (
              <div key={i} className={m.role === 'user'
                ? 'self-end max-w-[85%] whitespace-pre-wrap rounded-xl bg-adm-accent px-3 py-2 text-[13.5px] text-[#141414]'
                : 'self-start max-w-full rounded-2xl bg-adm-surface px-4 py-3 text-[13.5px] leading-relaxed text-adm-text'}>
                {m.role === 'user' ? m.content : <ChatMarkdown text={m.content} />}
              </div>
            ))}
            {busy && (
              <div className="self-start rounded-2xl bg-adm-surface px-4 py-3">
                <ThinkingRobot step={steps[steps.length - 1]} />
              </div>
            )}
            <div ref={end} />
          </div>
          <form className="flex items-end gap-2 border-t border-adm-line p-3" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
            <label htmlFor="agent-ask" className="sr-only">Message Claude</label>
            <textarea id="agent-ask" rows={2} value={text} maxLength={8000} placeholder="Ask or tell Claude"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(text); } }}
              className="flex-1 rounded-xl border border-adm-line-strong bg-adm-surface p-2.5 text-[13.5px] text-adm-text outline-none placeholder:text-adm-faint focus-visible:border-adm-accent" />
            {busy ? (
              <button type="button" onClick={() => abort.current?.abort()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-adm-line-strong px-3.5 text-[13px] text-adm-text-2">
                <Square className="size-3.5" aria-hidden /> Stop
              </button>
            ) : (
              <button type="submit" disabled={!text.trim()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-adm-accent px-3.5 text-[13px] font-medium text-[#141414] disabled:opacity-50">
                <Bot className="size-4" aria-hidden /> Send
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
