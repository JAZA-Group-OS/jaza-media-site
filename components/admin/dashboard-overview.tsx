'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Inbox,
  Bell,
  Calendar,
  BookOpen,
  FileBox,
  Briefcase,
  Activity,
  PieChart,
  Users,
  ArrowRight,
  LifeBuoy,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import type { PartnerInquiry, CareerApplication, CourseRequest } from '@/lib/types/database';

type DailyPoint = { date: string; submissions: number };

function formatTimeAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function buildDailySeries(rows: PartnerInquiry[], now: number): DailyPoint[] {
  const days: DailyPoint[] = [];
  const today = new Date(now);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), submissions: 0 });
  }
  rows.forEach((r) => {
    const ageDays = Math.floor((now - new Date(r.created_at).getTime()) / 86400000);
    if (ageDays >= 0 && ageDays <= 6) days[6 - ageDays].submissions += 1;
  });
  return days;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

const TONES = {
  blue: { chip: 'bg-blue-500/15 text-blue-400', bar: 'bg-blue-500', glow: 'from-blue-500/15' },
  amber: { chip: 'bg-adm-accent/15 text-adm-accent-ink', bar: 'bg-adm-accent', glow: 'from-adm-accent/20' },
  purple: { chip: 'bg-purple-500/15 text-purple-400', bar: 'bg-purple-500', glow: 'from-purple-500/15' },
  green: { chip: 'bg-green-500/15 text-green-400', bar: 'bg-green-500', glow: 'from-green-500/15' },
} as const;
type Tone = keyof typeof TONES;

const tooltipStyle = {
  backgroundColor: 'var(--adm-surface)',
  border: '1px solid var(--adm-line-strong)',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  fontSize: 12,
};

