"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCurrentStudent,
  setCurrentStudent,
  GRADE_LABELS,
} from '@/lib/storage';
import { firebaseLogoutUser } from '@/lib/firebaseAuth';
import { Student } from '@/lib/types';
import {
  User,
  Wallet,
  BookOpen,
  Video,
  CalendarDays,
  Library,
  HelpCircle,
  ClipboardList,
  GraduationCap,
  Phone,
  ShieldCheck,
  ArrowRight,
  MessagesSquare,
} from 'lucide-react';
import AppShell, { type AppShellNavItem } from '@/components/AppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) {
      router.push('/login');
      return;
    }
    setStudent(s);
  }, [router]);

  const handleLogout = async () => {
    setCurrentStudent(null);
    await firebaseLogoutUser();
    router.push('/login');
  };

  const navItems: AppShellNavItem[] = [
    { name: 'ملفي الشخصي', href: '/dashboard/profile', icon: User },
    { name: 'المحفظة', href: '/dashboard/wallet', icon: Wallet },
    { name: 'الكورسات', href: '/dashboard/courses', icon: BookOpen },
    { name: 'المحاضرات', href: '/dashboard/lessons', icon: Video },
    { name: 'الترم', href: '/dashboard/term', icon: CalendarDays },
    { name: 'المنتجات', href: '/products', icon: Library },
    { name: 'الامتحانات', href: '/dashboard/exams', icon: HelpCircle },
    { name: 'الواجبات', href: '/dashboard/assignments', icon: ClipboardList },
    { name: 'المنتدى', href: '/forum', icon: MessagesSquare },
  ];

  const tabNav: AppShellNavItem[] = [
    { name: 'المحاضرات', href: '/dashboard/lessons', icon: Video },
    { name: 'الامتحانات', href: '/dashboard/exams', icon: HelpCircle },
    { name: 'الواجبات', href: '/dashboard/assignments', icon: ClipboardList },
    { name: 'الكورسات', href: '/dashboard/courses', icon: BookOpen },
    { name: 'ملفي', href: '/dashboard/profile', icon: User },
  ];

  if (!student) return null;

  const StudentCard = (
    <div className="prem-page-header p-4">
      <div className="relative flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F3D879] to-[#D4AF37] text-[#241a03] flex items-center justify-center font-black text-xl shadow-md ring-2 ring-white/30">
            {student.name.trim().charAt(0) || '?'}
          </div>
          <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">{student.name}</p>
          <p className="flex items-center gap-1 text-[11px] text-emerald-100/80 font-bold mt-0.5" dir="ltr">
            <Phone className="w-3 h-3 text-[#F3D879]" />
            <span>{student.phone}</span>
          </p>
        </div>
      </div>
      <div className="relative mt-3 pt-3 border-t border-white/15 flex items-center gap-1.5 text-[11px] font-bold text-[#F3E9C0]">
        <GraduationCap className="w-3.5 h-3.5 text-[#F3D879]" />
        <span className="truncate">{GRADE_LABELS[student.grade]}</span>
      </div>
    </div>
  );

  const AsideFooter = (
    <div className="p-4 bg-white/70 border border-emerald-100 rounded-2xl text-[11px] leading-relaxed text-slate-500 shadow-sm">
      <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1.5" />
      <p className="font-bold text-slate-700 mb-0.5">حماية الحساب</p>
      <p>لا تشارك بياناتك الدراسية أو رمز الاشتراك مع أي شخص — ودّع خصوصية حسابك على المنصة.</p>
    </div>
  );

  return (
    <AppShell
      role="student"
      nav={navItems}
      tabNav={tabNav}
      brandTitle="منصة الخبير"
      brandSubtitle="أ. عمرو شاهين"
      logo="/images/teacher.png"
      userCard={StudentCard}
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
      mainClassName="py-0"
    >
      {children}
    </AppShell>
  );
}