"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  ArrowRight,
  FileCheck,
  MessagesSquare,
  ClipboardList,
} from 'lucide-react';
import AppShell, { type AppShellNavItem } from '@/components/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pendingEssays, setPendingEssays] = useState(0);
  const [forumPending, setForumPending] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);

  useEffect(() => {
    document.body.classList.add('no-tab-bar');
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
      document.body.classList.remove('no-tab-bar');
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

  const adminNav: AppShellNavItem[] = [
    { name: 'لوحة الأدمن', href: '/admin', icon: LayoutDashboard },
    { name: 'إدارة الطلاب والسعاة', href: '/admin/students', icon: Users },
    { name: 'المقالات المقدمة', href: '/admin/submissions', icon: FileCheck, badge: pendingEssays > 0 ? pendingEssays : undefined },
    { name: 'إدارة المنتدى', href: '/admin/forum', icon: MessagesSquare, badge: forumPending > 0 ? forumPending : undefined },
    { name: 'محاضرات المنصة (YouTube)', href: '/admin/lessons', icon: Video },
    { name: 'إدارة الامتحانات', href: '/admin/exams', icon: HelpCircle },
    { name: 'الواجبات', href: '/admin/assignments', icon: ClipboardList, badge: pendingAssignments > 0 ? pendingAssignments : undefined },
    { name: 'المراقبين', href: '/admin/moderators', icon: ShieldCheck },
    { name: 'أكواد الاشتراك', href: '/admin/codes', icon: KeyRound },
    { name: 'إعدادات المنصة', href: '/admin/settings', icon: Settings },
  ];

  const tabNav: AppShellNavItem[] = adminNav.slice(0, 5);

  const AsideFooter = (
    <div className="p-4 bg-white/70 border border-emerald-100 rounded-2xl text-[11px] leading-relaxed text-slate-500 shadow-sm">
      <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1.5" />
      <p className="font-bold text-slate-700 mb-0.5">لوحة التحكم</p>
      <p>إدارة الطلاب ومنشورات المنتدى ومحتوى المنصة كلها من مكان واحد، بأعلى مستوى من الأمان.</p>
    </div>
  );

  return (
    <AppShell
      role="admin"
      nav={adminNav}
      tabNav={tabNav}
      brandTitle="لوحة الأدمن"
      brandSubtitle="أ. عمرو شاهين"
      logo="/images/teacher.png"
      asideFooter={AsideFooter}
      headerActions={
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/45 backdrop-blur-sm shadow-md shadow-black/20 whitespace-nowrap transition-colors duration-200 cursor-pointer"
        >
          <ArrowRight className="w-3 h-3" />
          <span>الصفحة الرئيسية</span>
        </Link>
      }
      onLogout={() => {
        setAdminLoggedIn(false);
        router.push('/login');
      }}
      logoutLabel="تسجيل الخروج"
    >
      {children}
    </AppShell>
  );
}