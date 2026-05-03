'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import type { SupportTicket, SupportTicketStatus, SupportTopic } from '@/lib/types/database';

type FilterTab = 'all' | SupportTicketStatus;

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_COLORS: Record<SupportTicketStatus, string> = {
  new: 'bg-[#FFB829]/20 text-[#FFB829] border-[#FFB829]/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-300 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const TOPIC_LABELS: Record<SupportTopic, string> = {
  general: 'General Inquiry',
  course_rule_of_10x: 'Course — Rule of 10X',
  course_marketing_templates: 'Course — Marketing Templates',
  career_application_status: 'Career Application',
  partnership_followup: 'Partnership Follow-Up',
  billing: 'Billing / Payment',
  other: 'Other',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const FILTER_TABS: FilterTab[] = ['all', 'new', 'in_progress', 'resolved', 'closed'];

export default function SupportTicketsManager() {
  const {
    rows: tickets,
    setRows: setTickets,
    loading,
    error,
  } = useRealtimeTable<SupportTicket>('support_tickets');

  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      new: tickets.filter((t) => t.status === 'new').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
    }),
    [tickets],
  );

  async function updateStatus(id: string, next: SupportTicketStatus) {
    setUpdatingId(id);
    const { error: updateError } = await (
      supabase.from('support_tickets') as unknown as {
        update: (vals: { status: SupportTicketStatus }) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      }
    )
      .update({ status: next })
      .eq('id', id);

    if (!updateError) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <p className="font-semibold mb-1">Failed to load tickets</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">Support Tickets</h2>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-1.5 sm:flex-wrap">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab;
              const muted = !active && counts[tab] === 0;
              const label = tab === 'all' ? 'All' : STATUS_LABELS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#FFB829] text-black'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } ${muted ? 'opacity-40' : ''}`}
                >
                  {label}
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
        <div className="p-12 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-center">
          <p className="text-gray-400 mb-2">No support tickets yet</p>
          <p className="text-xs text-gray-500">Submissions from /support will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, index) => {
            const isExpanded = expandedId === ticket.id;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="rounded-lg bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1a1a1a] hover:border-[#FFB829]/30 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  className="w-full p-4 sm:p-5 text-left"
                >
                  <div className="space-y-3.5 sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate">{ticket.full_name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{ticket.email}</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white/5 text-gray-300 border border-white/10">
                        {TOPIC_LABELS[ticket.topic]}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${STATUS_COLORS[ticket.status]}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <p className="font-semibold truncate">{ticket.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{ticket.email}</p>
                    </div>
                    <div className="sm:col-span-4 text-sm font-semibold text-white truncate">
                      {ticket.subject}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white/5 text-gray-300 border border-white/10 truncate">
                        {TOPIC_LABELS[ticket.topic]}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${STATUS_COLORS[ticket.status]}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                    <div className="sm:col-span-1 flex justify-end text-gray-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-[#1a1a1a] p-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <DetailItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={ticket.email} />
                      <DetailItem
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Phone"
                        value={ticket.phone ?? '—'}
                      />
                      <DetailItem
                        icon={<Tag className="w-3.5 h-3.5" />}
                        label="Topic"
                        value={TOPIC_LABELS[ticket.topic]}
                      />
                      <DetailItem
                        icon={<Calendar className="w-3.5 h-3.5" />}
                        label="Submitted"
                        value={formatDate(ticket.created_at)}
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subject</p>
                      <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Message</p>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(['new', 'in_progress', 'resolved', 'closed'] as SupportTicketStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(ticket.id, status)}
                            disabled={updatingId === ticket.id || ticket.status === status}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                              ticket.status === status
                                ? STATUS_COLORS[status]
                                : 'bg-transparent text-gray-400 border-[#2a2a2a] hover:border-[#FFB829]/40 hover:text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Mark {STATUS_LABELS[status]}
                          </button>
                        ),
                      )}
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
      <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-gray-200">{value}</p>
    </div>
  );
}
