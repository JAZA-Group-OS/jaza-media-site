'use client';

import { LifeBuoy, Menu, Moon, PanelLeftOpen, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import AdminSessionProvider from '@/components/admin-session-provider';
import AdminNavigation, { NAV_GROUPS } from '@/components/admin/admin-navigation';
import { useAdminTheme } from '@/components/admin/admin-theme';
import BookingManager from '@/components/admin/booking-manager';
import CareerApplicationsManager from '@/components/admin/career-applications-manager';
import CourseRequestsManager from '@/components/admin/course-requests-manager';
import DashboardOverview from '@/components/admin/dashboard-overview';
import PartnerLeadsManager from '@/components/admin/partner-leads-manager';
import AiAssistant from '@/components/admin/ai-assistant';
import SupportDesk from '@/components/admin/support-desk';
import { aiEnabled } from './ai-actions';
import UpcomingCallAlert from '@/components/admin/upcoming-call-alert';
import { COURSE_CATALOG } from '@/lib/courses/catalog';
import { supabase } from '@/lib/supabase/client';

export type DashboardTab =
  | 'overview'
  | 'leads'
  | 'applications'
  | 'course-rule-of-10x'
  | 'course-marketing-templates'
  | 'support'
  | 'bookings';

const PAGE: Record<DashboardTab, { title: string; description: string }> = {
  overview: { title: 'Dashboard', description: 'Activity across leads, applications, courses and calls.' },
  bookings: { title: 'Discovery Calls', description: 'Upcoming calls, your calendar connection and availability.' },
  leads: { title: 'Partner Leads', description: 'Inquiries from the Partner With Us form.' },
  applications: { title: 'Career Applications', description: 'Candidates who applied through the careers page.' },
  'course-rule-of-10x': { title: 'Rule of 10X', description: 'Course access requests.' },
  'course-marketing-templates': { title: 'Marketing Templates', description: 'Template download requests.' },
  support: { title: 'Support Desk', description: 'Tickets from the Support page: triage, assign, note and resolve.' },
};

const COLLAPSE_KEY = 'jaza-admin-sidebar-collapsed';

export default function AdminDashboardClient({ initialTab = 'overview' }: { initialTab?: DashboardTab }) {
  const router = useRouter();
  const { theme, toggle } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // AI is shown only when the server has AI_SERVER_URL set.
  const [ai, setAi] = useState(false);
  useEffect(() => {
    void aiEnabled().then(setAi).catch(() => setAi(false));
  }, []);

  // Remember the sidebar state per browser: read once, then save every change.
  const ready = useRef(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(COLLAPSE_KEY);
    } catch {
      /* ignore */
    }
    queueMicrotask(() => {
      if (saved === '1') setCollapsed(true);
      ready.current = true;
    });
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  // Ctrl/⌘ + B toggles the sidebar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const page = PAGE[activeTab];
  const group = NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeTab))?.title ?? 'Admin';

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-adm-rail">
        <AdminNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as DashboardTab)}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        {/* canvas */}
        <div className="flex min-w-0 flex-1 flex-col bg-adm-bg lg:my-3 lg:mr-3 lg:rounded-[28px]">
          <header className="sticky top-0 z-30 flex min-h-[72px] shrink-0 flex-wrap items-center gap-x-4 gap-y-2 bg-adm-bg/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:top-3 lg:rounded-t-[28px] lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid size-10 place-items-center rounded-full bg-adm-surface text-adm-muted hover:text-adm-text lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
            {collapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar (Ctrl+B)"
                className="hidden size-10 place-items-center rounded-full bg-adm-surface text-adm-muted hover:text-adm-text lg:grid"
              >
                <PanelLeftOpen className="size-[18px]" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-[22px] leading-tight font-semibold tracking-[-0.01em] text-adm-text sm:text-[24px]">{page.title}</h1>
              <p className="hidden truncate text-[12.5px] text-adm-subtle sm:block">
                {group} · {page.description}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className="grid size-10 place-items-center rounded-full border border-adm-line-strong bg-adm-surface text-adm-text-2 transition hover:border-adm-accent"
              >
                {theme === 'dark' ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
              </button>
              <span className="relative grid size-10 place-items-center rounded-full bg-adm-accent text-[14px] font-semibold text-[#141414]" title="Admin">
                A
                <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-adm-bg bg-green-500" />
              </span>
            </div>
          </header>

          <main className="w-full flex-1 px-4 pt-2 pb-8 sm:px-6 lg:px-8">
            <UpcomingCallAlert onOpen={() => setActiveTab('bookings')} />
            {activeTab === 'overview' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-adm-line bg-adm-surface px-4 py-3 text-left transition hover:border-adm-accent"
                >
                  <span className="flex items-center gap-2.5 text-[13.5px] text-adm-text">
                    <LifeBuoy className="size-4 text-adm-accent" aria-hidden />
                    Support Desk — triage and resolve messages from the Support page
                  </span>
                  <span className="text-[12.5px] font-medium text-adm-accent">Open desk →</span>
                </button>
                <DashboardOverview />
              </>
            )}
            {activeTab === 'leads' && <PartnerLeadsManager />}
            {activeTab === 'applications' && <CareerApplicationsManager />}
            {activeTab === 'course-rule-of-10x' && (
              <CourseRequestsManager courseSlug="rule-of-10x" courseTitle={COURSE_CATALOG['rule-of-10x'].shortName} />
            )}
            {activeTab === 'course-marketing-templates' && (
              <CourseRequestsManager courseSlug="marketing-templates" courseTitle={COURSE_CATALOG['marketing-templates'].shortName} />
            )}
            {activeTab === 'support' && <SupportDesk ai={ai} />}
            {activeTab === 'bookings' && <BookingManager />}
          </main>
        </div>
      </div>
      {ai && <AiAssistant />}
    </AdminSessionProvider>
  );
}
