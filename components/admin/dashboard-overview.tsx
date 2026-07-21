'use client';

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

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildDailySeries(rows: PartnerInquiry[]): DailyPoint[] {
  const days: DailyPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      submissions: 0,
    });
  }
  rows.forEach((r) => {
    const ageDays = Math.floor((Date.now() - new Date(r.created_at).getTime()) / (24 * 60 * 60 * 1000));
    if (ageDays >= 0 && ageDays <= 6) {
      const idx = 6 - ageDays;
      days[idx].submissions += 1;
    }
  });
  return days;
}

export default function DashboardOverview() {
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
    data?.filter((i) => Date.now() - new Date(i.created_at).getTime() < weekMs).length ?? 0;

  const dailySeries = data ? buildDailySeries(data) : [];
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
      bgColor: 'bg-[#FFB829]/10',
      textColor: 'text-[#FFB829]',
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
              className={`p-4 sm:p-6 rounded-xl border border-[#1a1a1a] ${metric.bgColor}`}
            >
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{metric.label}</p>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    {data === null ? '—' : metric.value}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${metric.textColor}`} />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">{metric.period}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Lead-magnet funnels — live counts per source. Sits between the
          partner-leads metrics above and the charts below so an admin
          glancing at the page sees both partner KPIs and lead-magnet
          activity without scrolling on desktop. */}
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
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
          className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1a1a1a]"
        >
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Submissions — last 7 days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                cursor={{ stroke: '#FFB829', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#FFB829"
                strokeWidth={2}
                dot={{ fill: '#FFB829' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1a1a1a]"
        >
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Qualification breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="stage" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255, 184, 41, 0.08)' }}
              />
              <Bar dataKey="value" fill="#FFB829" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1a1a1a]"
      >
        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Recent inquiries</h3>
        {data === null ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-gray-500">No inquiries yet.</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {data.slice(0, 5).map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-[#1a1a1a]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{i.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{i.email}</p>
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
                <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
                  {formatTimeAgo(i.created_at)}
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
      className="rounded-xl border border-[#1a1a1a] bg-gradient-to-br from-[#0a0a0a] to-black p-3 sm:p-4 hover:border-[#FFB829]/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-[#FFB829]/80 shrink-0" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500 truncate">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-white sm:text-3xl">{count}</p>
    </motion.div>
  );
}
