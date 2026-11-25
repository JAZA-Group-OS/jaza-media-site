'use client';

import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import { findAssetOption } from '@/lib/courses/catalog';
import type {
  CourseRequest,
  CourseSlug,
  FollowUpStatus,
} from '@/lib/types/database';

interface CourseRequestsManagerProps {
  courseSlug: CourseSlug;
  courseTitle: string;
}

type FilterTab = 'all' | FollowUpStatus;

const followUpLabels: Record<FollowUpStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Compact form for narrow mobile cells: "May 2 · 12:48 PM".
function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

export default function CourseRequestsManager({
  courseSlug,
  courseTitle,
}: CourseRequestsManagerProps) {
  const {
    rows: requests,
    setRows: setRequests,
    loading,
    error,
  } = useRealtimeTable<CourseRequest>('course_requests', {
    filter: { column: 'course_slug', value: courseSlug },
  });
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return requests;
    return requests.filter((r) => r.follow_up_status === filter);
  }, [requests, filter]);

  const counts = useMemo(() => {
    const base: Record<FilterTab, number> = {
      all: requests.length,
      new: 0,
      contacted: 0,
      closed: 0,
    };
    requests.forEach((r) => {
      base[r.follow_up_status] += 1;
    });
    return base;
  }, [requests]);

  async function updateFollowUp(id: string, next: FollowUpStatus) {
    setUpdatingId(id);
    const { error: updateError } = await (
      supabase.from('course_requests') as unknown as {
        update: (vals: { follow_up_status: FollowUpStatus }) => {
          eq: (col: string, val: string) => Promise<{
            error: { message: string } | null;
          }>;
        };
      }
    )
      .update({ follow_up_status: next })
      .eq('id', id);

    if (!updateError) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, follow_up_status: next } : r)),
      );
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">{courseTitle}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-adm-surface border border-adm-line animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">{courseTitle}</h2>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <p className="font-semibold mb-1">Failed to load course requests</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="sr-only">{courseTitle}</h2>
          <p className="text-xs text-adm-subtle mt-1">
            People who claimed this course from /courses/{courseSlug}
          </p>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-1.5 sm:flex-wrap">
            <FilterPill
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={counts.all}
            />
            {(['new', 'contacted', 'closed'] as FollowUpStatus[]).map((s) => (
              <FilterPill
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
                label={followUpLabels[s]}
                count={counts[s]}
              />
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-lg bg-adm-surface border border-adm-line text-center">
          <p className="text-adm-muted mb-2">
            No {filter === 'all' ? '' : `${followUpLabels[filter as FollowUpStatus].toLowerCase()} `}
            requests yet
          </p>
          <p className="text-xs text-adm-subtle">
            Submissions from /courses/{courseSlug} will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, index) => {
            const isExpanded = expandedId === req.id;
            const fullName = `${req.first_name} ${req.last_name}`.trim();
            // Map the stored selected_asset back to its catalog label for
            // display. If a row has an asset we don't recognise (catalog
            // changed since the row was written), fall back to the raw value.
            const assetOpt = findAssetOption(req.selected_asset);
            const assetLabel = assetOpt?.label ?? req.selected_asset;
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="rounded-lg bg-adm-surface border border-adm-line hover:border-adm-accent/30 transition-colors"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : req.id);
                    }
                  }}
                  className="w-full cursor-pointer p-4 sm:p-5 text-left"
                >
                  {/* Mobile: header row + 2-col metadata grid */}
                  <div className="space-y-3.5 sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate">
                          {fullName}
                        </p>
                        <p className="text-xs text-adm-muted truncate mt-0.5">
                          {req.email}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-adm-muted shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {/* Asset is the lead's #1 signal — what they asked for —
                        so it gets a full-width row with the brand yellow. */}
                    <div className="rounded-md bg-adm-accent/10 px-3 py-2 border border-adm-accent/20">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-adm-accent-ink/70">
                        Asset chosen
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-adm-accent-ink truncate">
                        {assetLabel}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">
                          Phone
                        </p>
                        {req.phone ? (
                          <a
                            href={`tel:${req.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 block text-sm font-semibold text-adm-accent-ink hover:underline truncate"
                          >
                            {req.phone}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-sm font-semibold text-adm-subtle">
                            —
                          </p>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">
                          Submitted
                        </p>
                        <p className="mt-0.5 text-sm font-semibold truncate">
                          {formatDateShort(req.created_at)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">
                          Email
                        </p>
                        <div className="mt-0.5 text-sm">
                          <EmailStatus
                            sentAt={req.email_sent_at}
                            emailError={req.email_error}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">
                          Status
                        </p>
                        <div className="mt-1">
                          <StatusSwitch value={req.follow_up_status} busy={updatingId === req.id} onChange={(st) => updateFollowUp(req.id, st)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: 12-col grid */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <p className="font-semibold truncate">{fullName}</p>
                      <p className="text-xs text-adm-muted truncate">
                        {req.email}
                      </p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Asset chosen</p>
                      <p className="font-semibold text-adm-accent-ink truncate">
                        {assetLabel}
                      </p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Phone</p>
                      {req.phone ? (
                        <a
                          href={`tel:${req.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-adm-accent-ink hover:underline truncate block"
                        >
                          {req.phone}
                        </a>
                      ) : (
                        <p className="font-semibold text-adm-subtle">—</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Submitted</p>
                      <p className="font-semibold">
                        {formatDateShort(req.created_at)}
                      </p>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-end gap-3">
                      <StatusSwitch value={req.follow_up_status} busy={updatingId === req.id} onChange={(st) => updateFollowUp(req.id, st)} />
                      <span className="text-adm-muted">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-adm-line p-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <DetailItem
                        icon={<User className="w-3.5 h-3.5" />}
                        label="Full name"
                        value={fullName}
                      />
                      <DetailItem
                        icon={<BookOpen className="w-3.5 h-3.5" />}
                        label="Asset chosen"
                        value={assetLabel}
                      />
                      <DetailItem
                        icon={<Mail className="w-3.5 h-3.5" />}
                        label="Email"
                        value={req.email}
                        link={`mailto:${req.email}`}
                      />
                      <DetailItem
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Phone"
                        value={req.phone ?? '—'}
                        link={req.phone ? `tel:${req.phone}` : undefined}
                      />
                      <DetailItem
                        icon={<Calendar className="w-3.5 h-3.5" />}
                        label="Submitted"
                        value={formatDate(req.created_at)}
                      />
                      <DetailItem
                        icon={<Clock className="w-3.5 h-3.5" />}
                        label="Email sent at"
                        value={
                          req.email_sent_at
                            ? formatDate(req.email_sent_at)
                            : 'Not sent'
                        }
                      />
                    </div>

                    {/* Shipping address — collected at step 4 of the funnel.
                        Rendered as a single labeled block since the address
                        reads as one mailing destination, not five separate
                        fields. */}
                    <div className="rounded-md border border-adm-line bg-adm-raised p-3">
                      <p className="flex items-center gap-1.5 text-xs text-adm-subtle mb-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Shipping address
                      </p>
                      <p className="text-sm leading-relaxed text-adm-text-2">
                        {req.shipping_street}
                        <br />
                        {req.shipping_city}, {req.shipping_state}{' '}
                        {req.shipping_postal}
                        <br />
                        {req.shipping_country}
                      </p>
                    </div>

                    {req.email_error ? (
                      <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                        <p className="font-semibold mb-1">Email delivery issue</p>
                        <p className="break-all">{req.email_error}</p>
                      </div>
                    ) : null}

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

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  const muted = !active && count === 0;
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all ${
        active
          ? 'bg-adm-accent text-black'
          : 'text-adm-muted hover:bg-white/5 hover:text-adm-text'
      } ${muted ? 'opacity-40' : ''}`}
    >
      {label}
      <span className={`ml-1 ${active ? 'opacity-70' : 'opacity-50'}`}>
        ({count})
      </span>
    </button>
  );
}

function EmailStatus({
  sentAt,
  emailError,
}: {
  sentAt: string | null;
  emailError: string | null;
}) {
  if (sentAt && !emailError) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Sent
      </span>
    );
  }
  if (emailError) {
    return (
      <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
        <AlertCircle className="w-3.5 h-3.5" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-adm-muted font-semibold">
      <Clock className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

function DetailItem({
  icon,
  label,
  value,
  link,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-adm-subtle mb-1">
        {icon}
        {label}
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-adm-text-2 hover:text-adm-accent-ink transition-colors break-all"
        >
          {value}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <p className="text-adm-text-2 break-words">{value}</p>
      )}
    </div>
  );
}

/** Per-row status switch (New · Contacted · Closed); clicks don't toggle the row. */
function StatusSwitch({
  value,
  busy,
  onChange,
}: {
  value: FollowUpStatus;
  busy: boolean;
  onChange: (s: FollowUpStatus) => void;
}) {
  return (
    <div
      className="inline-flex rounded-full border border-adm-line bg-adm-raised p-0.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {(['new', 'contacted', 'closed'] as FollowUpStatus[]).map((st) => {
        const active = value === st;
        return (
          <button
            key={st}
            type="button"
            onClick={() => !active && onChange(st)}
            disabled={busy}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              active ? 'bg-adm-accent text-black' : 'text-adm-muted hover:text-adm-text'
            } disabled:opacity-60`}
          >
            {followUpLabels[st]}
          </button>
        );
      })}
    </div>
  );
}
