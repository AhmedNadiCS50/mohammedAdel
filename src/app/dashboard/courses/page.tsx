"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentStudent, GRADE_LABELS, getLessons } from '@/lib/storage';
import { Student } from '@/lib/types';
import {
  BookOpen,
  Video,
  FileText,
  Users,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function CoursesPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  const allLessons = useMemo(() => (student ? getLessons(student.grade) : []), [student]);

  if (!student) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader title="الكورسات" subtitle="نظرة عامة على المواد والمحاضرات المتاحة" icon={<BookOpen className="w-6 h-6" />} />

      {/* Grade Course Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-gray-900">مادة التكنولوجيا</h2>
              <p className="text-sm font-bold text-emerald-800 mt-0.5">{GRADE_LABELS[student.grade]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-800">{allLessons.length} محاضرة</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-bold text-gray-700">منهج {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <Link
            href="/dashboard"
            className="w-full py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            عرض المحاضرات
          </Link>
        </div>
      </div>

      {/* Available Books */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-gray-900">كتب ومراجع</h2>
              <p className="text-sm font-bold text-amber-700 mt-0.5">المتجر</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <Link
            href="/products"
            className="w-full py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
          >
            <span>تصفح الكتب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}