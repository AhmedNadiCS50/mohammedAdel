"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentStudent, getLessons } from '@/lib/storage';
import { Student } from '@/lib/types';
import LessonCard from '@/components/LessonCard';
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

  if (!student) return <div className="flex items-center justify-center py-40"><Loader2 className="w-8 h-8 text-green-700 animate-spin" /></div>;

  const allLessons = getLessons(student.grade);
  const months = Array.from(new Set(allLessons.map(l => l.month).filter(Boolean))) as string[];
  const filteredLessons = selectedMonth === 'all' ? allLessons : allLessons.filter(l => l.month === selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">الدروس</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredLessons.length} محاضرة متاحة</p>
        </div>

        {months.length > 0 && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 cursor-pointer"
          >
            <option value="all">جميع الشهور</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
      </div>

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