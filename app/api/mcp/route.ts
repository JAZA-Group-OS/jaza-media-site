import { timingSafeEqual } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_EMAIL } from '@/lib/admin/config';
import { PRIORITY_LABELS, STATUS_LABELS, TOPIC_LABELS } from '@/lib/admin/support-desk';
import type { SupportTicket, SupportTicketComment, SupportTicketPriority, SupportTicketStatus, SupportTicketUpdate } from '@/lib/types/database';

/**
 * The Claude connector for the JAZA Media website admin (ported from JAZA Finances' /api/mcp):
 * a remote MCP server (Streamable HTTP, stateless JSON) so Claude Code on the owner's computer
 * (claude-bridge/bridge.mjs) can read the site's admin data and work the support desk.
 *
 *   claude mcp add --transport http jaza-media-site https://<site>/api/mcp --header "Authorization: Bearer <key>"
 *
 * The key comes from CLAUDE_CONNECTOR_KEY (long and random: openssl rand -hex 32). Without it the
 * route refuses everything. A valid key acts as the admin, so reads use the service-role client;
 * writes are limited to support-ticket priority/status/assignee and internal notes.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Json = Record<string, unknown>;

function validKey(given: string): boolean {
  const want = (process.env.CLAUDE_CONNECTOR_KEY ?? '').trim();
  if (want.length < 24 || given.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(want));
}

const number = { type: 'integer', description: 'Ticket number, e.g. 12 for JM-12' };
const limit = { type: 'integer', description: 'How many, newest first (default 20, max 100)' };
const ro = { readOnlyHint: true };

const TOOLS = [
  {
    name: 'list_tickets',
    description: 'Support tickets (messages from the website Support page), newest activity first, with number, status, priority, topic and assignee.',
    inputSchema: { type: 'object', properties: { status: { type: 'string', enum: ['open', 'new', 'in_progress', 'resolved', 'closed', 'any'], description: 'Default: open (new or in progress)' }, limit } },
    annotations: ro,
  },
  {
    name: 'get_ticket',
    description: 'One ticket in full: the visitor’s message and contact details, plus its internal notes and activity.',
    inputSchema: { type: 'object', properties: { number }, required: ['number'] },
    annotations: ro,
  },
  {
    name: 'change_ticket',
    description: 'Change a ticket’s status, priority or assignee. Confirm with the user first.',
    inputSchema: {
      type: 'object',
      properties: {
        number,
        status: { type: 'string', enum: ['new', 'in_progress', 'resolved', 'closed'] },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
        assignee: { type: 'string', description: 'A person’s name, or "nobody" to unassign' },
      },
      required: ['number'],
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: 'add_ticket_note',
    description: 'Add an internal note to a ticket (admins only; the visitor never sees it). Confirm the wording with the user first.',
    inputSchema: { type: 'object', properties: { number, note: { type: 'string' } }, required: ['number', 'note'] },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  { name: 'list_partner_leads', description: 'Partner With Us inquiries, newest first.', inputSchema: { type: 'object', properties: { limit } }, annotations: ro },
  { name: 'list_career_applications', description: 'Career applications from the careers page, newest first.', inputSchema: { type: 'object', properties: { limit } }, annotations: ro },
  { name: 'list_bookings', description: 'Discovery-call bookings, newest first.', inputSchema: { type: 'object', properties: { limit } }, annotations: ro },
  {
    name: 'list_course_requests',
    description: 'Course access / template requests (Rule of 10X, Marketing Templates), newest first.',
    inputSchema: { type: 'object', properties: { limit } },
    annotations: ro,
  },
];

const INSTRUCTIONS = 'JAZA Media website admin: support tickets from the Support page, partner leads, career applications, discovery-call bookings and course requests. '
  + 'Times are stored in UTC; the team is in Asia/Manila. Always ask the user before changing a ticket or adding a note.';

// The hand-written Database type doesn't satisfy supabase-js generics; narrow loose view like the rest of the admin.
type Res = Promise<{ data: unknown; error: { message: string } | null }>;
type Q = {
  select: (c: string) => Q;
  eq: (c: string, v: unknown) => Q;
  in: (c: string, v: unknown[]) => Q;
  order: (c: string, o: { ascending: boolean }) => Q;
  limit: (n: number) => Res;
  maybeSingle: () => Res;
  then: Res['then'];
};
type Db = {
  from: (t: string) => Q & {
    update: (v: Json) => { eq: (c: string, v: unknown) => { select: () => { single: () => Res } } };
    insert: (row: Json) => Res;
  };
};
const db = () => createAdminClient() as unknown as Db;

const lim = (v: unknown) => Math.min(100, Math.max(1, Number(v) || 20));
const ticketLine = (t: SupportTicket) =>
  `JM-${t.number} | ${STATUS_LABELS[t.status]} | ${PRIORITY_LABELS[t.priority] ?? t.priority} | ${TOPIC_LABELS[t.topic] ?? t.topic} | ${t.subject} | from ${t.full_name} <${t.email}> | assignee ${t.assignee ?? 'nobody'} | updated ${t.updated_at.slice(0, 16)}`;

async function rows(table: string, n: unknown, omit: string[] = []): Promise<string> {
  const { data, error } = await db().from(table).select('*').order('created_at', { ascending: false }).limit(lim(n));
  if (error) throw new Error(error.message);
  const list = (data as Json[] | null) ?? [];
  if (!list.length) return 'None.';
  return `${list.length} row(s):\n${list.map((r) => JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k, v]) => !omit.includes(k) && v !== null && v !== '')))).join('\n')}`;
}

async function findTicket(n: unknown): Promise<SupportTicket> {
  const { data, error } = await db().from('support_tickets').select('*').eq('number', Number(n)).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`There is no ticket JM-${n}.`);
  return data as SupportTicket;
}

async function note(ticketId: string, kind: 'note' | 'event', body: string) {
  const { error } = await db().from('support_ticket_comments').insert({ ticket_id: ticketId, kind, body, author_email: ADMIN_EMAIL });
  if (error) throw new Error(error.message);
}

const STATUSES: SupportTicketStatus[] = ['new', 'in_progress', 'resolved', 'closed'];

async function call(name: string, args: Json): Promise<string> {
  switch (name) {
    case 'list_tickets': {
      const status = String(args.status ?? 'open');
      let q = db().from('support_tickets').select('*');
      if (status === 'open') q = q.in('status', ['new', 'in_progress']);
      else if (status !== 'any') q = q.eq('status', status);
      const { data, error } = await q.order('updated_at', { ascending: false }).limit(lim(args.limit));
      if (error) throw new Error(error.message);
      const list = (data as SupportTicket[] | null) ?? [];
      return list.length ? `${list.length} ticket(s):\n${list.map(ticketLine).join('\n')}` : 'No tickets match.';
    }
    case 'get_ticket': {
      const t = await findTicket(args.number);
      const { data } = await db().from('support_ticket_comments').select('*').eq('ticket_id', t.id).order('created_at', { ascending: true }).limit(200);
      const notes = (data as SupportTicketComment[] | null) ?? [];
      return [
        ticketLine(t),
        `Phone: ${t.phone || '-'} | Received: ${t.created_at.slice(0, 16)}`,
        `Message:\n${t.message}`,
        t.admin_notes ? `Earlier admin notes:\n${t.admin_notes}` : '',
        `Notes and activity:\n${notes.map((c) => `${c.created_at.slice(0, 16)} ${c.author_email}${c.kind === 'event' ? ' [event]' : ''}: ${c.body}`).join('\n') || '-'}`,
      ].filter(Boolean).join('\n\n');
    }
    case 'change_ticket': {
      const t = await findTicket(args.number);
      const changes: SupportTicketUpdate = {};
      const parts: string[] = [];
      if (typeof args.status === 'string' && STATUSES.includes(args.status as SupportTicketStatus) && args.status !== t.status) {
        changes.status = args.status as SupportTicketStatus;
        parts.push(`set status to ${STATUS_LABELS[changes.status]}`);
      }
      if (typeof args.priority === 'string' && args.priority in PRIORITY_LABELS && args.priority !== t.priority) {
        changes.priority = args.priority as SupportTicketPriority;
        parts.push(`set priority to ${PRIORITY_LABELS[changes.priority]}`);
      }
      if (typeof args.assignee === 'string') {
        const who = args.assignee.trim().slice(0, 120);
        const next = !who || who.toLowerCase() === 'nobody' ? null : who;
        if (next !== t.assignee) {
          changes.assignee = next;
          parts.push(next ? `assigned to ${next}` : 'unassigned');
        }
      }
      if (!parts.length) throw new Error('There is nothing to change.');
      const { data, error } = await db().from('support_tickets').update(changes as Json).eq('id', t.id).select().single();
      if (error) throw new Error(error.message);
      await note(t.id, 'event', `${parts.join(', ')} (via Claude)`);
      return `Changed. ${ticketLine(data as SupportTicket)}`;
    }
    case 'add_ticket_note': {
      const t = await findTicket(args.number);
      const body = String(args.note ?? '').trim().slice(0, 5000);
      if (!body) throw new Error('The note is empty.');
      await note(t.id, 'note', body);
      return `Note added to JM-${t.number}.`;
    }
    case 'list_partner_leads': return rows('partner_inquiries', args.limit);
    case 'list_career_applications':
      return rows('career_applications', args.limit, ['resume_size_bytes', 'resume_mime_type', 'portfolio_size_bytes', 'portfolio_mime_type']);
    case 'list_bookings': return rows('bookings', args.limit, ['google_event_id']);
    case 'list_course_requests': return rows('course_requests', args.limit);
    default: throw new Error(`Unknown tool ${name}.`);
  }
}

const rpc = (id: unknown, body: { result: unknown } | { error: { code: number; message: string } }) =>
  Response.json({ jsonrpc: '2.0', id: id ?? null, ...body });

async function handle(msg: Json): Promise<Response> {
  const { id, method } = msg;
  const params = (msg.params ?? {}) as Json;
  if (id === undefined) return new Response(null, { status: 202 }); // notifications
  switch (method) {
    case 'initialize':
      return rpc(id, { result: { protocolVersion: params.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'jaza-media-site', version: '1.0.0' }, instructions: INSTRUCTIONS } });
    case 'ping':
      return rpc(id, { result: {} });
    case 'tools/list':
      return rpc(id, { result: { tools: TOOLS } });
    case 'tools/call':
      try {
        const text = await call(String(params.name), (params.arguments ?? {}) as Json);
        return rpc(id, { result: { content: [{ type: 'text', text }] } });
      } catch (e) {
        return rpc(id, { result: { content: [{ type: 'text', text: e instanceof Error ? e.message : 'That didn’t work.' }], isError: true } });
      }
    default:
      return rpc(id, { error: { code: -32601, message: `Method not found: ${method}` } });
  }
}

export async function POST(req: Request) {
  const key = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? '';
  if (!validKey(key)) return Response.json({ error: 'A valid connector key is required.' }, { status: 401 });
  let msg: Json;
  try { msg = await req.json(); } catch { return rpc(null, { error: { code: -32700, message: 'Parse error' } }); }
  if (Array.isArray(msg)) return rpc(null, { error: { code: -32600, message: 'Batches are not supported.' } });
  return handle(msg);
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
