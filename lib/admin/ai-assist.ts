import type { SupportTicket, SupportTicketComment, SupportTicketPriority } from '@/lib/types/database';
import { PRIORITY_LABELS, STATUS_LABELS, TOPIC_LABELS } from '@/lib/admin/support-desk';

/**
 * Support-desk help from the self-hosted AI server (ported from JAZA Finances), over its
 * OpenAI-compatible API: POST {AI_SERVER_URL}/api/chat/completions (or {AI_SERVER_URL}/chat/completions
 * when it ends in /v1, for Ollama directly) with Authorization: Bearer {AI_API_KEY}.
 *
 * Env: AI_SERVER_URL (required to turn AI on), AI_API_KEY or AI_SERVER_KEY, optional AI_MODEL_FAST,
 * AI_MODEL_SMART, AI_MODEL, AI_TIMEOUT_SECONDS. Without AI_SERVER_URL the admin shows no AI at all.
 *
 * Server code only: it reads secrets from the environment.
 */
export const aiConfigured = () => Boolean(process.env.AI_SERVER_URL);
export type ModelTier = 'fast' | 'smart';
/** Cloudflare drops a request after 100 s, so stay below it by default. */
const aiTimeoutMs = () => Math.min(600, Math.max(10, Number(process.env.AI_TIMEOUT_SECONDS) || 80)) * 1000;
export const modelFor = (tier: ModelTier) => tier === 'fast'
  ? process.env.AI_MODEL_FAST || process.env.AI_MODEL || 'qwen3:4b-instruct'
  : process.env.AI_MODEL_SMART || process.env.AI_MODEL || 'gemma4:e4b';

const SMART_WORDS = /\b(why|explain|analy[sz]e|compare|draft|write|reply|respond|answer|assign|set|change|move|since|between|trend|bakit|gumawa|isulat|sumulat)\b/i;

/** Quick, simple turns go to the fast model; reasoning, changes and drafting go to smart. */
export function pickTier(text: string): ModelTier {
  const t = text.trim();
  if (!t) return 'fast';
  if (SMART_WORDS.test(t)) return 'smart';
  return t.split(/\s+/).length > 14 ? 'smart' : 'fast';
}

/** Emoji and decorative symbols out, like the Finance text guard. */
export const stripSymbols = (s: string) =>
  s.replace(/[\p{Extended_Pictographic}♠-♧•■-◿️‍]/gu, '');
const clean = (s: string, max: number) => stripSymbols(s).trim().slice(0, max);

export const NOTE_LIMIT = 5000;

/** {url}/api/chat/completions for a proxy like Open WebUI; {url}/chat/completions when url ends in /v1 (Ollama). */
export function chatUrl(url: string): string {
  const base = url.trim().replace(/\/+$/, '');
  return /\/v1$/.test(base) ? `${base}/chat/completions` : `${base}/api/chat/completions`;
}

type ChatMsg = { role: string; content: string };

