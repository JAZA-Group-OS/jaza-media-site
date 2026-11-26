'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  Briefcase,
  CalendarDays,
  ExternalLink,
  FileBox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  ChevronLeft,
  ChevronRight,
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
    items: [{ id: 'support', label: 'Support Desk', icon: LifeBuoy }],
  },
  {
    title: 'AI',
    items: [{ id: 'ai-agent', label: 'AI Agent', icon: Bot }],
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
    <div className="flex h-full flex-col text-white">
      {/* brand + collapse */}
      <div className={`flex h-[76px] shrink-0 items-center border-b border-white/[0.06] ${mini ? 'justify-center px-2' : 'pl-5 pr-3'}`}>
        <Link
          href="/admin/dashboard"
          className="group flex items-center gap-3 leading-none"
          onClick={() => onMobileOpenChange(false)}
          aria-label="JAZA Admin home"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FFD84D] via-[#FFC400] to-[#C98F00] font-[family-name:var(--font-heading)] text-lg font-extrabold text-black shadow-[0_6px_18px_-6px_rgba(255,196,0,0.6),inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform group-hover:scale-105">
            J
          </span>
          {!mini && (
            <span className="flex flex-col gap-1.5">
              <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-tight text-white">
                JAZA <span className="font-semibold text-white/70">Media</span>
              </span>
              <span className="w-fit rounded-full border border-[#FFC400]/30 bg-[#FFC400]/10 px-2 py-[3px] text-[9px] font-semibold tracking-[0.2em] text-adm-accent">
                ADMIN
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* nav */}
      <nav aria-label="Admin" className={`flex-1 py-3 ${mini ? 'overflow-visible px-2' : 'overflow-y-auto px-4'}`}>
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className={mini ? 'mb-2' : 'mb-5 last:mb-0'}>
            {!mini && <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">{g.title}</p>}
            <ul className={mini ? 'space-y-2' : 'space-y-1'}>
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
                      className={
                        mini
                          ? `group relative flex w-full flex-col items-center gap-1 rounded-2xl py-2 transition-colors ${active ? 'bg-adm-accent text-[#141414]' : 'text-adm-rail-text hover:bg-white/[0.07] hover:text-white'}`
                          : `flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors ${active ? 'bg-adm-accent text-[#141414]' : 'text-adm-rail-text hover:bg-white/[0.07] hover:text-white'}`
                      }
                    >
                      <Icon className="size-[19px] shrink-0" strokeWidth={1.8} />
                      {mini ? (
                        <span className="max-w-full truncate px-1 text-[9.5px] leading-tight font-medium">{label.split(' ')[0]}</span>
                      ) : (
                        <span className="truncate">{label}</span>
                      )}
                      {mini && (
                        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-lg bg-[#141414] px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg ring-1 ring-white/10 group-hover:block">
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
      <div className={`shrink-0 space-y-1 border-t border-white/[0.08] p-3 ${mini ? 'flex flex-col items-center' : ''}`}>
        {mini ? (
          <FooterButton mini icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle} />
        ) : (
          <div role="group" aria-label="Theme" className="mb-2 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.05] p-1 ring-1 ring-white/[0.06]">
            {([['light', Sun, 'Light'], ['dark', Moon, 'Dark']] as const).map(([value, Icon, text]) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => !active && toggle()}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                    active ? 'bg-adm-accent text-black shadow-sm' : 'text-adm-rail-text hover:text-white'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {text}
                </button>
              );
            })}
          </div>
        )}
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
        className={`sticky top-0 hidden h-screen shrink-0 bg-adm-rail transition-[width] duration-300 ease-out lg:block ${
          collapsed ? 'w-[92px]' : 'w-60'
        }`}
      >
        {content(collapsed)}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (Ctrl+B)`}
          className="absolute top-1/2 -right-3.5 z-30 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-adm-rail text-adm-rail-text shadow-md transition hover:border-adm-accent hover:text-adm-accent"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
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
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-adm-rail lg:hidden"
            >
              <button
                type="button"
                onClick={() => onMobileOpenChange(false)}
                aria-label="Close menu"
                className="absolute top-5 right-3 grid size-8 place-items-center rounded-lg text-adm-rail-text hover:bg-white/10 hover:text-white"
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
  `group relative flex items-center rounded-xl text-[13px] font-medium transition-colors ${
    mini ? 'size-10 justify-center' : 'h-10 w-full gap-3 px-3'
  } ${danger ? 'text-adm-rail-text hover:bg-red-500/15 hover:text-red-300' : 'text-adm-rail-text hover:bg-white/[0.07] hover:text-white'}`;

function Tip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-lg bg-[#141414] px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg ring-1 ring-white/10 group-hover:block">
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
