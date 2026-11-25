import type {
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTopic,
} from '@/lib/types/database';

/** The support desk's views, filters and sort as plain rules (ported from the Finance desk). */

export type DeskView = 'all' | 'open' | 'mine' | 'new' | 'in_progress' | 'resolved';
export type DeskSort = 'updated' | 'priority' | 'newest';

export interface DeskFilters {
  view: DeskView;
  query: string;
  priority: SupportTicketPriority | 'any';
  topic: SupportTopic | 'any';
  sort: DeskSort;
}

export const NO_FILTERS: DeskFilters = { view: 'open', query: '', priority: 'any', topic: 'any', sort: 'updated' };

export const VIEWS: { value: DeskView; label: string }[] = [
  { value: 'all', label: 'All tickets' },
  { value: 'open', label: 'Open' },
  { value: 'mine', label: 'Assigned to me' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

export const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export const TOPIC_LABELS: Record<SupportTopic, string> = {
  general: 'General Inquiry',
  course_rule_of_10x: 'Course — Rule of 10X',
  course_marketing_templates: 'Course — Marketing Templates',
  career_application_status: 'Career Application',
  partnership_followup: 'Partnership Follow-Up',
  billing: 'Billing / Payment',
  other: 'Other',
};

const RANK: Record<SupportTicketPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

export const isOpen = (s: SupportTicketStatus) => s === 'new' || s === 'in_progress';

/** JM-12; falls back to a short id before the migration has run. */
export const ticketKey = (t: Pick<SupportTicket, 'number' | 'id'>) =>
  t.number != null ? `JM-${t.number}` : t.id.slice(0, 8).toUpperCase();

export function inView(t: SupportTicket, view: DeskView, me: string | null): boolean {
  switch (view) {
    case 'all': return true;
    case 'open': return isOpen(t.status);
    case 'mine': return !!me && t.assignee === me && isOpen(t.status);
    case 'resolved': return t.status === 'resolved' || t.status === 'closed';
    default: return t.status === view;
  }
}

export function matchesTicket(t: SupportTicket, query: string): boolean {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;
  return [ticketKey(t), String(t.number ?? ''), t.subject, t.full_name, t.email, t.message]
    .some((v) => v.toLowerCase().includes(q));
}

export function applyDeskFilters(tickets: SupportTicket[], f: DeskFilters, me: string | null): SupportTicket[] {
  const time = (iso: string) => new Date(iso).getTime();
  return tickets
    .filter((t) => inView(t, f.view, me) && matchesTicket(t, f.query)
      && (f.priority === 'any' || (t.priority ?? 'normal') === f.priority)
      && (f.topic === 'any' || t.topic === f.topic))
    .sort((a, b) => {
      if (f.sort === 'priority') return RANK[a.priority ?? 'normal'] - RANK[b.priority ?? 'normal'] || time(b.updated_at) - time(a.updated_at);
      if (f.sort === 'newest') return time(b.created_at) - time(a.created_at);
      return time(b.updated_at) - time(a.updated_at);
    });
}

export const hasFilters = (f: DeskFilters) =>
  Boolean(f.query) || f.priority !== 'any' || f.topic !== 'any' || f.sort !== 'updated';

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium' });
}
