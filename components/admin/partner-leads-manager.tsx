'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  HandCoins,
  Inbox,
  Mail,
  MapPin,
  MessageSquareQuote,
  Phone,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import { supabase } from '@/lib/supabase/client';
import type { FollowUpStatus, PartnerInquiry } from '@/lib/types/database';

type FilterTab = 'all' | 'qualified' | 'not_qualified';

const STATUS: Record<FollowUpStatus, { label: string; dot: string; pill: string }> = {
  new: { label: 'New', dot: 'bg-adm-accent', pill: 'bg-adm-accent-soft text-adm-accent-ink' },
  contacted: { label: 'Contacted', dot: 'bg-blue-400', pill: 'bg-blue-500/15 text-blue-300' },
  closed: { label: 'Closed', dot: 'bg-adm-faint', pill: 'bg-adm-raised text-adm-muted' },
};

const AVATAR_TONES = [
  'bg-amber-400/20 text-amber-300',
  'bg-sky-400/20 text-sky-300',
  'bg-emerald-400/20 text-emerald-300',
  'bg-violet-400/20 text-violet-300',
  'bg-rose-400/20 text-rose-300',
];

function formatLabel(value: string | null): string {
  if (!value) return '—';
  return value
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
}

function timeAgo(iso: string, now: number): string {
  const m = Math.floor((now - Date.parse(iso)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : formatDate(iso).split(',')[0];
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?';
}

function tone(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export default function PartnerLeadsManager() {
  const { rows: inquiries, setRows: setInquiries, loading, error } = useRealtimeTable<PartnerInquiry>('partner_inquiries');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const counts = useMemo(
    () => ({
      all: inquiries.length,
      qualified: inquiries.filter((i) => i.outcome === 'qualified').length,
      not_qualified: inquiries.filter((i) => i.outcome === 'not_qualified').length,
      new: inquiries.filter((i) => i.follow_up_status === 'new').length,
      contacted: inquiries.filter((i) => i.follow_up_status === 'contacted').length,
      closed: inquiries.filter((i) => i.follow_up_status === 'closed').length,
    }),
    [inquiries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inquiries.filter(
      (i) =>
        (filter === 'all' || i.outcome === filter) &&
        (!q || `${i.full_name} ${i.email} ${i.phone ?? ''}`.toLowerCase().includes(q)),
    );
  }, [inquiries, filter, query]);

  async function updateFollowUp(id: string, next: FollowUpStatus) {
    setUpdatingId(id);
    const { error: updateError } = await (
      supabase.from('partner_inquiries') as unknown as {
        update: (vals: { follow_up_status: FollowUpStatus }) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      }
    )
      .update({ follow_up_status: next })
      .eq('id', id);
    if (!updateError) setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, follow_up_status: next } : i)));
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <h2 className="sr-only">Partner Leads</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-2xl bg-adm-raised" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-adm-surface" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        <h2 className="sr-only">Partner Leads</h2>
        <p className="mb-1 font-semibold">Failed to load inquiries</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const qualifiedRate = counts.all ? Math.round((counts.qualified / counts.all) * 100) : 0;

  return (
    <div className="space-y-5">
      <h2 className="sr-only">Partner Leads</h2>

      {/* summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Users} label="Total leads" value={counts.all} hint="All time" />
        <Kpi icon={TrendingUp} label="Qualified" value={counts.qualified} hint={`${qualifiedRate}% of all leads`} accent />
        <Kpi icon={Inbox} label="Awaiting follow-up" value={counts.new} hint="Status: New" />
        <Kpi icon={CheckCircle2} label="Contacted · Closed" value={`${counts.contacted} · ${counts.closed}`} hint="Follow-up progress" />
      </div>

      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-adm-surface p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-adm-raised p-1">
          {(['all', 'qualified', 'not_qualified'] as FilterTab[]).map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-medium transition ${
                  active ? 'bg-adm-surface text-adm-text shadow-sm' : 'text-adm-muted hover:text-adm-text'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'qualified' ? 'Qualified' : 'Not qualified'}
                <span className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${active ? 'bg-adm-accent text-[#141414]' : 'bg-adm-hover text-adm-muted'}`}>
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>
        <label className="relative flex items-center sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-adm-faint" />
          <span className="sr-only">Search leads</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or phone"
            className="h-10 w-full rounded-xl border border-adm-line bg-adm-bg pr-3 pl-10 text-[13px] text-adm-text placeholder:text-adm-faint focus:border-adm-accent focus:outline-none"
          />
        </label>
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-adm-surface px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-adm-raised">
            <Inbox className="size-5 text-adm-muted" />
          </span>
          <p className="mt-4 font-medium text-adm-text">{query ? 'No leads match your search' : 'No inquiries yet'}</p>
          <p className="mt-1 text-[13px] text-adm-subtle">Submissions from the partner-with-us funnel will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-adm-surface">
          {/* column heads */}
          <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_28px] items-center gap-4 border-b border-adm-line px-5 py-3 text-[11px] font-medium tracking-wide text-adm-faint uppercase lg:grid">
            <span>Lead</span>
            <span>Budget</span>
            <span>Timeline</span>
            <span>Outcome</span>
            <span>Status</span>
            <span>Submitted</span>
            <span />
          </div>

          <ul className="divide-y divide-adm-line">
            {filtered.map((lead) => {
              const open = expandedId === lead.id;
              const st = STATUS[lead.follow_up_status];
              const qualified = lead.outcome === 'qualified';
              return (
                <li key={lead.id} className={open ? 'bg-adm-raised/40' : ''}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : lead.id)}
                    aria-expanded={open}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition hover:bg-adm-raised/50 sm:px-5 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_28px]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${tone(lead.id)}`}>
                        {initials(lead.full_name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-adm-text">{lead.full_name}</span>
                        <span className="block truncate text-[12.5px] text-adm-subtle">{lead.email}</span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5 lg:hidden">
                          <OutcomePill qualified={qualified} />
                          <StatusPill st={st} />
                        </span>
                      </span>
                    </span>
                    <span className="hidden lg:block">
                      <span className="inline-flex rounded-lg bg-adm-accent-soft px-2.5 py-1 text-[12.5px] font-semibold text-adm-accent-ink">
                        {formatLabel(lead.budget)}
                      </span>
                    </span>
                    <span className="hidden items-center gap-1.5 text-[13px] text-adm-text-2 lg:flex">
                      <Clock className="size-3.5 text-adm-faint" />
                      {formatLabel(lead.timeline)}
                    </span>
                    <span className="hidden lg:block">
                      <OutcomePill qualified={qualified} />
                    </span>
                    <span className="hidden lg:block">
                      <StatusPill st={st} />
                    </span>
                    <span className="hidden text-[12.5px] text-adm-subtle lg:block" title={formatDate(lead.created_at)}>
                      {timeAgo(lead.created_at, now)}
                    </span>
                    <ChevronDown className={`size-4 justify-self-end text-adm-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-4 px-4 pb-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                          {/* profile */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                              <Tile icon={MapPin} label="Location" value={formatLabel(lead.location)} />
                              <Tile icon={Briefcase} label="Business type" value={formatLabel(lead.business_type)} />
                              <Tile icon={Target} label="Help requested" value={formatLabel(lead.help_type)} />
                              <Tile icon={Banknote} label="Monthly revenue" value={formatLabel(lead.monthly_revenue)} />
                              <Tile icon={HandCoins} label="Willing to invest" value={formatLabel(lead.willing_to_invest)} />
                              <Tile icon={Sparkles} label="Budget" value={formatLabel(lead.budget)} highlight />
                            </div>
                            {lead.business_description && (
                              <Quote icon={Briefcase} label="Business description">
                                {lead.business_description}
                              </Quote>
                            )}
                            {lead.challenge && (
                              <Quote icon={MessageSquareQuote} label="Biggest challenge">
                                {lead.challenge}
                              </Quote>
                            )}
                          </div>

                          {/* contact + status */}
                          <aside className="space-y-3 rounded-2xl border border-adm-line bg-adm-surface p-4">
                            <div className="flex items-center gap-3">
                              <span className={`grid size-12 place-items-center rounded-full text-[15px] font-semibold ${tone(lead.id)}`}>
                                {initials(lead.full_name)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-adm-text">{lead.full_name}</p>
                                <p className="flex items-center gap-1 text-[12px] text-adm-subtle">
                                  <Calendar className="size-3" /> {formatDate(lead.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1.5 text-[13px]">
                              <a href={`mailto:${lead.email}`} className="flex items-center gap-2.5 rounded-xl bg-adm-raised px-3 py-2.5 text-adm-text-2 transition hover:text-adm-accent-ink">
                                <Mail className="size-4 shrink-0 text-adm-faint" />
                                <span className="truncate">{lead.email}</span>
                              </a>
                              <a
                                href={lead.phone ? `tel:${lead.phone}` : undefined}
                                className="flex items-center gap-2.5 rounded-xl bg-adm-raised px-3 py-2.5 text-adm-text-2 transition hover:text-adm-accent-ink"
                              >
                                <Phone className="size-4 shrink-0 text-adm-faint" />
                                <span className="truncate">{lead.phone || '—'}</span>
                              </a>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <a href={`mailto:${lead.email}`} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-adm-accent text-[13px] font-semibold text-[#141414] transition hover:brightness-95">
                                <Mail className="size-4" /> Email
                              </a>
                              <a
                                href={lead.phone ? `tel:${lead.phone}` : undefined}
                                aria-disabled={!lead.phone}
                                className={`flex h-10 items-center justify-center gap-2 rounded-xl border border-adm-line-strong text-[13px] font-semibold text-adm-text transition hover:border-adm-accent ${lead.phone ? '' : 'pointer-events-none opacity-40'}`}
                              >
                                <Phone className="size-4" /> Call
                              </a>
                            </div>
                            <div>
                              <p className="mb-1.5 text-[11px] font-medium tracking-wide text-adm-faint uppercase">Follow-up status</p>
                              <div className="grid grid-cols-3 gap-1 rounded-xl bg-adm-raised p-1">
                                {(['new', 'contacted', 'closed'] as FollowUpStatus[]).map((s) => {
                                  const active = lead.follow_up_status === s;
                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => updateFollowUp(lead.id, s)}
                                      disabled={updatingId === lead.id || active}
                                      aria-pressed={active}
                                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition ${
                                        active ? 'bg-adm-surface text-adm-text shadow-sm' : 'text-adm-muted hover:text-adm-text'
                                      } disabled:cursor-default`}
                                    >
                                      <span className={`size-1.5 rounded-full ${STATUS[s].dot}`} />
                                      {STATUS[s].label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </aside>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, accent }: { icon: LucideIcon; label: string; value: ReactNode; hint: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-adm-raised px-4 py-3.5 sm:px-5 sm:py-4">
      <p className="truncate text-[12.5px] font-medium text-adm-text-2">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`grid size-9 place-items-center rounded-xl ${accent ? 'bg-adm-accent text-[#141414]' : 'bg-adm-surface text-adm-accent-ink'}`}>
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
        <span className="text-[26px] leading-none font-semibold tracking-tight text-adm-text">{value}</span>
      </div>
      <p className="mt-2 truncate text-[11px] text-adm-subtle">{hint}</p>
    </div>
  );
}

function OutcomePill({ qualified }: { qualified: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
        qualified ? 'bg-green-500/15 text-green-300' : 'bg-red-500/10 text-red-300'
      }`}
    >
      <span className={`size-1.5 rounded-full ${qualified ? 'bg-green-400' : 'bg-red-400'}`} />
      {qualified ? 'Qualified' : 'Not qualified'}
    </span>
  );
}

function StatusPill({ st }: { st: { label: string; dot: string; pill: string } }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${st.pill}`}>
      <span className={`size-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

function Tile({ icon: Icon, label, value, highlight }: { icon: LucideIcon; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-adm-surface p-3.5">
      <span className={`grid size-8 place-items-center rounded-lg ${highlight ? 'bg-adm-accent text-[#141414]' : 'bg-adm-raised text-adm-muted'}`}>
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <p className="mt-2.5 text-[11.5px] text-adm-subtle">{label}</p>
      <p className="mt-0.5 truncate text-[14px] font-semibold text-adm-text">{value}</p>
    </div>
  );
}

function Quote({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-adm-surface p-4">
      <p className="flex items-center gap-2 text-[11.5px] font-medium tracking-wide text-adm-faint uppercase">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap text-adm-text-2">{children}</p>
    </div>
  );
}
