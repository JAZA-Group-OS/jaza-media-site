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
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
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
  new: 'bg-[#FFB829]/20 text-[#FFB829] border-[#FFB829]/30',
  contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  closed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
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

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CareerApplicationsManager() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (
      supabase.from('career_applications') as unknown as {
        select: (cols: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: CareerApplication[] | null;
            error: { message: string } | null;
          }>;
        };
      }
    )
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        setApplications(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        <h2 className="text-2xl font-bold">Career Applications</h2>
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
        <h2 className="text-2xl font-bold">Career Applications</h2>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <p className="font-semibold mb-1">Failed to load applications</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Career Applications</h2>
        <div className="flex flex-wrap gap-2">
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

      {filtered.length === 0 ? (
        <div className="p-12 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-center">
          <p className="text-gray-400 mb-2">No applications yet</p>
          <p className="text-xs text-gray-500">
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
                className="rounded-lg bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1a1a1a] hover:border-[#FFB829]/30 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <p className="font-semibold truncate">{app.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {app.email}
                      </p>
                    </div>

                    <div className="sm:col-span-3 text-xs">
                      <p className="text-gray-500">Position</p>
                      <p className="font-semibold text-[#FFB829]">
                        {formatLabel(app.position)}
                      </p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-gray-500">Location</p>
                      <p className="font-semibold">{formatLabel(app.location)}</p>
                    </div>

                    <div className="sm:col-span-2 text-xs">
                      <p className="text-gray-500">Submitted</p>
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
                        <p className="text-xs text-gray-500 mb-1">
                          Self description
                        </p>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">
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
                        url={app.resume_url}
                      />
                      <FileLink
                        icon={<Folder className="w-4 h-4" />}
                        label="Portfolio"
                        filename={app.portfolio_filename}
                        size={app.portfolio_size_bytes}
                        url={app.portfolio_url}
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
                                : 'bg-transparent text-gray-400 border-[#2a2a2a] hover:border-[#FFB829]/40 hover:text-white'
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
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
        active
          ? 'bg-[#FFB829] text-black'
          : 'bg-[#0a0a0a] text-gray-400 border border-[#1a1a1a] hover:border-[#FFB829]/30'
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
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
      <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-gray-200 hover:text-[#FFB829] transition-colors break-all"
        >
          {value}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <p className="text-gray-200 break-words">{value}</p>
      )}
    </div>
  );
}

function FileLink({
  icon,
  label,
  filename,
  size,
  url,
}: {
  icon: React.ReactNode;
  label: string;
  filename: string;
  size: number;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-md bg-[#0a0a0a] border border-[#1a1a1a] p-3 hover:border-[#FFB829]/40 hover:text-white transition-colors group"
    >
      <span className="text-[#FFB829] shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span className="block text-sm text-gray-200 truncate">
          {filename}
        </span>
        <span className="block text-xs text-gray-500">{formatBytes(size)}</span>
      </span>
      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#FFB829] shrink-0" />
    </a>
  );
}
