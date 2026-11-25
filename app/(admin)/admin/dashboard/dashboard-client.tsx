'use client';

import { ChevronRight, Menu, Moon, PanelLeftOpen, Sun } from 'lucide-react';
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
import SupportTicketsManager from '@/components/admin/support-tickets-manager';
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
  support: { title: 'Support Tickets', description: 'Messages sent from the Support page.' },
};

const COLLAPSE_KEY = 'jaza-admin-sidebar-collapsed';

export default function AdminDashboardClient({ initialTab = 'overview' }: { initialTab?: DashboardTab }) {
  const router = useRouter();
  const { theme, toggle } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="flex min-h-screen">
        <AdminNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as DashboardTab)}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* top bar */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-adm-line bg-adm-bg/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-lg border border-adm-line text-adm-muted hover:bg-adm-hover hover:text-adm-text lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
            {collapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar (Ctrl+B)"
                className="hidden size-9 place-items-center rounded-lg border border-adm-line text-adm-muted hover:bg-adm-hover hover:text-adm-text lg:grid"
              >
                <PanelLeftOpen className="size-[18px]" />
              </button>
            )}
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <span className="text-adm-subtle">{group}</span>
              <ChevronRight className="size-3.5 shrink-0 text-adm-faint" />
              <span className="truncate font-medium text-adm-text">{page.title}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className="grid size-9 place-items-center rounded-lg border border-adm-line text-adm-muted transition hover:bg-adm-hover hover:text-adm-text"
              >
                {theme === 'dark' ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
              </button>
              <span className="hidden items-center gap-2 rounded-lg border border-adm-line py-1 pr-3 pl-1 sm:flex">
                <span className="grid size-7 place-items-center rounded-md bg-adm-accent text-[12px] font-bold text-[#141414]">A</span>
                <span className="text-[13px] font-medium text-adm-text">Admin</span>
              </span>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="font-serif text-[30px] leading-tight tracking-[-0.01em] text-adm-text sm:text-[36px]">{page.title}</h1>
              <p className="mt-1 text-[14px] text-adm-muted">{page.description}</p>
            </div>

            <UpcomingCallAlert onOpen={() => setActiveTab('bookings')} />
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'leads' && <PartnerLeadsManager />}
            {activeTab === 'applications' && <CareerApplicationsManager />}
            {activeTab === 'course-rule-of-10x' && (
              <CourseRequestsManager courseSlug="rule-of-10x" courseTitle={COURSE_CATALOG['rule-of-10x'].shortName} />
            )}
            {activeTab === 'course-marketing-templates' && (
              <CourseRequestsManager courseSlug="marketing-templates" courseTitle={COURSE_CATALOG['marketing-templates'].shortName} />
            )}
            {activeTab === 'support' && <SupportTicketsManager />}
            {activeTab === 'bookings' && <BookingManager />}
          </main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
