'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import type { PartnerInquiry, FollowUpStatus } from '@/lib/types/database';

type FilterTab = 'all' | 'qualified' | 'not_qualified';

const followUpLabels: Record<FollowUpStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

const followUpColors: Record<FollowUpStatus, string> = {
  new: 'bg-adm-accent/20 text-adm-accent-ink border-adm-accent/30',
  contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  closed: 'bg-gray-500/20 text-adm-text-2 border-gray-500/30',
};

function formatLabel(value: string | null): string {
  if (!value) return '—';
  return value
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function PartnerLeadsManager() {
  const {
    rows: inquiries,
    setRows: setInquiries,
    loading,
    error,
  } = useRealtimeTable<PartnerInquiry>('partner_inquiries');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return inquiries;
    return inquiries.filter((i) => i.outcome === filter);
  }, [inquiries, filter]);

  const counts = useMemo(
    () => ({
      all: inquiries.length,
      qualified: inquiries.filter((i) => i.outcome === 'qualified').length,
      not_qualified: inquiries.filter((i) => i.outcome === 'not_qualified').length,
    }),
    [inquiries],
  );

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

    if (!updateError) {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, follow_up_status: next } : i)));
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">Partner Leads</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-adm-surface border border-adm-line animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">Partner Leads</h2>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <p className="font-semibold mb-1">Failed to load inquiries</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="sr-only">Partner Leads</h2>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-1.5 sm:flex-wrap">
            {(['all', 'qualified', 'not_qualified'] as FilterTab[]).map((tab) => {
              const active = filter === tab;
              const muted = !active && counts[tab] === 0;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-adm-accent text-black'
                      : 'text-adm-muted hover:bg-white/5 hover:text-adm-text'
                  } ${muted ? 'opacity-40' : ''}`}
                >
                  {tab === 'all' ? 'All' : tab === 'qualified' ? 'Qualified' : 'Not Qualified'}
                  <span className={`ml-1 ${active ? 'opacity-70' : 'opacity-50'}`}>
                    ({counts[tab]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-lg bg-adm-surface border border-adm-line text-center">
          <p className="text-adm-muted mb-2">No inquiries yet</p>
          <p className="text-xs text-adm-subtle">
            Submissions from the partner-with-us funnel will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead, index) => {
            const isExpanded = expandedId === lead.id;
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="rounded-lg bg-adm-surface border border-adm-line hover:border-adm-accent/30 transition-colors"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                  className="w-full p-4 sm:p-5 text-left"
                >
                  {/* Mobile */}
                  <div className="space-y-3.5 sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate">{lead.full_name}</p>
                        <p className="text-xs text-adm-muted truncate mt-0.5">{lead.email}</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-adm-muted shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">Budget</p>
                        <p className="mt-0.5 text-sm font-semibold text-adm-accent-ink truncate">
                          {formatLabel(lead.budget)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">Timeline</p>
                        <p className="mt-0.5 text-sm font-semibold truncate">{formatLabel(lead.timeline)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">Outcome</p>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                            lead.outcome === 'qualified'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-red-500/10 text-red-300 border border-red-500/20'
                          }`}
                        >
                          {lead.outcome === 'qualified' ? 'Qualified' : 'Not qualified'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">Status</p>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${followUpColors[lead.follow_up_status]}`}
                        >
                          {followUpLabels[lead.follow_up_status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <p className="font-semibold truncate">{lead.full_name}</p>
                      <p className="text-xs text-adm-muted truncate">{lead.email}</p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Budget</p>
                      <p className="font-semibold text-adm-accent-ink">{formatLabel(lead.budget)}</p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Timeline</p>
                      <p className="font-semibold">{formatLabel(lead.timeline)}</p>
                    </div>

                    <div className="sm:col-span-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          lead.outcome === 'qualified'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/10 text-red-300 border border-red-500/20'
                        }`}
                      >
                        {lead.outcome === 'qualified' ? 'Qualified' : 'Not qualified'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${followUpColors[lead.follow_up_status]}`}
                      >
                        {followUpLabels[lead.follow_up_status]}
                      </span>
                    </div>

                    <div className="sm:col-span-1 flex justify-end text-adm-muted">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-adm-line p-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <DetailItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={lead.email} />
                      <DetailItem icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={lead.phone} />
                      <DetailItem icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={formatLabel(lead.location)} />
                      <DetailItem icon={<Briefcase className="w-3.5 h-3.5" />} label="Business type" value={formatLabel(lead.business_type)} />
                      <DetailItem label="Help requested" value={formatLabel(lead.help_type)} />
                      <DetailItem label="Monthly revenue" value={formatLabel(lead.monthly_revenue)} />
                      <DetailItem label="Willing to invest" value={formatLabel(lead.willing_to_invest)} />
                      <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Submitted" value={formatDate(lead.created_at)} />
                    </div>

                    {lead.business_description && (
                      <div>
                        <p className="text-xs text-adm-subtle mb-1">Business description</p>
                        <p className="text-sm text-adm-text-2 whitespace-pre-wrap">{lead.business_description}</p>
                      </div>
                    )}

                    {lead.challenge && (
                      <div>
                        <p className="text-xs text-adm-subtle mb-1">Biggest challenge</p>
                        <p className="text-sm text-adm-text-2 whitespace-pre-wrap">{lead.challenge}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(['new', 'contacted', 'closed'] as FollowUpStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateFollowUp(lead.id, status)}
                          disabled={updatingId === lead.id || lead.follow_up_status === status}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                            lead.follow_up_status === status
                              ? followUpColors[status]
                              : 'bg-transparent text-adm-muted border-adm-line-strong hover:border-adm-accent/40 hover:text-adm-text'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Mark {followUpLabels[status]}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-adm-subtle mb-1">
        {icon}
        {label}
      </p>
      <p className="text-adm-text-2">{value}</p>
    </div>
  );
}
