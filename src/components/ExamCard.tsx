"use client";

import Link from 'next/link';
import { getExamSubmissions, getDaysRemaining } from '@/lib/storage';
import { Student, Exam } from '@/lib/types';
import {
  HelpCircle,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
} from 'lucide-react';

export default function ExamCard({ student, exam }: { student: Student; exam: Exam }) {
  const canTake = student.subscription.isActive && getDaysRemaining(student.subscription.expiresAt) > 0;
  const subs = getExamSubmissions(student.id, exam.id);
  const latestSub = subs.length > 0 ? subs[0] : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
            {exam.month || 'اختبار'}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1" dir="ltr">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> {exam.durationMinutes} دقيقة
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-snug">{exam.title}</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {exam.description || 'اختبار تقييمي للمحاضرة.'}
        </p>

        {latestSub && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {latestSub.hasPendingEssays ? (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs font-bold">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>تم التسليم · بانتظار مراجعة المدرس</span>
              </div>
            ) : (
              <div className={`flex items-center justify-between p-2 rounded-lg border text-xs font-bold ${latestSub.passed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                <span className="flex items-center gap-1.5">
                  {latestSub.passed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {latestSub.passed ? 'اجتزت الامتحان' : 'تم التصحيح'}
                </span>
                <span className="font-black text-green-700">{latestSub.score}/{latestSub.totalScore} ({latestSub.percentage}%)</span>
              </div>
            )}

            {latestSub.teacherComment && !latestSub.hasPendingEssays && (
              <div className="mt-2 p-2.5 bg-green-50/60 border border-green-200 rounded-lg rounded-r-none border-r-[3px] border-r-green-700 flex items-start gap-2 text-xs">
                <MessageSquare className="w-3.5 h-3.5 text-green-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-green-800 block mb-0.5">تعليق مستر عمرو شاهين:</span>
                  <p className="text-green-900 leading-relaxed font-medium whitespace-pre-line">{latestSub.teacherComment}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>{exam.questions.length} أسئلة</span>
          <span>درجة النجاح: {exam.passingScore}%</span>
        </div>
      </div>

      <div className="mt-4">
        {canTake ? (
          <Link
            href={`/dashboard/exams/${exam.id}`}
            className="w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white shadow-sm"
            style={{ background: latestSub?.hasPendingEssays ? '#d97706' : '#1B4332' }}
          >
            <HelpCircle className="w-4 h-4" />
            {latestSub ? (latestSub.hasPendingEssays ? 'عرض الإجابات' : 'عرض النتيجة') : 'ابدأ الامتحان'}
          </Link>
        ) : (
          <Link href="/dashboard/subscription" className="w-full py-2.5 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200">
            <Lock className="w-3.5 h-3.5" /> مغلق (يتطلب اشتراك)
          </Link>
        )}
      </div>
    </div>
  );
}