export default function DashboardOverview({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [now] = useState(() => Date.now());

  const { rows: inquiries, loading, error } = useRealtimeTable<PartnerInquiry>('partner_inquiries');
  const { rows: careerApps } = useRealtimeTable<CareerApplication>('career_applications');
  const { rows: courseRequests } = useRealtimeTable<CourseRequest>('course_requests');

  const data = loading ? null : inquiries;

  const ruleOf10xCount = courseRequests.filter((r) => r.course_slug === 'rule-of-10x').length;
  const templatesCount = courseRequests.filter((r) => r.course_slug === 'marketing-templates').length;
  const careerCount = careerApps.length;
  const funnelMax = Math.max(1, ruleOf10xCount, templatesCount, careerCount);

  const total = data?.length ?? 0;
  const qualified = data?.filter((i) => i.outcome === 'qualified').length ?? 0;
  const pending = data?.filter((i) => i.follow_up_status === 'new').length ?? 0;
  const thisWeek = data?.filter((i) => now - new Date(i.created_at).getTime() < 7 * 86400000).length ?? 0;
  const qualifiedRate = total ? Math.round((qualified / total) * 100) : 0;

  const dailySeries = data ? buildDailySeries(data, now) : [];
  const outcomeData = [
    { stage: 'Qualified', value: qualified },
    { stage: 'Not qualified', value: total - qualified },
  ];

  const metrics: { label: string; value: number; period: string; icon: LucideIcon; tone: Tone }[] = [
    { label: 'Total inquiries', value: total, period: 'All time', icon: Inbox, tone: 'blue' },
    { label: 'Qualified leads', value: qualified, period: `${qualifiedRate}% of all inquiries`, icon: TrendingUp, tone: 'amber' },
    { label: 'Pending follow-up', value: pending, period: 'Status: new', icon: Bell, tone: 'purple' },
    { label: 'This week', value: thisWeek, period: 'Last 7 days', icon: Calendar, tone: 'green' },
  ];

  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date(now).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        <p className="mb-1 font-semibold">Failed to load dashboard data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-adm-line bg-gradient-to-br from-adm-accent/25 via-adm-surface to-adm-surface p-5 sm:p-7"
      >
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-adm-accent/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[12px] font-medium tracking-wide text-adm-accent-ink uppercase">
              <Sparkles className="size-3.5" /> {today}
            </p>
            <h2 className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.01em] text-adm-text sm:text-[28px]">
              {greeting}, Admin
            </h2>
            <p className="mt-1.5 max-w-xl text-[13.5px] text-adm-muted">
              {data === null
                ? 'Loading today’s activity…'
                : pending > 0
                  ? `You have ${pending} new ${pending === 1 ? 'lead' : 'leads'} waiting for a follow-up and ${thisWeek} ${thisWeek === 1 ? 'inquiry' : 'inquiries'} this week.`
                  : `All leads are followed up. ${thisWeek} ${thisWeek === 1 ? 'inquiry' : 'inquiries'} came in this week.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <QuickAction icon={TrendingUp} label="Partner leads" primary onClick={() => onNavigate?.('leads')} />
            <QuickAction icon={CalendarDays} label="Discovery calls" onClick={() => onNavigate?.('bookings')} />
            <QuickAction icon={LifeBuoy} label="Support desk" onClick={() => onNavigate?.('support')} />
          </div>
        </div>
      </motion.section>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((m, index) => {
          const Icon = m.icon;
          const t = TONES[m.tone];
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-adm-line bg-gradient-to-br ${t.glow} to-adm-surface to-60% bg-adm-surface p-4 transition hover:-translate-y-0.5 hover:border-adm-line-strong hover:shadow-lg sm:p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-10 place-items-center rounded-xl ${t.chip}`}>
                  <Icon className="size-[19px]" strokeWidth={1.9} />
                </span>
                <span className="rounded-full bg-adm-raised px-2 py-0.5 text-[10.5px] font-medium text-adm-subtle">Live</span>
              </div>
              <p className="mt-4 text-[30px] leading-none font-semibold tracking-tight text-adm-text sm:text-[34px]">
                {data === null ? '—' : m.value}
              </p>
              <p className="mt-2 truncate text-[13px] font-medium text-adm-text-2">{m.label}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-adm-subtle">{m.period}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3" icon={Activity} title="Submissions" subtitle="Partner inquiries over the last 7 days" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="admArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--adm-accent)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--adm-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--adm-line)" />
              <XAxis dataKey="date" stroke="var(--adm-faint)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--adm-faint)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--adm-text)' }} cursor={{ stroke: 'var(--adm-accent)', strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="submissions" stroke="var(--adm-accent)" strokeWidth={2.5} fill="url(#admArea)" dot={{ r: 3, fill: 'var(--adm-accent)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="lg:col-span-2" icon={PieChart} title="Qualification" subtitle={`${qualifiedRate}% of inquiries qualified`} delay={0.25}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={outcomeData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--adm-line)" />
              <XAxis dataKey="stage" stroke="var(--adm-faint)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--adm-faint)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--adm-text)' }} cursor={{ fill: 'var(--adm-accent-soft)' }} />
              <Bar dataKey="value" radius={[10, 10, 4, 4]}>
                <Cell fill="var(--adm-accent)" />
                <Cell fill="var(--adm-line-strong)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Funnels + recent */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2" icon={BookOpen} title="Lead magnet funnels" subtitle="Live sign-ups per source" delay={0.3}>
          <div className="space-y-3">
            <FunnelRow label="Rule of 10X" count={ruleOf10xCount} max={funnelMax} icon={BookOpen} tone="amber" onClick={() => onNavigate?.('course-rule-of-10x')} />
            <FunnelRow label="Marketing Templates" count={templatesCount} max={funnelMax} icon={FileBox} tone="blue" onClick={() => onNavigate?.('course-marketing-templates')} />
            <FunnelRow label="Career Applications" count={careerCount} max={funnelMax} icon={Briefcase} tone="purple" onClick={() => onNavigate?.('applications')} />
          </div>
        </Panel>

        <Panel
          className="lg:col-span-3"
          icon={Users}
          title="Recent inquiries"
          subtitle="Latest five partner leads"
          delay={0.35}
          action={
            onNavigate && (
              <button type="button" onClick={() => onNavigate('leads')} className="flex items-center gap-1 text-[12.5px] font-medium text-adm-accent-ink hover:underline">
                View all <ArrowRight className="size-3.5" />
              </button>
            )
          }
        >
          {data === null ? (
            <div className="space-y-2">
              {[0, 1, 2].map((k) => (
                <div key={k} className="h-14 animate-pulse rounded-xl bg-adm-raised" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-adm-line-strong py-10 text-center">
              <Inbox className="mb-2 size-6 text-adm-faint" />
              <p className="text-sm text-adm-subtle">No inquiries yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-adm-line">
              {data.slice(0, 5).map((i) => {
                const ok = i.outcome === 'qualified';
                return (
                  <li key={i.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-adm-accent/15 text-[13px] font-semibold text-adm-accent-ink">
                      {initials(i.full_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-adm-text">{i.full_name}</p>
                      <p className="truncate text-[12px] text-adm-subtle">{i.email}</p>
                    </div>
                    <span
                      className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                        ok ? 'bg-green-500/15 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
                      {ok ? 'Qualified' : 'Not qualified'}
                    </span>
                    <span className="w-16 shrink-0 text-right text-[12px] whitespace-nowrap text-adm-subtle">{formatTimeAgo(i.created_at, now)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = '',
  delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex flex-col rounded-2xl border border-adm-line bg-adm-surface p-4 sm:p-6 ${className}`}
    >
      <header className="mb-5 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-adm-raised text-adm-accent-ink">
          <Icon className="size-[17px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-adm-text">{title}</h3>
          {subtitle && <p className="truncate text-[12px] text-adm-subtle">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </motion.section>
  );
}

function QuickAction({ icon: Icon, label, onClick, primary }: { icon: LucideIcon; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition ${
        primary
          ? 'bg-adm-accent text-[#141414] shadow-[0_6px_20px_-6px_rgba(255,197,46,0.7)] hover:brightness-105'
          : 'border border-adm-line-strong bg-adm-surface/70 text-adm-text backdrop-blur hover:border-adm-accent'
      }`}
    >
      <Icon className="size-4" strokeWidth={1.9} />
      {label}
    </button>
  );
}

function FunnelRow({
  label,
  count,
  max,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  max: number;
  icon: LucideIcon;
  tone: Tone;
  onClick: () => void;
}) {
  const t = TONES[tone];
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl bg-adm-raised/60 p-3 text-left transition hover:bg-adm-raised">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${t.chip}`}>
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-medium text-adm-text-2">{label}</p>
          <p className="text-[18px] leading-none font-semibold text-adm-text">{count}</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-adm-line">
          <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.max(4, (count / max) * 100)}%` }} />
        </div>
      </div>
    </button>
  );
}
