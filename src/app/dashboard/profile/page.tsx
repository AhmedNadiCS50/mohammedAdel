"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentStudent, GRADE_LABELS } from '@/lib/storage';
import { Student } from '@/lib/types';
import {
  User,
  Phone,
  GraduationCap,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Image,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function ProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  if (!student) return <DashboardSkeleton />;

  const sub = student.subscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="الملف الشخصي" subtitle="بيانات حسابك على المنصة" icon={<User className="w-6 h-6" />} />

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            {student.name.trim().charAt(0) || 'ط'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900 truncate">{student.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-emerald-800 font-bold" dir="ltr">
              <Phone className="w-4 h-4" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 font-bold">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>{GRADE_LABELS[student.grade]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">رقم الهاتف</h3>
          </div>
          <p className="text-lg font-bold text-gray-800" dir="ltr">{student.phone}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">رقم ولي الأمر</h3>
          </div>
          <p className="text-lg font-bold text-gray-800" dir="ltr">{student.parentPhone || '—'}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">الصف الدراسي</h3>
          </div>
          <p className="text-lg font-bold text-gray-800">{GRADE_LABELS[student.grade]}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">تاريخ التسجيل</h3>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {new Date(student.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className={`border rounded-2xl p-5 shadow-sm ${sub.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className={`w-4 h-4 ${sub.isActive ? 'text-emerald-700' : 'text-gray-500'}`} />
          <h3 className="text-sm font-black text-gray-900">حالة الاشتراك</h3>
        </div>
        <div className="flex items-center gap-2">
          {sub.isActive ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800">اشتراكك مفعّل</span>
              {sub.expiresAt && (
                <span className="text-xs text-emerald-600 mr-auto">
                  ينتهي في {new Date(sub.expiresAt).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-600">لا يوجد اشتراك مفعّل</span>
              <a href="/dashboard/subscription" className="text-xs font-bold text-green-800 hover:underline mr-auto">تفعيل الآن</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}