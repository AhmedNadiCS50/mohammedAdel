"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { isAdminLoggedIn, setAdminLoggedIn, getPendingEssaySubmissions } from '@/lib/storage';
import { ensureAdminFirebaseAuth } from '@/lib/firebaseAuth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { subscribePendingPostsCount, subscribePendingReplies } from '@/lib/forumService';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  HelpCircle, 
  KeyRound, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck,
  MessagesSquare
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pendingEssays, setPendingEssays] = useState(0);
  const [forumPending, setForumPending] = useState(0);

  useEffect(() => {
    const check = isAdminLoggedIn();
    setIsAdmin(check);
    if (!check && pathname !== '/login') {
      router.push('/login');
    } else if (check && isFirebaseConfigured()) {
      ensureAdminFirebaseAuth().catch(() => {});
    }

    const refreshEssays = () => {
      setPendingEssays(getPendingEssaySubmissions().length);
    };
    refreshEssays();

    const handleDataChange = () => {
      refreshEssays();
    };
    window.addEventListener('platform-data-changed', handleDataChange);

    // Live forum moderation count (pending posts + pending replies)
    let pendingPosts = 0;
    let pendingReplies = 0;
    let unsubPostsCount = () => {};
    let unsubRepliesCount = () => {};
    const refreshForum = () => setForumPending(pendingPosts + pendingReplies);
    if (isFirebaseConfigured()) {
      unsubPostsCount = subscribePendingPostsCount((n) => {
        pendingPosts = n;
        refreshForum();
      });
      unsubRepliesCount = subscribePendingReplies((list) => {
        pendingReplies = list.length;
        refreshForum();
      });
    }
    return () => {
      window.removeEventListener('platform-data-changed', handleDataChange);
      unsubPostsCount();
      unsubRepliesCount();
    };
  }, [pathname, router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const adminNav = [
    { name: 'نظرة عامة', href: '/admin', icon: LayoutDashboard },
    { name: 'سجل الطلاب والاشتراكات', href: '/admin/students', icon: Users },
    { name: 'التسليمات وتصحيح المقالي', href: '/admin/submissions', icon: FileCheck, badge: pendingEssays > 0 ? pendingEssays : undefined },
    { name: 'منتدى الأسئلة والمراجعة', href: '/admin/forum', icon: MessagesSquare, badge: forumPending > 0 ? forumPending : undefined },
    { name: 'إدارة المحاضرات (YouTube)', href: '/admin/lessons', icon: Video },
    { name: 'بنك الأسئلة والامتحانات', href: '/admin/exams', icon: HelpCircle },
    { name: 'توليد أكواد التفعيل', href: '/admin/codes', icon: KeyRound },
    { name: 'إعدادات الدفع والمنصة', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Admin Dedicated Header */}
      <header className="text-white border-b shadow-sm sticky top-0 z-40" style={{ background: '#1B4332', borderColor: '#2D6A4F' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between min-h-[4rem] py-2 gap-3">
            {/* Branding */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-green-300 bg-green-950 shrink-0">
                <Image
                  src="/images/teacher.png"
                  alt="مستر محمد عادل"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-sm sm:text-base text-white block whitespace-nowrap">لوحة تحكم الخبير</span>
                <span className="text-xs text-green-200 block font-semibold whitespace-nowrap mt-0.5">مستر محمد عادل</span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Laptops & Desktops) */}
            <nav className="hidden lg:flex items-center gap-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-green-900 shadow-sm'
                        : 'text-green-100 hover:text-white hover:bg-green-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.name}</span>
                    {item.badge !== undefined && (
                      <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black mr-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-bold text-green-100 hover:text-white bg-green-900/70 hover:bg-green-800 px-3 py-2 rounded-xl border border-green-700/60 whitespace-nowrap transition-colors"
              >
                <span>معاينة المنصة</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
              </Link>

              <button
                onClick={() => {
                  setAdminLoggedIn(false);
                  router.push('/login');
                }}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold transition-colors shrink-0"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Admin Navigation Bar */}
          <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 scrollbar-none border-t border-green-800/80 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-white text-green-950 shadow-sm font-black'
                      : 'text-green-100 bg-green-900/70 hover:bg-green-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black mr-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
