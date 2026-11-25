'use client';

import { Bot, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { askAi, runAiAction } from '@/app/(admin)/admin/dashboard/ai-actions';
import type { AiAction, AiTable } from '@/lib/admin/ai-assist';

type Msg = { role: 'user' | 'assistant'; content: string; table?: AiTable | null };
type Pending = { action: AiAction; confirm: string };
const STARTERS = ['Which tickets are urgent?', 'What came in this week?', 'Which tickets are unassigned?'];
const YES = /^(yes|yeah|yep|confirm|do it|go ahead|okay|ok)\b/i;
const NO = /^(no|nope|cancel|stop|don'?t)\b/i;

/**
 * The admin's chat with the self-hosted AI server (ported from Finance's AI agents panel).
 * It reads the support tickets and can propose one change or internal note;
 * nothing happens until the admin confirms. Render it only when the AI server is set up.
 */
export default function AiAssistant({ onChanged }: { onChanged?: () => void }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [next, setNext] = useState<string[]>([]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, busy, pending, next]);

  const say = useCallback((m: Msg) => setMsgs((all) => [...all, m]), []);

  const confirm = useCallback(async (p: Pending) => {
    setPending(null);
    setBusy(true);
    const r = await runAiAction(p.action);
    say({ role: 'assistant', content: r.ok ? `Done. ${r.value} What would you like to do next?` : r.error });
    if (r.ok) onChanged?.();
    setBusy(false);
    setNext((n) => (n.length ? n : STARTERS));
  }, [onChanged, say]);

  const cancel = useCallback(() => {
    setPending(null);
    say({ role: 'assistant', content: "Okay, I won't do it. What would you like to do instead?" });
    setNext((n) => (n.length ? n : STARTERS));
  }, [say]);

  const send = useCallback(async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    if (pending) {
      if (YES.test(question)) { setMsgs((m) => [...m, { role: 'user', content: question }]); setText(''); return confirm(pending); }
      if (NO.test(question)) { setMsgs((m) => [...m, { role: 'user', content: question }]); setText(''); cancel(); return; }
      setPending(null);
    }
    const history = [...msgs, { role: 'user' as const, content: question }];
    setMsgs(history);
    setText('');
    setBusy(true);
    setNext([]);
    const r = await askAi(history.map(({ role, content }) => ({ role, content })));
    if (r.ok) {
      say({ role: 'assistant', content: r.value.say, table: r.value.table });
      if (r.value.action && r.value.confirm) setPending({ action: r.value.action, confirm: r.value.confirm });
      setNext(r.value.suggestions.length ? r.value.suggestions : STARTERS);
    } else {
      say({ role: 'assistant', content: r.error });
      setNext(STARTERS);
    }
    setBusy(false);
  }, [busy, cancel, confirm, msgs, pending, say]);

  const chip = 'rounded-full border border-adm-line-strong px-3 py-1 text-[12px] text-adm-text-2 hover:border-adm-accent';

  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label="Open AI assistant"
          className="fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full bg-adm-accent px-4 py-3 text-[13px] font-semibold text-[#141414] shadow-xl hover:brightness-105">
          <Bot className="size-4" aria-hidden /> AI assistant
        </button>
      )}
      {open && (
        <div role="dialog" aria-label="AI assistant"
          className="fixed right-4 bottom-4 z-50 flex max-h-[80vh] w-[min(420px,calc(100vw-2rem))] flex-col rounded-2xl border border-adm-line-strong bg-adm-bg shadow-2xl">
          <div className="flex items-center gap-2 border-b border-adm-line px-4 py-3">
            <Bot className="size-4 text-adm-accent" aria-hidden />
            <b className="text-[13.5px] text-adm-text">AI assistant</b>
            <button type="button" aria-label="Close" className="ml-auto rounded-sm p-1 text-adm-muted hover:text-adm-text" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </button>
          </div>
          <div className="flex min-h-48 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
            {msgs.length === 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-adm-subtle">
                  Ask about support tickets. It can also change them, like &ldquo;Make JM-12 urgent&rdquo; or &ldquo;Assign JM-4 to Ana&rdquo;, after you confirm.
                </p>
                {STARTERS.map((s) => <button key={s} type="button" onClick={() => void send(s)} className={`${chip} self-start`}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user'
                ? 'self-end rounded-xl bg-adm-accent px-3 py-2 text-[13px] text-[#141414]'
                : 'max-w-full self-start rounded-xl bg-adm-surface px-3 py-2 text-[13px] leading-relaxed text-adm-text'}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m.table && (
                  <div className="mt-2 max-h-72 overflow-auto">
                    <table className="w-full border-collapse text-[12px]">
                      <thead><tr>{m.table.columns.map((c, j) => <th key={j} className="border-b border-adm-line px-2 py-1.5 text-left font-normal text-adm-subtle">{c}</th>)}</tr></thead>
                      <tbody>{m.table.rows.map((r, j) => <tr key={j}>{r.map((cell, k) => <td key={k} className="border-b border-adm-line px-2 py-1.5">{cell}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
            {pending && (
              <div className="rounded-xl border border-adm-accent/40 bg-adm-accent/10 p-3 text-[13px] text-adm-text">
                <p className="mb-2 font-medium">Confirm before it runs</p>
                <p className="mb-3 whitespace-pre-wrap">{pending.confirm}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={busy} onClick={() => void confirm(pending)} className="rounded-lg bg-adm-accent px-3 py-1.5 text-[12px] font-medium text-[#141414] disabled:opacity-50">Confirm</button>
                  <button type="button" disabled={busy} onClick={cancel} className="rounded-lg border border-adm-line-strong px-3 py-1.5 text-[12px] text-adm-text-2 disabled:opacity-50">Cancel</button>
                </div>
                <p className="mt-2 text-[12px] text-adm-subtle">You can also type &ldquo;yes&rdquo; or &ldquo;no&rdquo;.</p>
              </div>
            )}
            {msgs.length > 0 && !pending && !busy && next.length > 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Suggested next steps">
                {next.map((s) => <button key={s} type="button" onClick={() => void send(s)} className={chip}>{s}</button>)}
              </div>
            )}
            {busy && <p className="text-[12px] text-adm-subtle">Thinking. This can take up to a minute.</p>}
            <div ref={end} />
          </div>
          <form className="flex items-end gap-2 border-t border-adm-line p-3" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
            <label htmlFor="ai-ask" className="sr-only">Ask the AI</label>
            <textarea id="ai-ask" rows={2} value={text} maxLength={2000} placeholder={pending ? 'Type yes or no' : 'Ask or tell the AI'}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(text); } }}
              className="flex-1 rounded-xl border border-adm-line-strong bg-adm-surface p-2.5 text-[13px] text-adm-text outline-none placeholder:text-adm-faint focus-visible:border-adm-accent" />
            <button type="submit" disabled={busy || !text.trim()} className="h-9 rounded-lg bg-adm-accent px-3.5 text-[13px] font-medium text-[#141414] disabled:opacity-50">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