async function complete(messages: ChatMsg[], maxTokens: number, tier: ModelTier): Promise<string> {
  const url = process.env.AI_SERVER_URL;
  if (!url) throw new Error('The AI server isn’t set up. Add AI_SERVER_URL to the environment.');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = process.env.AI_API_KEY || process.env.AI_SERVER_KEY;
  if (key) headers.Authorization = `Bearer ${key}`;
  let res: Response;
  try {
    res = await fetch(chatUrl(url), {
      method: 'POST', headers, signal: AbortSignal.timeout(aiTimeoutMs()), cache: 'no-store',
      body: JSON.stringify({ model: modelFor(tier), messages, stream: false, max_tokens: maxTokens }),
    });
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'TimeoutError';
    throw new Error(timedOut ? 'The AI server took too long to answer. Try again.' : 'Couldn’t reach the AI server. Check that it’s on and reachable.');
  }
  if (res.status === 401 || res.status === 403) throw new Error('The AI server refused the key. Check AI_API_KEY.');
  if (!res.ok) throw new Error(`The AI server answered ${res.status}${res.status === 404 ? `: check AI_SERVER_URL and that the model ${modelFor(tier)} exists.` : '.'}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
  return body.choices?.[0]?.message?.content ?? '';
}

/** Parses the model's JSON answer, tolerating ```json fences or text around it. */
export function parseJson(text: string): Record<string, unknown> {
  const t = text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '');
  try { return JSON.parse(t); } catch { /* fall through */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('not json');
}

const key = (n: number) => `JM-${n}`;
const PRIORITIES = Object.keys(PRIORITY_LABELS) as SupportTicketPriority[];

/* ---------- per-ticket panel ---------- */

export interface TicketAssist {
  summary: string;
  priority: SupportTicketPriority;
  reply: string;
  model: string;
}

const ASSIST_SYSTEM = `You help the support desk of JAZA Media, a creative and marketing agency whose website sells courses (Rule of 10X, Marketing Templates), takes partner inquiries, career applications and discovery-call bookings.
Read the message a visitor sent from the website Support page and answer in JSON only:
- summary: 1-3 plain sentences: what the person wants, and what is still unknown.
- priority: urgent (money or access is blocked now), high (needs a reply today), normal, low (no action really needed).
- reply: a short, friendly email reply to the visitor from the JAZA Media team, in plain English. Ask for any missing detail. Never promise a date or a refund. No emoji or special symbols.`;

export async function assistTicket(t: SupportTicket, notes: SupportTicketComment[]): Promise<TicketAssist> {
  const thread = notes.filter((n) => n.kind === 'note').slice(-10).map((n) => `Admin note: ${n.body.slice(0, 800)}`).join('\n');
  const ticket = [`Ticket: ${key(t.number)}`, `Topic: ${TOPIC_LABELS[t.topic] ?? t.topic}`, `From: ${t.full_name}`,
    `Subject: ${t.subject}`, `Message: ${t.message}`, `Current priority: ${t.priority}`, thread ? `Internal notes so far:\n${thread}` : ''].filter(Boolean).join('\n');
  const answer = await complete([{ role: 'system', content: ASSIST_SYSTEM }, { role: 'user', content: ticket }], 512, 'smart');
  let out: Record<string, unknown>;
  try { out = parseJson(answer); } catch { throw new Error('The AI server’s answer couldn’t be read. Try again.'); }
  return {
    summary: clean(String(out.summary ?? ''), 1000),
    priority: PRIORITIES.includes(out.priority as SupportTicketPriority) ? (out.priority as SupportTicketPriority) : t.priority,
    reply: clean(String(out.reply ?? ''), NOTE_LIMIT),
    model: modelFor('smart'),
  };
}

/* ---------- chat assistant ---------- */

export interface AiMessage { role: 'user' | 'assistant'; content: string }

/** One change the AI proposes. Nothing runs until the admin confirms; the server checks it again then. */
export type AiAction =
  | { type: 'change'; ticketNumber: number; priority?: SupportTicketPriority; status?: 'in_progress'; assignee?: string }
  | { type: 'note'; ticketNumber: number; body: string };

export interface AiTable { columns: string[]; rows: string[][] }

export interface AiTurn {
  say: string;
  action: AiAction | null;
  /** The confirm card's sentence, built from the checked action, not the AI's words. */
  confirm: string | null;
  suggestions: string[];
  table: AiTable | null;
}

/** Keeps a small, plain table: up to 5 columns and 20 rows of short text. */
export function cleanTable(v: unknown): AiTable | null {
  if (!v || typeof v !== 'object') return null;
  const t = v as { columns?: unknown; rows?: unknown };
  if (!Array.isArray(t.columns) || !Array.isArray(t.rows)) return null;
  const columns = t.columns.slice(0, 5).map((c) => clean(String(c ?? ''), 40));
  if (!columns.length || columns.every((c) => !c)) return null;
  const rows = t.rows.filter(Array.isArray).slice(0, 20)
    .map((r) => columns.map((_, i) => clean(String((r as unknown[])[i] ?? ''), 80)))
    .filter((r) => r.some(Boolean));
  return rows.length ? { columns, rows } : null;
}

/** Keeps 0-3 short, unique, plain suggestions. */
export function cleanSuggestions(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    const t = clean(String(x ?? ''), 80);
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length === 3) break;
  }
  return out;
}

