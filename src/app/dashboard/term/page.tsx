"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentStudent, getLessons } from '@/lib/storage';
import { Student } from '@/lib/types';
import {
  CalendarDays,
  Video,
  CheckCircle2,
  Play,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function TermPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  if (!student) return <DashboardSkeleton />;

  const allLessons = getLessons(student.grade);
  const monthMap: Record<string, typeof allLessons> = {};
  allLessons.forEach(l => {
    const m = l.month || 'غير محدد';
    if (!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(l);
  });
  const months = Object.entries(monthMap);

  return (
    <div className="space-y-6">
      <PageHeader title="الترم" subtitle="المدة الزمنية والمحاضرات حسب الشهر" icon={<CalendarDays className="w-6 h-6" />} />

      {months.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">لا توجد شهور بعد</h3>
          <p className="text-xs text-gray-400 mt-1">سيتم إضافة المحتوى قريباً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map(([monthName, lessons]) => (
            <div key={monthName} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">{lessons.length} محاضرة</span>
                </div>
                <h3 className="text-base font-black text-gray-900">{monthName}</h3>
              </div>

              <div className="px-5 pb-4 space-y-1.5">
                {lessons.slice(0, 3).map(l => (
                  <div key={l.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <Video className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span className="truncate font-bold">{l.title}</span>
                  </div>
                ))}
                {lessons.length > 3 && (
                  <p className="text-[11px] text-gray-400 font-bold">+ {lessons.length - 3} محاضرة أخرى</p>
                )}
              </div>

              <div className="border-t border-gray-100 p-4">
                <Link
                  href={`/dashboard/lessons?month=${encodeURIComponent(monthName)}`}
                  className="w-full py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  <span>عرض المحاضرات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}