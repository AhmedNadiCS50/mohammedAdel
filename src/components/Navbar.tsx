"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  ShoppingBag,
  User,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  CheckCircle2,
  Clock,
  MessagesSquare,
} from 'lucide-react';
import { getCurrentStudent, setCurrentStudent, isAdminLoggedIn, setAdminLoggedIn } from '@/lib/storage';
import { Student } from '@/lib/types';
import { firebaseLogoutUser } from '@/lib/firebaseAuth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setStudent(getCurrentStudent());
      setIsAdmin(isAdminLoggedIn());
    };
    checkAuth();
    window.addEventListener('platform-data-changed', checkAuth);
    return () => window.removeEventListener('platform-data-changed', checkAuth);
  }, [pathname]);

  const handleLogout = async () => {
    setCurrentStudent(null);
    setAdminLoggedIn(false);
    setStudent(null);
    setIsAdmin(false);
    await firebaseLogoutUser(); // Sign out from Firebase Auth too
    router.push('/');
  };

  const navLinks = [
    { name: 'الرئيسية',      href: '/',           icon: BookOpen  },
    { name: 'المنتجات والكتب', href: '/products',   icon: ShoppingBag },
    { name: 'لوحة الطالب',   href: '/dashboard',  icon: User      },
    { name: 'منتدى الأسئلة', href: '/forum',      icon: MessagesSquare },
    { name: 'لوحة المدرس',   href: '/admin',      icon: ShieldCheck },
  ];

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-green-200 shrink-0">
              <Image
                src="/images/teacher.png"
                alt="مستر عمرو شاهين"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-black text-sm sm:text-base text-gray-900 group-hover:text-green-800 transition-colors truncate">
                مادة التكنولوجيا
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-green-700 truncate">
                مستر عمرو شاهين
              </span>
            </div>
          </Link>

          {/* Desktop Nav (Laptops & Desktops) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'text-gray-600 hover:text-green-800 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Controls (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {student ? (
              <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-green-200 bg-green-50 text-xs">
                <div className="flex flex-col text-right">
                  <span className="font-bold text-gray-900 max-w-[120px] truncate">{student.name}</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {student.subscription.isActive ? (
                      <span className="text-green-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> مفعّل
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> غير مفعّل
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-green-200 bg-green-50 text-xs text-green-800">
                <span className="font-bold">لوحة المدرس نشطة</span>
                <button onClick={handleLogout} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs lg:text-sm font-bold text-gray-600 hover:text-green-800 transition-colors border border-gray-200 rounded-lg hover:border-green-200 hover:bg-green-50"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs lg:text-sm font-black rounded-lg text-white transition-all hover:-translate-y-0.5 shadow-sm"
                  style={{ background: '#1B4332' }}
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet menu button (Phones & Tablets below 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm ${
                    isActive
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-green-700" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100">
            {student ? (
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{student.name}</span>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-600 border border-red-200 font-bold">
                  خروج
                </button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-800">لوحة المدرس</span>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-600 border border-red-200 font-bold">
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center rounded-xl font-bold text-sm text-white"
                  style={{ background: '#1B4332' }}
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Mobile & Tablet bottom tab bar (below lg) */}
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[3.4rem] transition-colors ${isActive
                ? 'text-green-800 bg-green-50 border-t-[3px] border-green-700'
                : 'text-gray-500 hover:text-green-800 border-t-[3px] border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold leading-none">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
