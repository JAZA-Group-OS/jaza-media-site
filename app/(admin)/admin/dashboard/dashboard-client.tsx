'use client';

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSessionProvider from '@/components/admin-session-provider';
import { supabase } from '@/lib/supabase/client';
import AdminNavigation from '@/components/admin/admin-navigation';
import DashboardOverview from '@/components/admin/dashboard-overview';
import PartnerLeadsManager from '@/components/admin/partner-leads-manager';
import CareerApplicationsManager from '@/components/admin/career-applications-manager';
import CourseRequestsManager from '@/components/admin/course-requests-manager';
import SupportTicketsManager from '@/components/admin/support-tickets-manager';
import BookingManager from '@/components/admin/booking-manager';
import UpcomingCallAlert from '@/components/admin/upcoming-call-alert';
import { COURSE_CATALOG } from '@/lib/courses/catalog';

export type DashboardTab =
  | 'overview'
  | 'leads'
  | 'applications'
  | 'course-rule-of-10x'
  | 'course-marketing-templates'
  | 'support'
  | 'bookings';

export default function AdminDashboardClient({ initialTab = 'overview' }: { initialTab?: DashboardTab }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-black text-white flex">
        <AdminNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as DashboardTab)}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8">
            <div className="flex justify-between items-center gap-3 mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                <span className="block sm:inline">Admin Dashboard</span>
                <span className="gold-accent block sm:inline sm:ml-2">Control Center</span>
              </h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1a1a1a] hover:border-red-500 text-gray-400 hover:text-red-500 transition-colors text-xs sm:text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>

            <UpcomingCallAlert onOpen={() => setActiveTab('bookings')} />
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'leads' && <PartnerLeadsManager />}
            {activeTab === 'applications' && <CareerApplicationsManager />}
            {activeTab === 'course-rule-of-10x' && (
              <CourseRequestsManager
                courseSlug="rule-of-10x"
                courseTitle={COURSE_CATALOG['rule-of-10x'].shortName}
              />
            )}
            {activeTab === 'course-marketing-templates' && (
              <CourseRequestsManager
                courseSlug="marketing-templates"
                courseTitle={COURSE_CATALOG['marketing-templates'].shortName}
              />
            )}
            {activeTab === 'support' && <SupportTicketsManager />}
            {activeTab === 'bookings' && <BookingManager />}
          </div>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
