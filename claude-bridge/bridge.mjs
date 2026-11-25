#!/usr/bin/env node
// JAZA Media website admin · Claude bridge (ported from JAZA Finances' claude-bridge)
//
// Lets the "AI Agent" page in the site admin use Claude Code on THIS computer, signed in with this
// computer's own Claude subscription (no API key). The page talks to http://127.0.0.1:47822; each
// message runs `claude -p` with the model picked on the page (opus / sonnet / haiku) and the
// jaza-media-site connector (the site's /api/mcp, added once with `claude mcp add`).
//
// Modes:
//   site (default): the site connector, web search and reading files only.
//   full: like Claude Desktop with every permission: shell, files in the home folder, web, other connectors.
//
// Only pages from the JAZA Media site (and localhost) may call it.
// Start: node claude-bridge/bridge.mjs   or at every login: sh claude-bridge/install.sh
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PORT = Number(process.env.JAZA_SITE_BRIDGE_PORT) || 47822;
const ORIGINS = [
  /^https:\/\/(www\.|admin\.)?jazamedia\.com$/,
  /^https:\/\/jaza-media-site(-[a-z0-9-]+)?\.vercel\.app$/,
  /^http:\/\/(localhost|127\.0\.0\.1|admin\.localhost)(:\d+)?$/,
];
const MODELS = new Set(['opus', 'sonnet', 'haiku']);
const VERSION = '1.0.0';
const APP = 'jaza-site-claude-bridge';
const MCP = 'jaza-media-site';
// The website's own code, where Claude builds in full mode.
const REPO = process.env.JAZA_SITE_REPO || join(homedir(), 'Documents', 'jaza-media-site');

function claudeBin() {
  const tries = [process.env.CLAUDE_BIN, join(homedir(), '.local', 'bin', 'claude'), '/opt/homebrew/bin/claude', '/usr/local/bin/claude'];
  const hit = tries.find((p) => p && existsSync(p));
  if (hit) return hit;
  try { return execFileSync('/bin/sh', ['-lc', 'command -v claude']).toString().trim() || 'claude'; } catch { return 'claude'; }
}
const CLAUDE = claudeBin();

const BASE_PROMPT = [
  'You are Claude inside the JAZA Media website admin, opened from its "AI Agent" page.',
  `Use the ${MCP} tools for anything about the site's admin data: support tickets from the Support page, partner leads, career applications, discovery-call bookings and course requests (Rule of 10X, Marketing Templates). The team works in Asia/Manila time.`,
  'Before changing a ticket, adding a note, or doing anything else that changes data or sends something, say exactly what you will do and wait for the user to say yes in the chat.',
  'Answer in short, plain sentences for a business owner, not a developer. Use a simple table when listing several rows.',
].join(' ');
const FULL_NOTE = ' You have full access on this computer, like Claude Desktop: shell commands, files in the home folder, the web and any other connected tools. '
  + `You can also build the website itself: its code is the current folder (${REPO}), a Next.js + Supabase app; follow its AGENTS.md. Work directly on main; other people commit too, so git pull --rebase first and never stage files you did not touch. `
  + 'Pushing main deploys the live site, so push only after the user says yes in this chat. Never add a Co-Authored-By Claude line to commits. '
  + 'For database changes, give the SQL for the user to paste in Supabase instead of running it. '
  + 'Before anything destructive or hard to undo (deleting files or data, git push, sending emails or messages, spending money, changing system settings), stop and ask the user to confirm. Never reveal passwords or keys; show secrets masked.';

function allowed(origin) { return !!origin && ORIGINS.some((re) => re.test(origin)); }

function cors(req, res) {
  const origin = req.headers.origin;
  if (allowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Chrome's Private Network Access: a public site may call this computer only when it says yes.
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  return allowed(origin);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 200_000) { reject(new Error('too big')); req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
  });
}

/** Plain words for what Claude is doing, shown under the answer while it works. */
function step(name, input = {}) {
  if (name.startsWith(`mcp__${MCP}__`)) {
    const t = name.slice(`mcp__${MCP}__`.length);
    return ({ list_tickets: 'Listing tickets', get_ticket: 'Opening the ticket', change_ticket: 'Changing the ticket', add_ticket_note: 'Adding a note',
      list_partner_leads: 'Looking up partner leads', list_career_applications: 'Looking up applications', list_bookings: 'Looking up discovery calls',
      list_course_requests: 'Looking up course requests' })[t] ?? 'Using the JAZA Media site';
  }
  if (name.startsWith('mcp__')) return `Using ${name.split('__')[1]}`;
  if (name === 'WebSearch') return `Searching the web${input.query ? ` for "${String(input.query).slice(0, 50)}"` : ''}`;
  if (name === 'WebFetch') { try { return `Reading ${new URL(input.url).hostname}`; } catch { return 'Reading a web page'; } }
  if (name === 'Bash') return input.description ? String(input.description).slice(0, 80) : 'Running a command';
  if (name === 'Read' || name === 'Glob' || name === 'Grep') return 'Looking at files';
  if (name === 'Edit' || name === 'Write') return 'Editing a file';
  return `Using ${name}`;
}

