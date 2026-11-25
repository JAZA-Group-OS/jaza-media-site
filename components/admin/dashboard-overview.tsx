'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Inbox,
  Bell,
  Calendar,
  BookOpen,
  FileBox,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRealtimeTable } from '@/lib/admin/use-realtime-table';
import type {
  PartnerInquiry,
  CareerApplication,
  CourseRequest,
} from '@/lib/types/database';

type DailyPoint = { date: string; submissions: number };

function formatTimeAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildDailySeries(rows: PartnerInquiry[], now: number): DailyPoint[] {
  const days: DailyPoint[] = [];
  const today = new Date(now);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      submissions: 0,
    });
  }
  rows.forEach((r) => {
    const ageDays = Math.floor(
      (now - new Date(r.created_at).getTime()) / (24 * 60 * 60 * 1000),
    );
    if (ageDays >= 0 && ageDays <= 6) {
      const idx = 6 - ageDays;
      days[idx].submissions += 1;
    }
  });
  return days;
}

export default function DashboardOverview() {
  // Capture "now" once at mount so render stays pure (no Date.now() in the
  // render path) and every relative calc below shares one consistent clock.
  const [now] = useState(() => Date.now());

  const { rows: inquiries, loading, error } =
    useRealtimeTable<PartnerInquiry>('partner_inquiries');
  const { rows: careerApps } =
    useRealtimeTable<CareerApplication>('career_applications');
  const { rows: courseRequests } =
    useRealtimeTable<CourseRequest>('course_requests');

  // Treat first paint as null-equivalent so the metric tiles render "—" until
  // the initial fetch completes (matches prior UX).
  const data = loading ? null : inquiries;

  // Per-funnel counts. Course requests come from one table sliced by slug
  // so we don't fan out into multiple Realtime channels for the same data.
  const ruleOf10xCount = courseRequests.filter(
    (r) => r.course_slug === 'rule-of-10x',
  ).length;
  const templatesCount = courseRequests.filter(
    (r) => r.course_slug === 'marketing-templates',
  ).length;
  const careerCount = careerApps.length;

  const total = data?.length ?? 0;
  const qualified = data?.filter((i) => i.outcome === 'qualified').length ?? 0;
  const pending = data?.filter((i) => i.follow_up_status === 'new').length ?? 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeek =
    data?.filter((i) => now - new Date(i.created_at).getTime() < weekMs)
      .length ?? 0;

  const dailySeries = data ? buildDailySeries(data, now) : [];
  const outcomeData = [
    { stage: 'Qualified', value: qualified },
    { stage: 'Not Qualified', value: total - qualified },
  ];

  const metrics = [
    {
      label: 'Total Inquiries',
      value: total,
      period: 'All time',
      icon: Inbox,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      label: 'Qualified Leads',
      value: qualified,
      period: 'All time',
      icon: TrendingUp,
      bgColor: 'bg-adm-accent/10',
      textColor: 'text-adm-accent-ink',
    },
    {
      label: 'Pending Follow-up',
      value: pending,
      period: 'Status: new',
      icon: Bell,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    {
      label: 'This Week',
      value: thisWeek,
      period: 'Last 7 days',
      icon: Calendar,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
    },
  ];

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
        <p className="font-semibold mb-1">Failed to load dashboard data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 sm:p-6 rounded-xl border border-adm-line ${metric.bgColor}`}
            >
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div>
                  <p className="text-adm-muted text-xs sm:text-sm font-medium mb-1">{metric.label}</p>
                  <h3 className="text-2xl font-semibold tracking-tight text-adm-text sm:text-[30px]">
                    {data === null ? '—' : metric.value}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${metric.textColor}`} />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-adm-subtle">{metric.period}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Lead-magnet funnels — live counts per source. Sits between the
          partner-leads metrics above and the charts below so an admin
          glancing at the page sees both partner KPIs and lead-magnet
          activity without scrolling on desktop. */}
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-adm-subtle sm:text-xs">
          Lead Magnet Funnels
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <FunnelTile
            label="Rule of 10X"
            count={ruleOf10xCount}
            icon={BookOpen}
            delay={0.05}
          />
          <FunnelTile
            label="Marketing Templates"
            count={templatesCount}
            icon={FileBox}
            delay={0.1}
          />
          <FunnelTile
            label="Career Applications"
            count={careerCount}
            icon={Briefcase}
            delay={0.15}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-adm-surface to-black border border-adm-line"
        >
          <h3 className="text-[15px] font-semibold text-adm-text mb-4 sm:mb-5">Submissions — last 7 days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-line)" />
              <XAxis dataKey="date" stroke="var(--adm-faint)" fontSize={12} />
              <YAxis stroke="var(--adm-faint)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--adm-surface)',
                  border: '1px solid var(--adm-line-strong)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--adm-text)' }}
                cursor={{ stroke: 'var(--adm-accent)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="var(--adm-accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--adm-accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-adm-surface to-black border border-adm-line"
        >
          <h3 className="text-[15px] font-semibold text-adm-text mb-4 sm:mb-5">Qualification breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-line)" />
              <XAxis dataKey="stage" stroke="var(--adm-faint)" fontSize={12} />
              <YAxis stroke="var(--adm-faint)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--adm-surface)',
                  border: '1px solid var(--adm-line-strong)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--adm-text)' }}
                cursor={{ fill: 'rgba(255, 184, 41, 0.08)' }}
              />
              <Bar dataKey="value" fill="var(--adm-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-adm-surface to-black border border-adm-line"
      >
        <h3 className="text-[15px] font-semibold text-adm-text mb-4 sm:mb-5">Recent inquiries</h3>
        {data === null ? (
          <div className="text-sm text-adm-subtle">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-adm-subtle">No inquiries yet.</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {data.slice(0, 5).map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-adm-raised"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{i.full_name}</p>
                  <p className="text-xs text-adm-subtle mt-0.5 truncate">{i.email}</p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                    i.outcome === 'qualified'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-red-500/10 text-red-300 border-red-500/20'
                  }`}
                >
                  {i.outcome === 'qualified' ? 'Qualified' : 'Not'}
                </span>
                <span className="shrink-0 text-xs text-adm-subtle whitespace-nowrap">
                  {formatTimeAgo(i.created_at, now)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function FunnelTile({
  label,
  count,
  icon: Icon,
  delay,
}: {
  label: string;
  count: number;
  icon: LucideIcon;
  delay: number;
}) {
  // Subdued tile — purposely lighter than the partner-lead KPI tiles above
  // so the visual hierarchy reads "primary KPIs / secondary funnel counts".
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-adm-line bg-gradient-to-br from-adm-surface to-black p-3 sm:p-4 hover:border-adm-accent/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-adm-accent-ink/80 shrink-0" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-adm-subtle truncate">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-adm-text sm:text-3xl">{count}</p>
    </motion.div>
  );
}
