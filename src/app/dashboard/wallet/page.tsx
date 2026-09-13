"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentStudent, GRADE_LABELS, getSettings } from '@/lib/storage';
import { Student, PlatformSettings } from '@/lib/types';
import {
  Wallet,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function WalletPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>(getSettings());

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
    setSettings(getSettings());
    const sync = () => setSettings(getSettings());
    window.addEventListener('platform-data-changed', sync);
    return () => window.removeEventListener('platform-data-changed', sync);
  }, [router]);

  if (!student) return <DashboardSkeleton />;

  const sub = student.subscription;
  const activeMonths = sub.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="المحفظة" subtitle="إدارة اشتراكك وطرق الدفع" icon={<Wallet className="w-6 h-6" />} />

      {/* Subscription Summary */}
      <div className={`border rounded-2xl p-6 shadow-sm ${sub.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sub.isActive ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">الاشتراك النشط</h3>
            <p className={`text-xs font-bold ${sub.isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
              {sub.isActive ? 'مفعّل' : 'غير مفعّل'}
            </p>
          </div>
        </div>
        {sub.isActive ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] text-gray-500 font-bold">ينتهي في</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">
                {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] text-gray-500 font-bold">المدة المتبقية</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">
                {activeMonths > 0 ? `${activeMonths} ${activeMonths === 1 ? 'شهر' : 'أشهر'}` : 'تنتهي قريباً'}
              </p>
            </div>
          </div>
        ) : (
          <Link href="/dashboard/subscription" className="block w-full py-3 text-center bg-emerald-800 text-white font-bold text-sm rounded-xl hover:bg-emerald-900 transition-colors">
            تفعيل الاشتراك الآن
          </Link>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 mb-4">طرق الدفع المتاحة</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900">فودافون كاش</p>
              <p className="text-xs text-gray-500 mt-0.5" dir="ltr">{settings.vodafoneCashNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900">انستاباي</p>
              <p className="text-xs text-gray-500 mt-0.5" dir="ltr">{settings.instapayUsername}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        {settings.whatsappNumber && (
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-green-50 text-green-800 font-bold text-xs rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مع المدرس عبر واتساب</span>
          </a>
        )}
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 p-4 bg-white/70 border border-emerald-100 rounded-2xl text-[11px] leading-relaxed text-slate-500 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
        <p>جميع عمليات الدفع آمنة ومشفرة. بياناتك المالية لا يتم حفظها على الخادم.</p>
      </div>
    </div>
  );
}