'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Inbox, Bell, Calendar } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { PartnerInquiry } from '@/lib/types/database';

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
  const [inquiries, setInquiries] = useState<PartnerInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (
      supabase.from('partner_inquiries') as unknown as {
        select: (cols: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: PartnerInquiry[] | null;
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
          return;
        }
        setInquiries(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = inquiries?.length ?? 0;
  const qualified = inquiries?.filter((i) => i.outcome === 'qualified').length ?? 0;
  const pending = inquiries?.filter((i) => i.follow_up_status === 'new').length ?? 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeek =
    inquiries?.filter((i) => Date.now() - new Date(i.created_at).getTime() < weekMs).length ?? 0;

  const dailySeries = inquiries ? buildDailySeries(inquiries) : [];
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
                    {inquiries === null ? '—' : metric.value}
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
        {inquiries === null ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-sm text-gray-500">No inquiries yet.</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {inquiries.slice(0, 5).map((i) => (
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
