"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  GraduationCap,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessagesSquare,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

  const navItems = [
    { name: 'الملف الشخصي', href: '/dashboard/profile', icon: User },
    { name: 'المحفظة', href: '/dashboard/wallet', icon: Wallet },
    { name: 'الكورسات', href: '/dashboard/courses', icon: BookOpen },
    { name: 'الدروس', href: '/dashboard/lessons', icon: Video },
    { name: 'الترم', href: '/dashboard/term', icon: CalendarDays },
    { name: 'الكتب', href: '/products', icon: Library },
    { name: 'الامتحانات', href: '/dashboard/exams', icon: HelpCircle },
    { name: 'الواجبات', href: '/dashboard/assignments', icon: ClipboardList },
    { name: 'المنتدى', href: '/forum', icon: MessagesSquare },
  ];

  if (!student) return null;

  const isActive = (href: string) => pathname === href;

  const StudentCard = (
    <div className="prem-page-header p-4 mb-4">
      <div className="relative flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F3D879] to-[#D4AF37] text-[#241a03] flex items-center justify-center font-black text-xl shadow-md ring-2 ring-white/30">
            {student.name.trim().charAt(0) || 'ط'}
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

  const NavList = (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 cursor-pointer ${
              active
                ? 'bg-gradient-to-l from-emerald-900 to-emerald-800 text-white shadow-md shadow-emerald-900/20 ring-1 ring-emerald-700/50'
                : 'text-slate-600 hover:bg-white hover:text-emerald-900 hover:shadow-sm hover:ring-1 hover:ring-emerald-50'
            }`}
          >
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${
                active
                  ? 'bg-white/15 text-[#F3D879]'
                  : 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100'
              }`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">{item.name}</span>
            <ArrowRight className={`w-3.5 h-3.5 transition-colors ${active ? 'text-[#F3D879]' : 'text-gray-300 group-hover:text-emerald-700'}`} />
          </Link>
        );
      })}
    </nav>
  );

  const LogoutButton = (
    <button
      onClick={handleLogout}
      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors duration-200 cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      <span>تسجيل الخروج</span>
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">

        {/* Right Sidebar (lg+) */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 py-6 lg:py-8">
          {StudentCard}
          {NavList}
          {LogoutButton}

          <div className="mt-5 p-4 bg-white/70 border border-emerald-100 rounded-2xl text-[11px] leading-relaxed text-slate-500 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1.5" />
            <p className="font-bold text-slate-700 mb-0.5">خصوصية كاملة</p>
            <p>بياناتك ومستوى تقدمك محفوظة بأمان على حسابك الشخصي فقط.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Compact sidebar header for small screens */}
          <div className="lg:hidden py-5 space-y-4">
            {StudentCard}
            <div className="grid grid-cols-3 gap-2.5 min-[420px]:grid-cols-4 sm:grid-cols-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-1.5 px-1 py-3 min-h-[4.2rem] rounded-2xl text-[11px] font-bold cursor-pointer transition-all duration-200 ${
                      active
                        ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                        : 'bg-white text-slate-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="leading-tight text-center">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center gap-1.5 px-1 py-3 min-h-[4.2rem] rounded-2xl text-[11px] font-black text-red-700 bg-red-50 border border-red-200 cursor-pointer transition-colors hover:bg-red-100"
              >
                <LogOut className="w-5 h-5" />
                <span>خروج</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <Image
                src="/images/teacher.png"
                alt="مستر محمد عادل"
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
              <span>مادة التكنولوجيا مع مستر محمد عادل</span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}