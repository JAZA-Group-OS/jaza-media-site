'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ExternalLink,
  FileBox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { useAdminTheme } from '@/components/admin/admin-theme';

type Item = { id: string; label: string; icon: LucideIcon };

export const NAV_GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Overview',
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'bookings', label: 'Discovery Calls', icon: CalendarDays },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { id: 'leads', label: 'Partner Leads', icon: TrendingUp },
      { id: 'applications', label: 'Career Applications', icon: Briefcase },
    ],
  },
  {
    title: 'Courses',
    items: [
      { id: 'course-rule-of-10x', label: 'Rule of 10X', icon: BookOpen },
      { id: 'course-marketing-templates', label: 'Marketing Templates', icon: FileBox },
    ],
  },
  {
    title: 'Help desk',
    items: [{ id: 'support', label: 'Support Tickets', icon: LifeBuoy }],
  },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export default function AdminNavigation({
  activeTab,
  onTabChange,
  onLogout,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
}: Props) {
  const { theme, toggle } = useAdminTheme();

  // Escape closes the drawer; lock page scroll while it's open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onMobileOpenChange(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, onMobileOpenChange]);

  const content = (mini: boolean) => (
    <div className="flex h-full flex-col">
      {/* brand + collapse */}
      <div className={`flex h-16 shrink-0 items-center border-b border-adm-line ${mini ? 'justify-center px-2' : 'justify-between px-5'}`}>
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => onMobileOpenChange(false)}>
          <span className="grid size-8 place-items-center rounded-lg bg-adm-accent font-serif text-[17px] font-semibold text-[#141414]">J</span>
          {!mini && (
            <span className="leading-none">
              <span className="block font-serif text-[18px] tracking-[0.18em] text-adm-text">JAZA</span>
              <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.32em] text-adm-accent-ink">ADMIN</span>
            </span>
          )}
        </Link>
        {!mini && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (Ctrl+B)"
            className="hidden size-8 place-items-center rounded-md text-adm-subtle transition hover:bg-adm-hover hover:text-adm-text lg:grid"
          >
            <PanelLeftClose className="size-[18px]" />
          </button>
        )}
      </div>

      {/* nav */}
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="mb-5 last:mb-0">
            {mini ? (
              <div aria-hidden className="mx-auto mb-2 h-px w-6 bg-adm-line" />
            ) : (
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold tracking-[0.14em] text-adm-faint uppercase">{g.title}</p>
            )}
            <ul className="space-y-0.5">
              {g.items.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        onTabChange(id);
                        onMobileOpenChange(false);
                      }}
                      aria-current={active ? 'page' : undefined}
                      title={mini ? label : undefined}
                      className={`group relative flex w-full items-center rounded-lg text-[13.5px] font-medium transition-colors ${
                        mini ? 'h-10 justify-center' : 'h-9 gap-3 px-3'
                      } ${active ? 'bg-adm-accent-soft text-adm-text' : 'text-adm-muted hover:bg-adm-hover hover:text-adm-text'}`}
                    >
                      {active && <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-adm-accent" />}
                      <Icon className={`size-[18px] shrink-0 ${active ? 'text-adm-accent-ink' : ''}`} strokeWidth={1.8} />
                      {!mini && <span className="truncate">{label}</span>}
                      {mini && (
                        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-md border border-adm-line bg-adm-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-adm-text shadow-lg group-hover:block">
                          {label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className={`shrink-0 space-y-0.5 border-t border-adm-line p-3 ${mini ? 'flex flex-col items-center' : ''}`}>
        {mini && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            title="Expand sidebar (Ctrl+B)"
            className="hidden size-10 place-items-center rounded-lg text-adm-muted transition hover:bg-adm-hover hover:text-adm-text lg:grid"
          >
            <PanelLeftOpen className="size-[18px]" />
          </button>
        )}
        <FooterButton mini={mini} icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle} />
        <FooterLink mini={mini} icon={ExternalLink} label="View website" href="/" />
        <FooterButton
          mini={mini}
          icon={LogOut}
          label="Log out"
          danger
          onClick={() => {
            onMobileOpenChange(false);
            onLogout();
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-adm-line bg-adm-surface transition-[width] duration-300 ease-out lg:block ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {content(collapsed)}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => onMobileOpenChange(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-adm-line bg-adm-surface lg:hidden"
            >
              <button
                type="button"
                onClick={() => onMobileOpenChange(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-hover hover:text-adm-text"
              >
                <X className="size-[18px]" />
              </button>
              {content(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const footerCls = (mini: boolean, danger?: boolean) =>
  `group relative flex items-center rounded-lg text-[13px] font-medium transition-colors ${
    mini ? 'size-10 justify-center' : 'h-9 w-full gap-3 px-3'
  } ${danger ? 'text-adm-muted hover:bg-red-500/10 hover:text-red-400' : 'text-adm-muted hover:bg-adm-hover hover:text-adm-text'}`;

function Tip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-md border border-adm-line bg-adm-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-adm-text shadow-lg group-hover:block">
      {label}
    </span>
  );
}

function FooterButton({ mini, icon: Icon, label, onClick, danger }: { mini: boolean; icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={mini ? label : undefined} className={footerCls(mini, danger)}>
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      {mini ? <Tip label={label} /> : label}
    </button>
  );
}

function FooterLink({ mini, icon: Icon, label, href }: { mini: boolean; icon: LucideIcon; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={mini ? label : undefined} className={footerCls(mini)}>
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      {mini ? <Tip label={label} /> : label}
    </a>
  );
}
