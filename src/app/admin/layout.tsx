"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { isAdminLoggedIn, setAdminLoggedIn, getPendingEssaySubmissions, getAssignmentSubmissions } from '@/lib/storage';
import { getAssignmentSubmissionsFromFirestore } from '@/lib/firestoreService';
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
  MessagesSquare,
  ClipboardList
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pendingEssays, setPendingEssays] = useState(0);
  const [forumPending, setForumPending] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);

  // Let the mouse wheel scroll the horizontal nav pill bar.
  const handleNavWheel = (e: React.WheelEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const vertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0 || !vertical) return;
    e.preventDefault();
    el.scrollLeft = Math.min(
      Math.max(el.scrollLeft + e.deltaY * 0.7, 0),
      maxScroll
    );
  };

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

    const refreshAssignments = () => {
      const localPending = getAssignmentSubmissions().filter(s => s.status === 'submitted').length;
      setPendingAssignments(localPending);
      if (isFirebaseConfigured()) {
        getAssignmentSubmissionsFromFirestore()
          .then(list => setPendingAssignments(prev => Math.max(prev, list.filter(s => s.status === 'submitted').length)))
          .catch(() => {});
      }
    };
    refreshAssignments();

    const handleDataChange = () => {
      refreshEssays();
      refreshAssignments();
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
    { name: 'الواجبات', href: '/admin/assignments', icon: ClipboardList, badge: pendingAssignments > 0 ? pendingAssignments : undefined },
    { name: 'المشرفون', href: '/admin/moderators', icon: ShieldCheck },
    { name: 'توليد أكواد التفعيل', href: '/admin/codes', icon: KeyRound },
    { name: 'إعدادات الدفع والمنصة', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Slim Admin Header */}
      <header className="sticky top-0 z-40 overflow-hidden text-white border-b shadow-lg shadow-black/20"
        style={{ borderColor: 'rgba(82,183,120,0.25)', background: 'linear-gradient(115deg, #0C241B 0%, #1B4332 48%, #2D6A4F 100%)' }}>

        {/* Top gold accent line */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-transparent via-amber-300 to-transparent pointer-events-none" />

        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -top-16 -left-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 w-72 h-72 rounded-full bg-green-300/10 blur-3xl" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4rem] py-2.5 gap-3">
            {/* Branding */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-green-300/70 bg-green-950/60 shrink-0 shadow-md shadow-black/40">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/25 to-transparent pointer-events-none" />
                <Image
                  src="/images/teacher.png"
                  alt="مستر محمد عادل"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="leading-tight">
                <span className="font-black text-sm sm:text-base block whitespace-nowrap tracking-tight">
                  لوحة تحكم الخبير
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-green-200 font-bold mt-0.5 whitespace-nowrap">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  مستر محمد عادل
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/45 backdrop-blur-sm shadow-md shadow-black/20 whitespace-nowrap transition-colors duration-200 cursor-pointer"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/15 group-hover:bg-white/25 transition-colors">
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </span>
                <span>معاينة المنصة</span>
              </Link>

              <button
                onClick={() => {
                  setAdminLoggedIn(false);
                  router.push('/login');
                }}
                className="group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-red-100 hover:text-white bg-red-500/15 hover:bg-red-500/30 border border-red-400/30 transition-all duration-200 shrink-0"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0 group-hover:rotate-180 transition-transform duration-300" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile, Tablet & Small-Screen Horizontal Nav (below lg) */}
      <div className="lg:hidden sticky top-[4rem] z-30 border-b border-white/10 shadow-md shadow-black/10"
        style={{ background: 'linear-gradient(115deg, #10291E 0%, #21493A 100%)' }}>
        <div onWheel={handleNavWheel} className="flex overflow-x-auto py-2.5 gap-2 scrollbar-none max-w-[1440px] mx-auto px-4 sm:px-6">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[2.6rem] rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? 'bg-white text-emerald-950 shadow-md shadow-black/25 font-black'
                    : 'text-green-100/90 bg-white/10 hover:bg-white/20 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.name}</span>
                {item.badge !== undefined && (
                  <span className="bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 px-1.5 py-0.5 rounded-full text-[10px] font-black mr-1 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Body: Right Sidebar + Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">
        {/* Right Sidebar (lg+) */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 py-6 lg:py-8">
          <nav className="space-y-1.5">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-950 shadow-md shadow-emerald-900/10 ring-1 ring-emerald-100'
                      : 'text-slate-600 hover:bg-white hover:text-emerald-900 hover:shadow-sm hover:ring-1 hover:ring-emerald-50'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 px-2 py-0.5 rounded-full text-[11px] font-black shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-emerald-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer card */}
          <div className="mt-8 p-4 bg-white/70 border border-emerald-100 rounded-2xl text-[11px] leading-relaxed text-slate-500 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1.5" />
            <p className="font-bold text-slate-700 mb-0.5">وضع الأدمن النشط</p>
            <p>كل العمليات على الطلاب والمحتوى تُحفظ في قاعدة البيانات السحابية مباشرة.</p>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 min-w-0 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
