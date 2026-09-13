"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentStudent, getExams, getExamSubmissions } from '@/lib/storage';
import { Student } from '@/lib/types';
import ExamCard from '@/components/ExamCard';
import { ClipboardList, Loader2, CheckCircle2, Clock } from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
  }, [router]);

  if (!student) return <div className="flex items-center justify-center py-40"><Loader2 className="w-8 h-8 text-green-700 animate-spin" /></div>;

  const exams = getExams(student.grade);
  const examsWithSubs = exams.filter(ex => {
    const subs = getExamSubmissions(student.id, ex.id);
    return subs.length > 0;
  });
  const pendingCount = examsWithSubs.filter(ex => {
    const subs = getExamSubmissions(student.id, ex.id);
    return subs[0]?.hasPendingEssays;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">الواجبات</h1>
        <p className="text-sm text-gray-500 mt-1">
          {examsWithSubs.length} واجب محلول
          {pendingCount > 0 && <span className="text-amber-600 font-bold"> · {pendingCount} بانتظار المراجعة</span>}
        </p>
      </div>

      {examsWithSubs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">لا توجد واجبات بعد</h3>
          <p className="text-xs text-gray-400 mt-1">ستظهر الواجبات هنا بعد تسليمها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {examsWithSubs.map((exam) => (
            <ExamCard key={exam.id} student={student} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}