const CHAT_SYSTEM = `You are the AI assistant in the JAZA Media website admin. You help with the support desk: tickets are messages visitors sent from the website Support page.
Answer questions from the ticket list below. When asked for a list, give it from the data below.
The only changes you can make are to support tickets. If asked to change anything else (bookings, leads, applications), say you can't do that yet and point to the right admin tab.
Answer in JSON only:
- say: your answer, brief and in plain English (no markdown). Refer to tickets by key, e.g. JM-12.
- action: "none" when the admin only asks something. "change" when they tell you to set a ticket's priority, status or assignee. "note" when they tell you to add an internal note to a ticket.
- ticket: the ticket number for change or note (12 for JM-12), else 0.
- priority: urgent, high, normal or low if they asked to change it, else "".
- status: in_progress if they asked to start it, else "". You can't resolve, close or delete tickets: say the admin can do that from the ticket itself.
- assignee: the person's name if they asked to assign it, else "".
- note: the internal note text for a note action, else "".
- table: when the answer is a list of tickets, put it here as {"columns": ["Ticket","Subject","Status"], "rows": [["JM-12","Course access","New"]]}, at most 5 columns and 20 rows, and keep "say" to one short sentence. Otherwise null.
- suggestions: 2 or 3 short next steps the admin might say to you (under 8 words each).
For change or note, "say" tells the admin what you will do once they confirm. Never claim it is already done.
Only use tickets from below. Never invent tickets, people or numbers. No emoji or special symbols.`;

/** Turns the AI's raw JSON into a checked action against the real tickets, or a question back. */
export function checkAction(out: Record<string, unknown>, tickets: SupportTicket[]): { action: AiAction | null; problem: string | null } {
  const kind = out.action;
  if (kind !== 'change' && kind !== 'note') return { action: null, problem: null };
  const n = Number(out.ticket);
  const found = tickets.find((t) => t.number === n);
  if (!found) return { action: null, problem: `I couldn't find ticket ${key(n || 0).replace('-0', '-?')}. Which ticket do you mean?` };
  if (kind === 'note') {
    const body = clean(String(out.note ?? ''), NOTE_LIMIT);
    return body ? { action: { type: 'note', ticketNumber: n, body }, problem: null } : { action: null, problem: 'What should the note say?' };
  }
  const action: Extract<AiAction, { type: 'change' }> = { type: 'change', ticketNumber: n };
  if (PRIORITIES.includes(out.priority as SupportTicketPriority) && out.priority !== found.priority) action.priority = out.priority as SupportTicketPriority;
  if (out.status === 'in_progress' && found.status !== 'in_progress') action.status = 'in_progress';
  const who = clean(String(out.assignee ?? ''), 120);
  if (who && who.toLowerCase() !== (found.assignee ?? '').toLowerCase()) action.assignee = who;
  if (!action.priority && !action.status && !action.assignee) return { action: null, problem: `${key(n)} is already like that, so there is nothing to change.` };
  return { action, problem: null };
}

/** The confirm card's sentence, built from the checked action only. */
export function describeAction(a: AiAction): string {
  if (a.type === 'note') return `Add this internal note on ${key(a.ticketNumber)}: "${a.body}"`;
  const parts = [
    a.priority && `set priority to ${PRIORITY_LABELS[a.priority]}`,
    a.status && `set status to ${STATUS_LABELS[a.status]}`,
    a.assignee && `assign it to ${a.assignee}`,
  ].filter(Boolean);
  return `On ${key(a.ticketNumber)}: ${parts.join(', ')}.`;
}

/** Chat with the AI about the tickets. Nothing is saved here. */
export async function chatWithAi(history: AiMessage[], tickets: SupportTicket[]): Promise<AiTurn> {
  const list = tickets.slice(0, 60).map((t) =>
    `${key(t.number)} | ${STATUS_LABELS[t.status]} | ${PRIORITY_LABELS[t.priority] ?? t.priority} | ${TOPIC_LABELS[t.topic] ?? t.topic} | ${t.subject} | from ${t.full_name} | received ${t.created_at.slice(0, 10)}${t.assignee ? ` | assigned to ${t.assignee}` : ''}`).join('\n');
  const system = `${CHAT_SYSTEM}\n\nToday: ${new Date().toISOString().slice(0, 10)}\n\nSupport tickets (key | status | priority | topic | subject | from | received):\n${list || '(no tickets)'}`;
  const turns = history.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  const last = [...history].reverse().find((m) => m.role === 'user')?.content ?? '';
  const answer = await complete([{ role: 'system', content: system }, ...turns], 1024, pickTier(last));
  let out: Record<string, unknown>;
  try { out = parseJson(answer); } catch {
    return { say: clean(answer, 4000) || 'No answer. Try asking another way.', action: null, confirm: null, suggestions: [], table: null };
  }
  const { action, problem } = checkAction(out, tickets);
  const say = problem ?? (clean(String(out.say ?? ''), 4000) || 'No answer. Try asking another way.');
  return { say, action, confirm: action ? describeAction(action) : null, suggestions: cleanSuggestions(out.suggestions), table: problem ? null : cleanTable(out.table) };
}
