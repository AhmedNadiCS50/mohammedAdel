"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentStudent, getExams } from '@/lib/storage';
import { Student } from '@/lib/types';
import ExamCard from '@/components/ExamCard';
import { HelpCircle, Loader2 } from 'lucide-react';

export default function ExamsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  if (!student) return <div className="flex items-center justify-center py-40"><Loader2 className="w-8 h-8 text-green-700 animate-spin" /></div>;

  const exams = getExams(student.grade);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">الامتحانات</h1>
        <p className="text-sm text-gray-500 mt-1">{exams.length} امتحان متاح</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">لا توجد امتحانات بعد</h3>
          <p className="text-xs text-gray-400 mt-1">سيتم إضافة الامتحانات قريباً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {exams.map((exam) => (
            <ExamCard key={exam.id} student={student} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}