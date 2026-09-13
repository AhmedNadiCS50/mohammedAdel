"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentStudent, getExams } from '@/lib/storage';
import { Student } from '@/lib/types';
import ExamCard from '@/components/ExamCard';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { HelpCircle, Loader2, ClipboardCheck } from 'lucide-react';

export default function ExamsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  if (!student) return <DashboardSkeleton />;

  const exams = getExams(student.grade);

  return (
    <div className="space-y-6">
      <PageHeader title="الامتحانات" subtitle={`${exams.length} امتحان متاح`} icon={<ClipboardCheck className="w-6 h-6" />} />

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