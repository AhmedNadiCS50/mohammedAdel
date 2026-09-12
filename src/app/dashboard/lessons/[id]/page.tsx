"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  getCurrentStudent, 
  getLessonById, 
  getLessons,
  canStudentAccessLessonSequential, 
  getExams,
  GRADE_LABELS
} from '@/lib/storage';
import { Student, Lesson, Exam } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';
import { 
  ArrowRight, 
  Lock, 
  Download, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function WatchLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [relatedExam, setRelatedExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) {
      router.push('/login');
      return;
    }
    setStudent(s);

    const l = getLessonById(lessonId);
    setLesson(l);

    const list = getLessons(s.grade);
    setAllLessons(list);

    if (l) {
      const exams = getExams(l.grade);
      const matched = exams.find(e => e.lessonId === l.id || e.month === l.month);
      setRelatedExam(matched || null);
    }

    setIsLoading(false);
  }, [lessonId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">عفواً، لم يتم العثور على هذه المحاضرة</h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm"
          style={{ background: '#1B4332' }}
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوحة الدروس
        </Link>
      </div>
    );
  }

  const accessCheck = canStudentAccessLessonSequential(student, lesson, allLessons);

  // If locked due to sequential order (previous lesson not watched 90% yet)
  if (!accessCheck.canAccess && accessCheck.reason === 'previous_locked') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">هذه المحاضرة مقفولة بالترتيب</h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            حرصاً على الفهم الكامل والتسلسل التعليمي المعتمد من مستر محمد عادل، يجب إنهاء مشاهدة المحاضرة السابقة أولاً بنسبة 90% لتفتح لك هذه المحاضرة تلقائياً.
          </p>

          {accessCheck.previousLesson && (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-right max-w-md mx-auto">
              <span className="text-xs text-amber-800 font-bold block">المحاضرة المطلوب إكمالها أولاً:</span>
              <span className="text-sm font-black text-gray-900 mt-1 block">{accessCheck.previousLesson.title}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {accessCheck.previousLesson && (
              <Link
                href={`/dashboard/lessons/${accessCheck.previousLesson.id}`}
                className="w-full sm:w-auto px-6 py-2.5 font-bold text-sm rounded-xl text-white shadow-sm"
                style={{ background: '#1B4332' }}
              >
                الانتقال لمشاهدة المحاضرة السابقة
              </Link>
            )}
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all"
            >
              العودة لقائمة المحاضرات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If student doesn't have active subscription or course access:
  if (!accessCheck.canAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">هذه المحاضرة مقفولة</h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            عفواً يا {student?.name}، هذه المحاضرة مخصصة للطلاب المشتركين في مادة التكنولوجيا لشهر ({lesson.month}). لتفعيل المشاهدة يرجى تفعيل كود الاشتراك أو طلب فتح المحاضرة من مستر محمد عادل.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/subscription"
              className="w-full sm:w-auto px-6 py-2.5 font-bold text-sm rounded-xl text-white shadow-sm"
              style={{ background: '#1B4332' }}
            >
              صفحة تفعيل الاشتراك
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all"
            >
              العودة للدروس
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back button & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-green-800 bg-white border border-gray-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لجدول المحاضرات</span>
          </Link>

          <span className="text-xs font-bold text-green-800 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
            {GRADE_LABELS[lesson.grade]} • {lesson.month}
          </span>
        </div>

        {/* Video Player Container */}
        <div className="space-y-4">
          <VideoPlayer
            videoUrlOrId={lesson.youtubeVideoId}
            title={lesson.title}
            student={student}
            lessonId={lesson.id}
          />
        </div>

        {/* Lesson Details and Meta */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-green-800 bg-green-50 px-2.5 py-0.5 rounded-full mb-1 border border-green-200">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>محتوى تعليمي معتمد</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{lesson.title}</h1>
              <p className="text-xs text-gray-500 mt-1">
                إعداد وشرح: الخبير مستر محمد عادل • مادة التكنولوجيا والبرمجة
              </p>
            </div>

            <div className="flex items-center gap-2">
              {lesson.pdfAttachmentUrl && (
                <a
                  href={lesson.pdfAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-800 rounded-xl text-xs font-bold transition-colors border border-gray-200"
                >
                  <Download className="w-4 h-4 text-green-700" />
                  <span>تحميل مذكرة (PDF)</span>
                </a>
              )}

              {relatedExam && (
                <Link
                  href={`/dashboard/exams/${relatedExam.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all"
                  style={{ background: '#1B4332' }}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>حل امتحان الدرس</span>
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">وصف ونقاط المحاضرة:</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {lesson.description || 'احرص على تدوين الملاحظات وحل التطبيق العملي الملحق بالدرس بعد الانتهاء من المشاهدة.'}
            </p>
          </div>

          {/* Anti-leaking Notice */}
          <div className="p-3.5 bg-green-50/50 rounded-xl border border-green-100 text-[11px] text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-700 shrink-0" />
              <span>
                جميع حقوق الملكية الفكرية محفوظة لمستر محمد عادل. تُعرض علامة مائية باسمك ورقم هاتفك على الفيديو لمنع التسريب.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
