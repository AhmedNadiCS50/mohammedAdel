"use client";

import React, { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, ArrowRight, ShieldCheck, type LucideIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export interface AppShellNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export type AppShellRole = 'student' | 'admin' | 'moderator';

interface RoleStyle {
  headerBg: string;
  headerBorder: string;
  tabActiveText: string;
  tabActiveBg: string;
  tabActiveBorder: string;
  sidebarActive: string;
  iconActiveBg: string;
  iconIdleBg: string;
  iconIdleText: string;
  badgeDot: string;
}

const ROLE_STYLES: Record<AppShellRole, RoleStyle> = {
  student: {
    headerBg: 'linear-gradient(115deg, #0C241B 0%, #1B4332 48%, #2D6A4F 100%)',
    headerBorder: 'rgba(82,183,120,0.25)',
    tabActiveText: 'text-emerald-800',
    tabActiveBg: 'bg-emerald-50',
    tabActiveBorder: 'border-emerald-500',
    sidebarActive: 'bg-white text-emerald-900 ring-emerald-100',
    iconActiveBg: 'bg-emerald-800',
    iconIdleBg: 'bg-emerald-50',
    iconIdleText: 'text-emerald-800',
    badgeDot: 'bg-emerald-400',
  },
  admin: {
    headerBg: 'linear-gradient(115deg, #0C241B 0%, #1B4332 48%, #2D6A4F 100%)',
    headerBorder: 'rgba(82,183,120,0.25)',
    tabActiveText: 'text-emerald-800',
    tabActiveBg: 'bg-emerald-50',
    tabActiveBorder: 'border-emerald-500',
    sidebarActive: 'bg-white text-emerald-900 ring-emerald-100',
    iconActiveBg: 'bg-emerald-800',
    iconIdleBg: 'bg-emerald-50',
    iconIdleText: 'text-emerald-800',
    badgeDot: 'bg-emerald-400',
  },
  moderator: {
    headerBg: 'linear-gradient(115deg, #042F2E 0%, #134E4A 55%, #0F766E 100%)',
    headerBorder: 'rgba(20,184,166,0.25)',
    tabActiveText: 'text-teal-800',
    tabActiveBg: 'bg-teal-50',
    tabActiveBorder: 'border-teal-500',
    sidebarActive: 'bg-white text-teal-900 ring-teal-100',
    iconActiveBg: 'bg-teal-800',
    iconIdleBg: 'bg-teal-50',
    iconIdleText: 'text-teal-800',
    badgeDot: 'bg-teal-400',
  },
};

const FALLBACK_LOGO: Record<AppShellRole, ReactNode> = {
  student: <ShieldCheck className="w-6 h-6 text-emerald-200" />,
  admin: <ShieldCheck className="w-6 h-6 text-green-200" />,
  moderator: <ShieldCheck className="w-6 h-6 text-teal-200" />,
};

interface AppShellProps {
  role: AppShellRole;
  nav: AppShellNavItem[];
  tabNav?: AppShellNavItem[];
  brandTitle: string;
  brandSubtitle: string;
  logo?: string;
  userCard?: ReactNode;
  asideFooter?: ReactNode;
  headerActions?: ReactNode;
  onLogout?: () => void;
  logoutLabel?: string;
  mainClassName?: string;
  children: ReactNode;
}

export default function AppShell({
  role,
  nav,
  tabNav,
  brandTitle,
  brandSubtitle,
  logo,
  userCard,
  asideFooter,
  headerActions,
  onLogout,
  logoutLabel = 'تسجيل الخروج',
  mainClassName = 'py-6 sm:py-8',
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const styles = ROLE_STYLES[role];
  const tabs = (tabNav ?? nav).slice(0, 5);

  useEffect(() => {
    document.body.classList.add('no-tab-bar');
    return () => document.body.classList.remove('no-tab-bar');
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [drawerOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const BrandBlock = (
    <div className="flex items-center gap-3 shrink-0 min-w-0">
      <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-green-300/70 bg-green-950/60 shrink-0 shadow-md shadow-black/40">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/25 to-transparent pointer-events-none" />
        {logo ? (
          <Image src={logo} alt={brandTitle} fill className="object-cover object-top" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">{FALLBACK_LOGO[role]}</div>
        )}
      </div>
      <div className="leading-tight min-w-0">
        <span className="font-black text-sm sm:text-base block truncate tracking-tight text-white">{brandTitle}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-green-200 font-bold mt-0.5 truncate">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="truncate">{brandSubtitle}</span>
        </span>
      </div>
    </div>
  );

  const NavList = ({ items, onNavigate, compact = false }: { items: AppShellNavItem[]; onNavigate?: () => void; compact?: boolean }) => (
    <nav className={compact ? 'space-y-1' : 'space-y-1.5'}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 cursor-pointer ${
              active
                ? `${styles.sidebarActive} shadow-md ring-1`
                : 'text-slate-600 hover:bg-white hover:text-emerald-900 hover:shadow-sm hover:ring-1 hover:ring-emerald-50'
            }`}
          >
            <span
              className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-xl transition-colors duration-200 ${
                active
                  ? `${styles.iconActiveBg} text-white shadow-sm`
                  : `${styles.iconIdleBg} ${styles.iconIdleText} group-hover:bg-emerald-100`
              }`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0 truncate">{item.name}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 px-2 py-0.5 rounded-full text-[11px] font-black shadow-sm shrink-0">
                {item.badge}
              </span>
            )}
            {active && <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full ${styles.iconActiveBg}`} />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sticky app header */}
      <header
        className="sticky top-0 z-40 overflow-hidden text-white border-b shadow-lg shadow-black/20"
        style={{ borderColor: styles.headerBorder, background: styles.headerBg }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-transparent via-amber-300 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-16 -left-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 w-72 h-72 rounded-full bg-green-300/10 blur-3xl" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4rem] py-2.5 gap-3">
            {BrandBlock}
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
              <ThemeToggle variant="onDark" />
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm transition-colors duration-200 cursor-pointer"
                aria-label="القائمة"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer (phones & tablets < lg) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 shrink-0">
              <span className="font-black text-amber-600 text-xs">منصة الخبير</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {userCard}
              {NavList({ items: nav, onNavigate: () => setDrawerOpen(false) })}
            </div>

            <div className="px-4 py-4 border-t border-slate-200 shrink-0 space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                الصفحة الرئيسية
              </Link>
              {onLogout && (
                <button
                  onClick={() => { setDrawerOpen(false); onLogout(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {logoutLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar (phones & tablets < lg) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 pt-1.5 pb-1 min-h-[3.4rem] transition-colors ${active
                  ? `${styles.tabActiveText} ${styles.tabActiveBg} border-t-[3px] ${styles.tabActiveBorder}`
                  : 'text-slate-500 hover:text-emerald-800 border-t-[3px] border-transparent'
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full ${styles.badgeDot} text-white text-[9px] font-black flex items-center justify-center border border-white`}>
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-bold leading-none truncate max-w-full">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Body: right sidebar (lg+) + main */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 py-6 lg:py-8">
          {userCard && <div className="mb-4">{userCard}</div>}
          {NavList({ items: nav })}
          {asideFooter && <div className="mt-8">{asideFooter}</div>}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {logoutLabel}
            </button>
          )}
        </aside>
        <main className={`flex-1 min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0 ${mainClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}