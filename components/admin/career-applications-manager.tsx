'use client';

import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Folder,
  Link as LinkIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import type {
  CareerApplication,
  CareerPosition,
  FollowUpStatus,
} from '@/lib/types/database';

type FilterTab = 'all' | CareerPosition;

const POSITION_OPTIONS: CareerPosition[] = [
  'advertiser',
  'sales_closer',
  'social_media_manager',
  'graphic_artist',
  'video_editor',
  'other',
];

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

// Compact form for narrow mobile cells: "May 2 · 12:48 PM" (no year, no comma).
// Year is rarely needed at-a-glance; admins can expand the row for the full
// date.
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

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CareerApplicationsManager() {
  const {
    rows: applications,
    setRows: setApplications,
    loading,
    error,
  } = useRealtimeTable<CareerApplication>('career_applications');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return applications;
    return applications.filter((a) => a.position === filter);
  }, [applications, filter]);

  const counts = useMemo(() => {
    const base: Record<FilterTab, number> = {
      all: applications.length,
      advertiser: 0,
      sales_closer: 0,
      social_media_manager: 0,
      graphic_artist: 0,
      video_editor: 0,
      other: 0,
    };
    applications.forEach((a) => {
      base[a.position] += 1;
    });
    return base;
  }, [applications]);

  async function updateFollowUp(id: string, next: FollowUpStatus) {
    setUpdatingId(id);
    const { error: updateError } = await (
      supabase.from('career_applications') as unknown as {
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
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, follow_up_status: next } : a)),
      );
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">Career Applications</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-adm-surface border border-adm-line animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">Career Applications</h2>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <p className="font-semibold mb-1">Failed to load applications</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="sr-only">Career Applications</h2>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-1.5 sm:flex-wrap">
            <FilterPill
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={counts.all}
            />
            {POSITION_OPTIONS.map((p) => (
              <FilterPill
                key={p}
                active={filter === p}
                onClick={() => setFilter(p)}
                label={formatLabel(p)}
                count={counts[p]}
              />
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-lg bg-adm-surface border border-adm-line text-center">
          <p className="text-adm-muted mb-2">No applications yet</p>
          <p className="text-xs text-adm-subtle">
            Submissions from /careers/apply will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, index) => {
            const isExpanded = expandedId === app.id;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="rounded-lg bg-adm-surface border border-adm-line hover:border-adm-accent/30 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full p-4 sm:p-5 text-left"
                >
                  {/* Mobile: header row + 2-col metadata grid. Drops the
                      stair-step layout caused by 12-col grid on narrow screens. */}
                  <div className="space-y-3.5 sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate">
                          {app.full_name}
                        </p>
                        <p className="text-xs text-adm-muted truncate mt-0.5">
                          {app.email}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-adm-muted shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <MobileField
                        label="Position"
                        value={formatLabel(app.position)}
                        accent
                      />
                      <MobileField
                        label="Location"
                        value={formatLabel(app.location)}
                      />
                      <MobileField
                        label="Submitted"
                        value={formatDateShort(app.created_at)}
                      />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">
                          Status
                        </p>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${followUpColors[app.follow_up_status]}`}
                        >
                          {followUpLabels[app.follow_up_status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: original 12-col grid */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <p className="font-semibold truncate">{app.full_name}</p>
                      <p className="text-xs text-adm-muted truncate">
                        {app.email}
                      </p>
                    </div>

                    <div className="sm:col-span-3 text-xs">
                      <p className="text-adm-subtle">Position</p>
                      <p className="font-semibold text-adm-accent-ink">
                        {formatLabel(app.position)}
                      </p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Location</p>
                      <p className="font-semibold">{formatLabel(app.location)}</p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-adm-subtle">Submitted</p>
                      <p className="font-semibold">
                        {formatDate(app.created_at)}
                      </p>
                    </div>

                    <div className="sm:col-span-1">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${followUpColors[app.follow_up_status]}`}
                      >
                        {followUpLabels[app.follow_up_status]}
                      </span>
                    </div>

                    <div className="sm:col-span-1 flex justify-end text-adm-muted">
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
                    className="border-t border-adm-line p-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <DetailItem
                        icon={<Mail className="w-3.5 h-3.5" />}
                        label="Email"
                        value={app.email}
                      />
                      <DetailItem
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Phone"
                        value={app.phone}
                      />
                      <DetailItem
                        icon={<MapPin className="w-3.5 h-3.5" />}
                        label="Location"
                        value={formatLabel(app.location)}
                      />
                      <DetailItem
                        icon={<Briefcase className="w-3.5 h-3.5" />}
                        label="Position"
                        value={formatLabel(app.position)}
                      />
                      {app.facebook && (
                        <DetailItem
                          icon={<LinkIcon className="w-3.5 h-3.5" />}
                          label="Facebook"
                          value={app.facebook}
                          link={app.facebook}
                        />
                      )}
                      <DetailItem
                        icon={<Calendar className="w-3.5 h-3.5" />}
                        label="Submitted"
                        value={formatDate(app.created_at)}
                      />
                    </div>

                    {app.description && (
                      <div>
                        <p className="text-xs text-adm-subtle mb-1">
                          Self description
                        </p>
                        <p className="text-sm text-adm-text-2 whitespace-pre-wrap">
                          {app.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FileLink
                        icon={<FileText className="w-4 h-4" />}
                        label="Resume / CV"
                        filename={app.resume_filename}
                        size={app.resume_size_bytes}
                        bucket="career_resumes"
                        path={app.resume_url}
                      />
                      <FileLink
                        icon={<Folder className="w-4 h-4" />}
                        label="Portfolio"
                        filename={app.portfolio_filename}
                        size={app.portfolio_size_bytes}
                        bucket="career_portfolios"
                        path={app.portfolio_url}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(['new', 'contacted', 'closed'] as FollowUpStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => updateFollowUp(app.id, status)}
                            disabled={
                              updatingId === app.id ||
                              app.follow_up_status === status
                            }
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                              app.follow_up_status === status
                                ? followUpColors[status]
                                : 'bg-transparent text-adm-muted border-adm-line-strong hover:border-adm-accent/40 hover:text-adm-text'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Mark {followUpLabels[status]}
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

function MobileField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold truncate ${
          accent ? 'text-adm-accent-ink' : 'text-adm-text'
        }`}
      >
        {value}
      </p>
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
  // Inactive pills with no items dim so the eye lands on what matters; the
  // active pill always stays at full weight to reinforce the current filter.
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

// Storage buckets are private. Older rows (pre-secure-buckets migration)
// stored the full public URL; new rows store just the object key. We derive
// the object path from either shape and mint a short-lived signed URL on
// click so the admin can preview/download the file.
function extractObjectPath(stored: string, bucket: string): string {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = stored.indexOf(marker);
  if (i !== -1) return stored.slice(i + marker.length);
  return stored;
}

function FileLink({
  icon,
  label,
  filename,
  size,
  bucket,
  path,
}: {
  icon: React.ReactNode;
  label: string;
  filename: string;
  size: number;
  bucket: 'career_resumes' | 'career_portfolios';
  path: string;
}) {
  const [opening, setOpening] = useState(false);

  async function openSignedUrl(e: React.MouseEvent) {
    e.preventDefault();
    if (opening) return;
    setOpening(true);
    const objectPath = extractObjectPath(path, bucket);
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, 60 * 10);
    setOpening(false);
    if (error || !data?.signedUrl) {
      console.error('[file-link] signed url failed:', error?.message);
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <a
      href="#"
      onClick={openSignedUrl}
      className="flex items-center gap-3 rounded-md bg-adm-surface border border-adm-line p-3 hover:border-adm-accent/40 hover:text-adm-text transition-colors group"
    >
      <span className="text-adm-accent-ink shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-wide text-adm-subtle">
          {label}
        </span>
        <span className="block text-sm text-adm-text-2 truncate">
          {filename}
        </span>
        <span className="block text-xs text-adm-subtle">
          {opening ? 'Opening…' : formatBytes(size)}
        </span>
      </span>
      <ExternalLink className="w-4 h-4 text-adm-subtle group-hover:text-adm-accent-ink shrink-0" />
    </a>
  );
}
