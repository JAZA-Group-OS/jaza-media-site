'use client';

import { ArrowLeft, Bot, Inbox, Mail, Phone, Search } from 'lucide-react';
import { assistTicket } from '@/app/(admin)/admin/dashboard/ai-actions';
import type { TicketAssist } from '@/lib/admin/ai-assist';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import {
  applyDeskFilters,
  hasFilters,
  inView,
  isOpen,
  NO_FILTERS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  ticketKey,
  timeAgo,
  TOPIC_LABELS,
  VIEWS,
  type DeskFilters,
  type DeskView,
} from '@/lib/admin/support-desk';
import type {
  SupportTicket,
  SupportTicketComment,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketUpdate,
} from '@/lib/types/database';

/* ---------- badges ---------- */

const STATUS_TINT: Record<SupportTicketStatus, { chip: string; dot: string }> = {
  new: { chip: 'bg-sky-500/12 text-sky-300', dot: 'bg-sky-400' },
  in_progress: { chip: 'bg-adm-accent/15 text-adm-accent', dot: 'bg-adm-accent' },
  resolved: { chip: 'bg-green-500/12 text-green-300', dot: 'bg-green-400' },
  closed: { chip: 'bg-adm-raised text-adm-muted', dot: 'bg-adm-faint' },
};

const PRIORITY_TINT: Record<SupportTicketPriority, { chip: string; dot: string }> = {
  urgent: { chip: 'bg-red-500/12 text-red-300', dot: 'bg-red-400' },
  high: { chip: 'bg-orange-500/12 text-orange-300', dot: 'bg-orange-400' },
  normal: { chip: 'bg-adm-raised text-adm-text-2', dot: 'bg-adm-muted' },
  low: { chip: 'bg-adm-raised text-adm-muted', dot: 'bg-adm-faint' },
};

