"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentModerator, setCurrentModerator, getPendingEssaySubmissions, getAssignmentSubmissions } from '@/lib/storage';
import { getAssignmentSubmissionsFromFirestore } from '@/lib/firestoreService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { subscribePendingPostsCount, subscribePendingReplies } from '@/lib/forumService';
import { Moderator } from '@/lib/types';
import {
  LayoutDashboard,
  FileCheck,
  MessagesSquare,
  Users,
  Send,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import AppShell, { type AppShellNavItem } from '@/components/AppShell';

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [moderator, setModerator] = useState<Moderator | null>(null);
  const [pendingEssays, setPendingEssays] = useState(0);
  const [forumPending, setForumPending] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);

  useEffect(() => {
    document.body.classList.add('no-tab-bar');
    const mod = getCurrentModerator();
    if (!mod) {
      router.push('/login');
      return;
    }
    setModerator(mod);

    const refreshEssays = () => setPendingEssays(getPendingEssaySubmissions().length);
    refreshEssays();

    const refreshAssignments = () => {
      const localPending = getAssignmentSubmissions().filter((s) => s.status === 'submitted').length;
      setPendingAssignments(localPending);
      if (isFirebaseConfigured()) {
        getAssignmentSubmissionsFromFirestore()
          .then((list) => setPendingAssignments((prev) => Math.max(prev, list.filter((s) => s.status === 'submitted').length)))
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
  }, [router]);

  if (!moderator) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    setCurrentModerator(null);
    router.push('/login');
  };

  const moderatorNav: AppShellNavItem[] = [
    { name: 'لوحة المشرف', href: '/moderator', icon: LayoutDashboard },
    { name: 'مناقشات المنتدى', href: '/moderator/forum', icon: MessagesSquare, badge: forumPending > 0 ? forumPending : undefined },
    { name: 'المقالات المقدمة', href: '/moderator/submissions', icon: FileCheck, badge: pendingEssays > 0 ? pendingEssays : undefined },
    { name: 'متابعة الطلاب', href: '/moderator/students', icon: Users },
    { name: 'واتساب ولي الأمر', href: '/moderator/parental', icon: Send },
  ];

  const AsideFooter = (
    <div className="p-4 bg-white/70 border border-teal-100 rounded-2xl text-[11px] leading-relaxed text-slate-500 shadow-sm">
      <ShieldCheck className="w-4 h-4 text-teal-700 mb-1.5" />
      <p className="font-bold text-slate-700 mb-0.5">صلاحيات المشرف</p>
      <p>متابعة الطلاب + تقييم المقالات + إدارة المناقشات. أي تغيير يُحفظ فورًا ويُسجّل تلقائيًا.</p>
    </div>
  );

  return (
    <AppShell
      role="moderator"
      nav={moderatorNav}
      brandTitle="لوحة المشرف"
      brandSubtitle={moderator.name}
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
      onLogout={handleLogout}
      logoutLabel="تسجيل الخروج"
    >
      {children}
    </AppShell>
  );
}