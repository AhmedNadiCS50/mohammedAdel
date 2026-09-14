"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentStudent, getLessons } from '@/lib/storage';
import { Student } from '@/lib/types';
import LessonCard from '@/components/LessonCard';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LessonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMonth = searchParams.get('month') || 'all';
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  const allLessons = useMemo(() => (student ? getLessons(student.grade) : []), [student]);
  const months = useMemo(() => Array.from(new Set(allLessons.map(l => l.month).filter(Boolean))) as string[], [allLessons]);
  const filteredLessons = useMemo(
    () => selectedMonth === 'all' ? allLessons : allLessons.filter(l => l.month === selectedMonth),
    [allLessons, selectedMonth]
  );

  if (!student) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader title="الدروس" subtitle={`${filteredLessons.length} محاضرة متاحة`} icon={<BookOpen className="w-6 h-6" />}>
        {months.length > 0 && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F3D879]/50 cursor-pointer"
          >
            <option value="all" className="text-gray-900">جميع الشهور</option>
            {months.map(m => <option key={m} value={m} className="text-gray-900">{m}</option>)}
          </select>
        )}
      </PageHeader>

      {filteredLessons.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">لا توجد محاضرات بعد</h3>
          <p className="text-xs text-gray-400 mt-1">سيقوم المدرس برفع المحاضرات قريباً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} student={student} lesson={lesson} lessons={allLessons} />
          ))}
        </div>
      )}
    </div>
  );
}