function Badge({ tint, label }: { tint: { chip: string; dot: string }; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${tint.chip}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${tint.dot}`} />
      {label}
    </span>
  );
}

const StatusBadge = ({ status }: { status: SupportTicketStatus }) => (
  <Badge tint={STATUS_TINT[status]} label={STATUS_LABELS[status]} />
);
const PriorityBadge = ({ priority }: { priority: SupportTicketPriority | null | undefined }) => {
  const p = priority ?? 'normal';
  return <Badge tint={PRIORITY_TINT[p]} label={PRIORITY_LABELS[p]} />;
};

/* ---------- small controls ---------- */

const selectCls =
  'h-9 rounded-lg border border-adm-line-strong bg-adm-surface px-2.5 text-[13px] text-adm-text outline-none focus-visible:border-adm-accent disabled:opacity-50';
const btnCls =
  'inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-[13px] font-medium transition disabled:opacity-50';
const btnPrimary = `${btnCls} bg-adm-accent text-[#141414] hover:brightness-105`;
const btnOutline = `${btnCls} border border-adm-line-strong bg-adm-surface text-adm-text-2 hover:border-adm-accent`;
const btnGhost = `${btnCls} text-adm-muted hover:text-adm-text`;

function Select<T extends string>({ label, value, options, onChange, disabled, className = '' }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; disabled?: boolean; className?: string;
}) {
  return (
    <select aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as T)} className={`${selectCls} ${className}`}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const entries = <K extends string>(r: Record<K, string>) => (Object.keys(r) as K[]).map((value) => ({ value, label: r[value] }));

/* ---------- data helpers ---------- */

type Updater = {
  update: (vals: SupportTicketUpdate) => {
    eq: (col: string, val: string) => {
      select: () => { single: () => Promise<{ data: SupportTicket | null; error: { message: string } | null }> };
    };
  };
};
type CommentsTable = {
  select: (c: string) => {
    eq: (col: string, val: string) => {
      order: (col: string, o: { ascending: boolean }) => Promise<{ data: SupportTicketComment[] | null; error: { message: string } | null }>;
    };
  };
  insert: (row: { ticket_id: string; kind: 'note' | 'event'; body: string; author_email: string }) => {
    select: () => { single: () => Promise<{ data: SupportTicketComment | null; error: { message: string } | null }> };
  };
};
const commentsTable = () => supabase.from('support_ticket_comments') as unknown as CommentsTable;

function describeChange(c: SupportTicketUpdate): string {
  const parts: string[] = [];
  if (c.status) parts.push(`set status to ${STATUS_LABELS[c.status]}`);
  if (c.priority) parts.push(`set priority to ${PRIORITY_LABELS[c.priority]}`);
  if (c.assignee !== undefined) parts.push(c.assignee ? `assigned to ${c.assignee}` : 'unassigned');
  return parts.join(', ');
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });

/* ---------- desk ---------- */

export default function SupportDesk({ ai = false }: { ai?: boolean }) {
  const { rows: tickets, setRows, loading, error } = useRealtimeTable<SupportTicket>('support_tickets');
  const [me, setMe] = useState<string | null>(null);
  const [filters, setFilters] = useState<DeskFilters>(NO_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setMe(data.user?.email ?? null));
  }, []);

  const shown = useMemo(() => applyDeskFilters(tickets, filters, me), [tickets, filters, me]);
  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.value, tickets.filter((t) => inView(t, v.value, me)).length])) as Record<DeskView, number>,
    [tickets, me],
  );
  const set = <K extends keyof DeskFilters>(k: K, v: DeskFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const onSaved = useCallback((t: SupportTicket) => setRows((rs) => rs.map((r) => (r.id === t.id ? t : r))), [setRows]);

  const open = openId ? tickets.find((t) => t.id === openId) : undefined;
  if (open) return <TicketView ticket={open} me={me} ai={ai} onBack={() => setOpenId(null)} onSaved={onSaved} />;

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <nav aria-label="Ticket views" className="flex gap-1 overflow-x-auto lg:w-52 lg:shrink-0 lg:flex-col">
        {VIEWS.map((v) => {
          const active = filters.view === v.value;
          return (
            <button key={v.value} type="button" aria-current={active ? 'page' : undefined} onClick={() => set('view', v.value)}
              className={`flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] transition ${
                active ? 'bg-adm-accent/15 font-semibold text-adm-accent' : 'text-adm-muted hover:bg-adm-surface hover:text-adm-text'}`}>
              {v.label}
              <span className="tabular-nums text-[12px] opacity-80">{counts[v.value]}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search tickets</span>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-adm-faint" />
            <input type="search" value={filters.query} onChange={(e) => set('query', e.target.value)}
              placeholder="Search by number, subject or person" className={`${selectCls} w-full pl-8`} />
          </label>
          <Select label="Priority" value={filters.priority} onChange={(v) => set('priority', v)}
            options={[{ value: 'any', label: 'Any priority' }, ...entries(PRIORITY_LABELS)]} />
          <Select label="Topic" value={filters.topic} onChange={(v) => set('topic', v)}
            options={[{ value: 'any', label: 'Any topic' }, ...entries(TOPIC_LABELS)]} />
          <Select label="Sort" value={filters.sort} onChange={(v) => set('sort', v)}
            options={[{ value: 'updated', label: 'Last updated' }, { value: 'priority', label: 'Priority' }, { value: 'newest', label: 'Newest' }]} />
          {hasFilters(filters) && (
            <button type="button" className={btnGhost} onClick={() => setFilters({ ...NO_FILTERS, view: filters.view })}>Clear filters</button>
          )}
        </div>

        {loading ? (
          <div className="h-80 animate-pulse rounded-2xl border border-adm-line bg-adm-surface" />
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            <p className="mb-1 font-semibold">Tickets didn&apos;t load</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-adm-line bg-adm-surface px-6 py-14 text-center">
            <Inbox className="size-6 text-adm-faint" aria-hidden />
            <p className="font-medium text-adm-text">{tickets.length === 0 ? 'No tickets yet' : 'No tickets here'}</p>
            <p className="text-[13px] text-adm-subtle">
              {tickets.length === 0 ? 'Messages sent from the Support page show up here.' : 'Try another view, or clear the filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-adm-line">
            <table className="w-full min-w-[52rem] text-[13px]">
              <thead className="bg-adm-surface text-left text-[11.5px] tracking-wide text-adm-subtle uppercase">
                <tr>
                  {['Key', 'Subject', 'Topic', 'Priority', 'Status', 'Assignee', 'Updated'].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-adm-line">
                {shown.map((t) => (
                  <tr key={t.id} onClick={() => setOpenId(t.id)} className="cursor-pointer transition hover:bg-adm-hover/50">
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-[12px] text-adm-subtle">{ticketKey(t)}</td>
                    <td className="max-w-md px-3 py-3">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenId(t.id); }}
                        className="text-left font-medium text-adm-text hover:underline">{t.subject}</button>
                      <span className="block truncate text-[12px] text-adm-subtle">{t.full_name} · {t.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-adm-text-2">{TOPIC_LABELS[t.topic] ?? t.topic}</td>
                    <td className="px-3 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-adm-muted">{t.assignee ?? 'Unassigned'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-adm-muted">{timeAgo(t.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- one ticket ---------- */

function TicketView({ ticket: t, me, ai, onBack, onSaved }: {
  ticket: SupportTicket; me: string | null; ai: boolean; onBack: () => void; onSaved: (t: SupportTicket) => void;
}) {
  const [comments, setComments] = useState<SupportTicketComment[]>([]);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assigneeDraft, setAssigneeDraft] = useState(t.assignee ?? '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void commentsTable().select('*').eq('ticket_id', t.id).order('created_at', { ascending: true }).then(({ data, error }) => {
      if (cancelled) return;
      setComments(data ?? []);
      setThreadError(error ? error.message : null);
    });
    const channel = supabase
      .channel(`realtime:support_ticket_comments:${t.id}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'support_ticket_comments', filter: `ticket_id=eq.${t.id}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.new as SupportTicketComment;
          setComments((cs) => (cs.some((c) => c.id === row.id) ? cs : [...cs, row]));
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [t.id]);

  const addComment = async (kind: 'note' | 'event', text: string) => {
    if (!me) return false;
    const { data, error } = await commentsTable().insert({ ticket_id: t.id, kind, body: text, author_email: me }).select().single();
    if (error || !data) {
      setActionError(error?.message ?? 'Could not save to the thread.');
      return false;
    }
    setComments((cs) => (cs.some((c) => c.id === data.id) ? cs : [...cs, data]));
    return true;
  };

  const change = async (c: SupportTicketUpdate) => {
    setSaving(true);
    setActionError(null);
    const { data, error } = await (supabase.from('support_tickets') as unknown as Updater)
      .update(c).eq('id', t.id).select().single();
    setSaving(false);
    if (error || !data) {
      setActionError(error?.message ?? "That change didn't save. Try again.");
      return;
    }
    onSaved(data);
    if (c.assignee !== undefined) setAssigneeDraft(data.assignee ?? '');
    void addComment('event', describeChange(c));
  };

  const send = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    if (await addComment('note', text)) setBody('');
    setSending(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-adm-subtle">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 hover:text-adm-text hover:underline">
          <ArrowLeft className="size-3.5" aria-hidden /> Tickets
        </button>
        <span>/</span>
        <span className="font-mono text-adm-text">{ticketKey(t)}</span>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={t.priority} />
          <StatusBadge status={t.status} />
          <span className="text-[12px] text-adm-subtle">{TOPIC_LABELS[t.topic] ?? t.topic}</span>
        </div>
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-adm-text">{t.subject}</h2>
        <div className="flex flex-wrap gap-2">
          {isOpen(t.status) ? (
            <>
              {me && t.assignee !== me && <button type="button" className={btnOutline} disabled={saving} onClick={() => void change({ assignee: me })}>Assign to me</button>}
              {t.status !== 'in_progress' && <button type="button" className={btnOutline} disabled={saving} onClick={() => void change({ status: 'in_progress' })}>Start progress</button>}
              <button type="button" className={btnPrimary} disabled={saving} onClick={() => void change({ status: 'resolved' })}>Resolve</button>
            </>
          ) : (
            <button type="button" className={btnOutline} disabled={saving} onClick={() => void change({ status: 'in_progress' })}>Reopen</button>
          )}
        </div>
        {actionError && <p className="text-[13px] text-red-300">{actionError}</p>}
      </header>

      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-2xl border border-adm-line bg-adm-surface p-5">
            <h3 className="text-[13px] font-semibold text-adm-text">Message from {t.full_name}</h3>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-adm-text-2">{t.message}</p>
            {t.admin_notes && (
              <p className="whitespace-pre-wrap border-t border-adm-line pt-3 text-[13px] text-adm-muted">
                <span className="font-medium text-adm-text-2">Earlier admin notes: </span>{t.admin_notes}
              </p>
            )}
          </section>

          {ai && (
            <AiPanel ticket={t} saving={saving} onApplyPriority={(p) => void change({ priority: p })} onDraft={setBody} />
          )}

          <section className="flex flex-col gap-4 border-t border-adm-line pt-5">
            <h3 className="text-[13px] font-semibold text-adm-text">Internal notes &amp; activity</h3>
            {threadError ? (
              <p className="text-[13px] text-red-300">Thread didn&apos;t load: {threadError}</p>
            ) : comments.length === 0 ? (
              <p className="text-[13px] text-adm-subtle">Nothing yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {comments.map((c) =>
                  c.kind === 'event' ? (
                    <li key={c.id} className="text-center text-[12px] text-adm-subtle">
                      <span className="font-medium text-adm-text-2">{c.author_email === me ? 'You' : c.author_email}</span> {c.body} · {timeAgo(c.created_at)}
                    </li>
                  ) : (
                    <li key={c.id} className={`flex flex-col gap-1 ${c.author_email === me ? 'items-end' : 'items-start'}`}>
                      <span className="text-[12px] text-adm-subtle">{c.author_email === me ? 'You' : c.author_email} · {timeAgo(c.created_at)}</span>
                      <p className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-[14px] leading-relaxed text-adm-text ${
                        c.author_email === me ? 'rounded-br-sm bg-adm-accent/15' : 'rounded-bl-sm bg-adm-raised'}`}>{c.body}</p>
                    </li>
                  ),
                )}
              </ol>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="desk-note" className="sr-only">Internal note</label>
              <textarea id="desk-note" rows={3} maxLength={5000} value={body} placeholder="Write an internal note (not sent to the visitor)"
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); } }}
                className="rounded-xl border border-adm-line-strong bg-adm-surface p-3 text-[14px] text-adm-text outline-none placeholder:text-adm-faint focus-visible:border-adm-accent" />
              <div className="flex items-center justify-end gap-2">
                <a href={`mailto:${t.email}?subject=${encodeURIComponent(`Re: ${t.subject} [${ticketKey(t)}]`)}`} className={btnOutline}>Reply by email</a>
                <button type="button" className={btnPrimary} disabled={!body.trim() || sending || !me} onClick={() => void send()}>Add note</button>
              </div>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6 xl:w-80 xl:shrink-0">
          <section className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-adm-text">Details</h3>
            <label className="flex flex-col gap-1 text-[12px] text-adm-subtle">Status
              <Select label="Status" value={t.status} disabled={saving} options={entries(STATUS_LABELS)} onChange={(v) => void change({ status: v })} />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-adm-subtle">Priority
              <Select label="Priority" value={t.priority ?? 'normal'} disabled={saving} options={entries(PRIORITY_LABELS)} onChange={(v) => void change({ priority: v })} />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-adm-subtle">Assignee
              <input value={assigneeDraft} onChange={(e) => setAssigneeDraft(e.target.value)} placeholder="Unassigned" maxLength={120}
                onBlur={() => { const v = assigneeDraft.trim() || null; if (v !== (t.assignee ?? null)) void change({ assignee: v }); }}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                className={selectCls} disabled={saving} />
            </label>
            <div className="flex gap-2">
              {me && t.assignee !== me && <button type="button" className={`${btnOutline} h-8 text-[12px]`} disabled={saving} onClick={() => void change({ assignee: me })}>Assign to me</button>}
              {t.assignee && <button type="button" className={`${btnGhost} h-8 text-[12px]`} disabled={saving} onClick={() => void change({ assignee: null })}>Unassign</button>}
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="text-[13px] font-semibold text-adm-text">Visitor</h3>
            <dl className="flex flex-col gap-1.5 text-[13px]">
              <Row label="Name" value={t.full_name} />
              <div className="flex justify-between gap-3"><dt className="text-adm-subtle">Email</dt>
                <dd className="min-w-0 truncate"><a href={`mailto:${t.email}`} className="inline-flex items-center gap-1 text-adm-accent hover:underline"><Mail className="size-3.5" aria-hidden />{t.email}</a></dd></div>
              {t.phone && <div className="flex justify-between gap-3"><dt className="text-adm-subtle">Phone</dt>
                <dd><a href={`tel:${t.phone}`} className="inline-flex items-center gap-1 text-adm-accent hover:underline"><Phone className="size-3.5" aria-hidden />{t.phone}</a></dd></div>}
              <Row label="Topic" value={TOPIC_LABELS[t.topic] ?? t.topic} />
              <Row label="Received" value={fmt(t.created_at)} />
              <Row label="Updated" value={timeAgo(t.updated_at)} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3"><dt className="text-adm-subtle">{label}</dt><dd className="min-w-0 truncate text-right text-adm-text-2">{value || '—'}</dd></div>
);

/* ---------- per-ticket AI help (ported from Finance's CaseAiPanel) ---------- */

/** Suggests; the admin decides. Priority changes only on "Apply priority"; the draft only fills the note box or an email. */
function AiPanel({ ticket: t, saving, onApplyPriority, onDraft }: {
  ticket: SupportTicket; saving: boolean; onApplyPriority: (p: SupportTicketPriority) => void; onDraft: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TicketAssist | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const ask = async () => {
    setBusy(true);
    setErr(null);
    const r = await assistTicket(t.id);
    if (r.ok) setResult(r.value);
    else setErr(r.error);
    setBusy(false);
  };

  const current = t.priority ?? 'normal';
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-adm-line p-4">
      <div className="flex items-center gap-2">
        <Bot className="size-4 text-adm-accent" aria-hidden />
        <h3 className="text-[13px] font-semibold text-adm-text">AI help</h3>
        <span className="truncate text-[12px] text-adm-subtle">{result ? `by ${result.model}` : 'Self-hosted AI server'}</span>
        <button type="button" className={`${btnOutline} ml-auto`} disabled={busy} onClick={() => void ask()}>
          {busy ? 'Reading…' : result ? 'Ask again' : 'Ask AI'}
        </button>
      </div>
      {busy && !result && <p className="text-[13px] text-adm-subtle">Reading the ticket. This can take up to a minute.</p>}
      {err && <p className="text-[13px] text-red-300">{err}</p>}
      {result && (
        <>
          {result.summary && <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-adm-text-2">{result.summary}</p>}
          <p className="text-[13px] text-adm-subtle">
            Priority:{' '}
            {result.priority === current
              ? <span className="text-adm-text-2">{PRIORITY_LABELS[current]}</span>
              : <span><s>{PRIORITY_LABELS[current]}</s> → <b className="text-adm-text">{PRIORITY_LABELS[result.priority]}</b></span>}
          </p>
          {result.reply && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-[12px] font-semibold text-adm-subtle">Suggested reply to the visitor</h4>
              <p className="whitespace-pre-wrap rounded-xl bg-adm-surface p-3 text-[13.5px] leading-relaxed text-adm-text-2">{result.reply}</p>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            {result.priority !== current && (
              <button type="button" className={btnOutline} disabled={saving} onClick={() => onApplyPriority(result.priority)}>Apply priority</button>
            )}
            {result.reply && (
              <>
                <button type="button" className={btnOutline} onClick={() => onDraft(result.reply)}>Use as note</button>
                <a className={btnPrimary}
                  href={`mailto:${t.email}?subject=${encodeURIComponent(`Re: ${t.subject} [${ticketKey(t)}]`)}&body=${encodeURIComponent(result.reply)}`}>
                  Email this reply
                </a>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
