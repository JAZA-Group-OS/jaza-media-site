import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  aiConfigured, chatUrl, checkAction, cleanSuggestions, cleanTable, describeAction, parseJson, pickTier,
} from './ai-assist';
import type { SupportTicket } from '@/lib/types/database';

const ticket = (n: number, over: Partial<SupportTicket> = {}): SupportTicket => ({
  id: `id-${n}`, number: n, full_name: 'Ana', email: 'ana@example.com', phone: null, topic: 'general',
  subject: 'Help', message: 'Hi', status: 'new', priority: 'normal', assignee: null, admin_notes: null,
  source: 'marketing_site', created_at: '2026-11-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z', ...over,
});
const tickets = [ticket(1), ticket(2, { priority: 'urgent', status: 'in_progress', assignee: 'Ana' })];

afterEach(() => vi.unstubAllEnvs());

describe('config', () => {
  it('is off without AI_SERVER_URL', () => {
    vi.stubEnv('AI_SERVER_URL', '');
    expect(aiConfigured()).toBe(false);
    vi.stubEnv('AI_SERVER_URL', 'https://ai.example.com');
    expect(aiConfigured()).toBe(true);
  });
  it('builds the chat url for a proxy or for Ollama /v1', () => {
    expect(chatUrl('https://ai.example.com/')).toBe('https://ai.example.com/api/chat/completions');
    expect(chatUrl('https://ai.example.com/v1')).toBe('https://ai.example.com/v1/chat/completions');
  });
  it('picks the smart model for changes and long questions', () => {
    expect(pickTier('urgent tickets?')).toBe('fast');
    expect(pickTier('assign JM-2 to Ana')).toBe('smart');
  });
});

describe('checkAction', () => {
  it('ignores plain answers', () => {
    expect(checkAction({ action: 'none' }, tickets)).toEqual({ action: null, problem: null });
  });
  it('asks back for an unknown ticket', () => {
    expect(checkAction({ action: 'change', ticket: 99, priority: 'high' }, tickets).problem).toMatch(/couldn't find/);
  });
  it('keeps only real changes', () => {
    const r = checkAction({ action: 'change', ticket: 1, priority: 'high', status: 'resolved', assignee: 'Ben' }, tickets);
    expect(r.action).toEqual({ type: 'change', ticketNumber: 1, priority: 'high', assignee: 'Ben' });
    expect(describeAction(r.action!)).toBe('On JM-1: set priority to High, assign it to Ben.');
  });
  it('says when nothing would change', () => {
    expect(checkAction({ action: 'change', ticket: 2, priority: 'urgent', status: 'in_progress', assignee: 'ana' }, tickets).problem).toMatch(/nothing to change/);
  });
  it('builds a note action', () => {
    expect(checkAction({ action: 'note', ticket: 2, note: 'Called back' }, tickets).action).toEqual({ type: 'note', ticketNumber: 2, body: 'Called back' });
    expect(checkAction({ action: 'note', ticket: 2, note: '' }, tickets).problem).toMatch(/What should/);
  });
});

describe('cleaning', () => {
  it('parses fenced json', () => {
    expect(parseJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJson('sure: {"a":2} ok')).toEqual({ a: 2 });
  });
  it('caps tables and dedupes suggestions', () => {
    expect(cleanTable({ columns: ['A'], rows: [['x'], ['']] })).toEqual({ columns: ['A'], rows: [['x']] });
    expect(cleanTable('nope')).toBeNull();
    expect(cleanSuggestions(['a', 'A', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c']);
  });
});
