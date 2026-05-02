'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  BookOpen,
  FileBox,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const MENU_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Partner Leads', icon: TrendingUp },
  { id: 'applications', label: 'Career Applications', icon: Briefcase },
  { id: 'course-rule-of-10x', label: 'Rule of 10X', icon: BookOpen },
  { id: 'course-marketing-templates', label: 'Marketing Templates', icon: FileBox },
] as const;

export default function AdminNavigation({
  activeTab,
  onTabChange,
  onLogout,
}: AdminNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change-ish events (escape key) and lock body scroll while open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navContent = (
    <>
      <Link
        href="/admin/dashboard"
        className="mb-12 block"
        onClick={() => setMobileOpen(false)}
      >
        <div className="text-2xl font-bold tracking-tight">
          JAZA<span className="gold-accent">ADMIN</span>
        </div>
      </Link>

      <nav className="space-y-2 flex-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#FFB829]/20 text-[#FFB829] border border-[#FFB829]/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[#1a1a1a] pt-4">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => {
            setMobileOpen(false);
            onLogout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
          Logout
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger — visible only on screens < lg */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white hover:bg-[#1a1a1a] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar — visible only on lg+ */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] p-6">
        {navContent}
      </aside>

      {/* Mobile drawer + backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0a0a0a] border-r border-[#1a1a1a] p-6 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