const running = new Map(); // sessionId|'new' -> child

async function chat(req, res) {
  let body;
  try { body = await readBody(req); } catch { res.writeHead(400).end('Bad request'); return; }
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 8000) : '';
  if (!message) { res.writeHead(400).end('Type a message first'); return; }
  const model = MODELS.has(body.model) ? body.model : 'sonnet';
  const full = body.mode === 'full';
  const sessionId = typeof body.sessionId === 'string' && /^[0-9a-f-]{36}$/i.test(body.sessionId) ? body.sessionId : null;
  const context = typeof body.context === 'string' ? `\n\n(The user is looking at: ${body.context.slice(0, 300)})` : '';

  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--model', model];
  if (full) args.push('--permission-mode', 'bypassPermissions', '--add-dir', homedir(), '--append-system-prompt', BASE_PROMPT + FULL_NOTE);
  else args.push('--allowedTools', `mcp__${MCP},WebSearch,WebFetch,Read,Glob,Grep`, '--disallowedTools', 'Bash,Edit,Write,NotebookEdit', '--append-system-prompt', BASE_PROMPT);
  if (sessionId) args.push('--resume', sessionId);

  const key = sessionId ?? 'new';
  running.get(key)?.kill('SIGTERM');
  const child = spawn(CLAUDE, args, { cwd: existsSync(REPO) ? REPO : join(homedir(), 'Documents'), env: process.env, stdio: ['pipe', 'pipe', 'pipe'] });
  running.set(key, child);
  child.stdin.on('error', () => {});
  child.stdin.end(message + context);
  const timer = setTimeout(() => child.kill('SIGTERM'), 10 * 60_000);

  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' });
  const send = (e) => { try { res.write(JSON.stringify(e) + '\n'); } catch { /* gone */ } };
  let buf = '';
  let err = '';
  let done = false;
  child.stdout.on('data', (c) => {
    buf += c.toString('utf8');
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      let m; try { m = JSON.parse(line); } catch { continue; }
      if (m.type === 'system' && m.subtype === 'init') send({ type: 'session', sessionId: m.session_id, model: m.model });
      else if (m.type === 'assistant' && Array.isArray(m.message?.content)) {
        for (const p of m.message.content) {
          if (p.type === 'text' && p.text) send({ type: 'text', text: p.text });
          if (p.type === 'tool_use') send({ type: 'step', text: step(p.name, p.input) });
        }
      } else if (m.type === 'result') {
        done = true;
        send({ type: 'done', sessionId: m.session_id, error: m.is_error ? String(m.result ?? 'Claude hit an error') : undefined });
      }
    }
  });
  child.stderr.on('data', (c) => { err += c.toString('utf8'); });
  child.on('error', (e) => { send({ type: 'done', error: `Couldn't start Claude Code: ${e.message}` }); });
  child.on('close', (code) => {
    clearTimeout(timer);
    if (running.get(key) === child) running.delete(key);
    if (!done && code) {
      const login = /log ?in|auth|credential/i.test(err) ? ' Open Terminal and run: claude, then /login.' : '';
      send({ type: 'done', error: (err.trim().slice(-300) || `Claude stopped (${code}).`) + login });
    }
    res.end();
  });
  // Stop button: the page aborts the request, which closes it and stops Claude.
  res.on('close', () => { if (!done) child.kill('SIGTERM'); });
}

createServer(async (req, res) => {
  const ok = cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(ok ? 204 : 403).end(); return; }
  if (!ok) { res.writeHead(403).end('Only the JAZA Media site may use this.'); return; }
  // Requests relayed from another device (e.g. a tunnel) are refused: this bridge is for this computer only.
  if (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']) { res.writeHead(403).end('This computer only.'); return; }
  const path = new URL(req.url, 'http://x').pathname;
  if (req.method === 'GET' && path === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true, app: APP, version: VERSION, models: [...MODELS] }));
    return;
  }
  if (req.method === 'POST' && path === '/chat') return chat(req, res);
  res.writeHead(404).end();
}).listen(PORT, '127.0.0.1', () => console.log(`JAZA Media site Claude bridge on http://127.0.0.1:${PORT} using ${CLAUDE}`));
