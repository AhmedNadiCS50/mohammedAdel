"use client";

import Link from 'next/link';
import {
  canStudentAccessLessonSequential,
  getLessonProgress,
} from '@/lib/storage';
import { Student, Lesson } from '@/lib/types';
import {
  Play,
  Lock,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function LessonCard({ student, lesson, lessons }: { student: Student; lesson: Lesson; lessons: Lesson[] }) {
  const accessCheck = canStudentAccessLessonSequential(student, lesson, lessons);
  const progress = getLessonProgress(student.id, lesson.id);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
      <div className="p-4 sm:p-5 flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
            {lesson.month || 'محاضرة'}
          </span>
          {progress?.completed ? (
            <span className="text-xs font-bold text-green-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> مكتمل
            </span>
          ) : accessCheck.canAccess ? (
            <span className="text-xs font-bold text-green-700 flex items-center gap-1">
              <Play className="w-3.5 h-3.5 fill-green-700" />
              {progress && progress.watchPercentage > 0 ? `${progress.watchPercentage}%` : 'متاح'}
            </span>
          ) : accessCheck.reason === 'previous_locked' ? (
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> مقفول
            </span>
          ) : (
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" /> اشتراك
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">{lesson.title}</h3>
        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
          {lesson.description || 'شرح تفصيلي وتطبيق عملي على منهج مادة التكنولوجيا.'}
        </p>

        {progress && progress.watchPercentage > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-green-700" />
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-green-700 rounded-full transition-all" style={{ width: `${progress.watchPercentage}%` }} />
            </div>
            <span className="text-xs font-bold text-green-700">{progress.watchPercentage}%</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 pt-0">
        {accessCheck.canAccess ? (
          <Link href={`/dashboard/lessons/${lesson.id}`} className="w-full py-3 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-sm" style={{ background: '#1B4332' }}>
            <Play className="w-3.5 h-3.5 fill-white" />
            {progress?.completed ? 'إعادة مشاهدة' : progress && progress.watchPercentage > 0 ? 'متابعة' : 'مشاهدة الآن'}
          </Link>
        ) : accessCheck.reason === 'previous_locked' ? (
          <Link href={accessCheck.previousLesson ? `/dashboard/lessons/${accessCheck.previousLesson.id}` : '#'} className="w-full py-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-amber-200 hover:bg-amber-100 transition-colors">
            <Lock className="w-3.5 h-3.5" /> أكمل المحاضرة السابقة
          </Link>
        ) : (
          <Link href="/dashboard/subscription" className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100 transition-colors">
            <Lock className="w-3.5 h-3.5" /> تفعيل الاشتراك
          </Link>
        )}
      </div>
    </div>
  );
}