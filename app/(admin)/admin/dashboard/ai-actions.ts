'use server';

import { createServerClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/admin/config';
import {
  aiConfigured,
  assistTicket as assist,
  chatWithAi,
  describeAction,
  NOTE_LIMIT,
  stripSymbols,
  type AiAction,
  type AiMessage,
  type AiTurn,
  type TicketAssist,
} from '@/lib/admin/ai-assist';
import { PRIORITY_LABELS } from '@/lib/admin/support-desk';
import type { SupportTicket, SupportTicketComment, SupportTicketPriority, SupportTicketUpdate } from '@/lib/types/database';

/**
 * The admin AI assistant's server calls (ported from Finance's support-desk-actions).
 * Every call re-checks the admin session; reads and writes go through the cookie-bound
 * Supabase client, so the same admin-email RLS as the desk applies.
 */

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

async function admin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || user.email !== ADMIN_EMAIL) throw new Error('Your session has ended. Sign in again.');
  return { supabase, email: user.email };
}

async function run<T>(work: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await work() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'That didn’t work. Try again.' };
  }
}

type Db = Awaited<ReturnType<typeof admin>>['supabase'];
// The hand-written Database type doesn't satisfy supabase-js generics; narrow casts like the rest of the admin.
type Loose = {
  from: (t: string) => {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      eq: (c: string, v: string) => {
        order: (c: string, o: { ascending: boolean }) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
        maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
    update: (v: SupportTicketUpdate) => { eq: (c: string, v: string) => { select: () => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } } };
    insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};
const db = (s: Db) => s as unknown as Loose;

async function loadTickets(s: Db): Promise<SupportTicket[]> {
  const { data, error } = await db(s).from('support_tickets').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(`Tickets didn't load: ${error.message}`);
  return (data ?? []) as SupportTicket[];
}

/** Whether the AI server is set up; the admin hides every AI control when it isn't. */
export async function aiEnabled(): Promise<boolean> {
  try {
    await admin();
    return aiConfigured();
  } catch {
    return false;
  }
}

/** The per-ticket panel: summary, suggested priority, and a draft reply. Nothing is saved. */
export async function assistTicket(id: string): Promise<Result<TicketAssist>> {
  return run(async () => {
    const { supabase } = await admin();
    const t = await db(supabase).from('support_tickets').select('*').eq('id', id).maybeSingle();
    if (t.error || !t.data) throw new Error('That ticket no longer exists.');
    const notes = await db(supabase).from('support_ticket_comments').select('*').eq('ticket_id', id).order('created_at', { ascending: true });
    return assist(t.data as SupportTicket, (notes.data ?? []) as SupportTicketComment[]);
  });
}

/** The chat: answers about the tickets and may propose one change. Nothing is saved here. */
export async function askAi(history: AiMessage[]): Promise<Result<AiTurn>> {
  return run(async () => {
    const { supabase } = await admin();
    const kept = (Array.isArray(history) ? history : [])
      .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12);
    if (!kept.length || kept[kept.length - 1].role !== 'user') throw new Error('Type a question first.');
    return chatWithAi(kept, await loadTickets(supabase));
  });
}

/**
 * Runs the change the AI proposed, after the admin confirmed it. Checked again here
 * against the ticket as it stands now; logs the same activity line the desk buttons do.
 */
export async function runAiAction(action: AiAction): Promise<Result<string>> {
  return run(async () => {
    const { supabase, email } = await admin();
    const found = (await loadTickets(supabase)).find((t) => t.number === Number(action?.ticketNumber));
    if (!found) throw new Error('That ticket no longer exists.');
    if (action.type === 'note') {
      const body = stripSymbols(String(action.body ?? '')).trim().slice(0, NOTE_LIMIT);
      if (!body) throw new Error('The note is empty.');
      const { error } = await db(supabase).from('support_ticket_comments').insert({ ticket_id: found.id, kind: 'note', body, author_email: email });
      if (error) throw new Error(error.message);
      return describeAction({ ...action, body });
    }
    if (action.type !== 'change') throw new Error('The AI can only change a ticket or add a note.');
    const changes: SupportTicketUpdate = {};
    const parts: string[] = [];
    if (action.priority && action.priority in PRIORITY_LABELS && action.priority !== found.priority) {
      changes.priority = action.priority as SupportTicketPriority;
      parts.push(`set priority to ${PRIORITY_LABELS[changes.priority]}`);
    }
    if (action.status === 'in_progress' && found.status !== 'in_progress') {
      changes.status = 'in_progress';
      parts.push('set status to In progress');
    }
    const who = stripSymbols(String(action.assignee ?? '')).trim().slice(0, 120);
    if (who && who !== found.assignee) {
      changes.assignee = who;
      parts.push(`assigned to ${who}`);
    }
    if (!parts.length) throw new Error('There is nothing to change.');
    const { error } = await db(supabase).from('support_tickets').update(changes).eq('id', found.id).select().single();
    if (error) throw new Error(error.message);
    await db(supabase).from('support_ticket_comments').insert({ ticket_id: found.id, kind: 'event', body: `${parts.join(', ')} (via AI assistant)`, author_email: email });
    return describeAction({ type: 'change', ticketNumber: found.number, ...changes } as AiAction);
  });
}
