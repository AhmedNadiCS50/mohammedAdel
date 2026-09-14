"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getStudentById,
  getLessons,
  getLessonProgress,
  getAllProgressForStudent,
  getAssignments,
  getAssignmentSubmissions,
  getExams,
  getExamSubmissions,
  getActivationLogs,
  getDaysRemaining,
  syncFromFirestore,
  GRADE_LABELS,
} from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Student } from '@/lib/types';
import {
  ArrowRight,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  History,
  PlayCircle,
  ClipboardList,
  FileQuestion,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function ModeratorStudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadData = () => {
    setStudent(getStudentById(studentId));
    setLoaded(true);
  };

  useEffect(() => {
    loadData();
    if (isFirebaseConfigured()) {
      setSyncing(true);
      syncFromFirestore().then(() => {
        loadData();
        setSyncing(false);
      });
    }
  }, [studentId]);

  if (!student && !loaded) return null;

  if (!student) {
    return (
      <div className="py-16 text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">تعذر العثور على سجل هذا الطالب</h2>
        <Link
          href="/moderator/students"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الطلاب
        </Link>
      </div>
    );
  }

  const lessons = getLessons(student.grade).sort((a, b) => a.orderIndex - b.orderIndex);
  const assignments = getAssignments(student.grade);
  const exams = getExams(student.grade);
  const progressList = getAllProgressForStudent(student.id);
  const assignmentSubs = getAssignmentSubmissions(undefined, student.id);
  const examSubs = getExamSubmissions(student.id);
  const logs = getActivationLogs().filter((l) => l.studentId === studentId);
  const daysRemaining = getDaysRemaining(student.subscription.expiresAt);

  const completedLessons = lessons.filter(
    (l) => {
      const p = getLessonProgress(student.id, l.id);
      return p?.completed || (p && p.watchPercentage >= 90);
    }
  ).length;

  const currentLesson = lessons.find((l) => {
    const p = getLessonProgress(student.id, l.id);
    return !(p?.completed || (p && p.watchPercentage >= 90));
  });

  const overallPercent = lessons.length === 0 ? 0 : Math.round((completedLessons / lessons.length) * 100);
  const lastActivity = [
    ...progressList.map((p) => p.lastUpdated),
    ...assignmentSubs.map((s) => s.submittedAt),
    ...examSubs.map((s) => s.submittedAt),
  ]
    .filter(Boolean)
    .sort()
    .slice(-1)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/moderator/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لمتابعة الطلاب
        </Link>
        <button
          onClick={() => { if (isFirebaseConfigured()) { setSyncing(true); syncFromFirestore().then(() => { loadData(); setSyncing(false); }); } }}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'جاري التحديث…' : 'تحديث من السحابة'}
        </button>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-900 text-teal-100 flex items-center justify-center font-black text-2xl border-2 border-teal-300 shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{student.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{GRADE_LABELS[student.grade]}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 flex-wrap">
                <span className="flex items-center gap-1 font-mono font-bold text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-teal-700" /> {student.phone}
                </span>
                <span>•</span>
                <span className="font-mono">ولي الأمر: {student.parentPhone}</span>
              </div>
            </div>
          </div>

          <div>
            {student.subscription.isActive ? (
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-right">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> اشتراك نشط — {student.subscription.monthName}
                </span>
                <div className="text-xs font-bold text-emerald-700 mt-1">
                  ينتهي: {new Date(student.subscription.expiresAt!).toLocaleDateString('ar-EG')} ({daysRemaining} يوم)
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl text-right">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" /> غير مفعّل (متوقف)
                </span>
                <p className="text-xs text-slate-500 mt-1">الاشتراك الحالي غير ساري.</p>
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> مسجل في: {new Date(student.createdAt).toLocaleString('ar-EG')}
          </span>
          {lastActivity && (
            <span className="flex items-center gap-1.5 text-teal-700 font-bold">
              <PlayCircle className="w-3.5 h-3.5" /> آخر نشاط: {new Date(lastActivity).toLocaleString('ar-EG')}
            </span>
          )}
          <span className="font-mono">ID: {student.id}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold mb-1">
            <PlayCircle className="w-4 h-4 text-teal-600" /> تقدم المحاضرات
          </div>
          <div className="text-2xl font-black text-slate-900">{overallPercent}%</div>
          <div className="text-[11px] text-slate-500">أتم {completedLessons} من أصل {lessons.length} محاضرة</div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-teal-600" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold mb-1">
            <ClipboardList className="w-4 h-4 text-teal-600" /> واجبات الصف
          </div>
          <div className="text-2xl font-black text-slate-900">
            {assignmentSubs.filter((s) => s.status === 'submitted' || s.status === 'graded').length} / {assignments.length}
          </div>
          <div className="text-[11px] text-slate-500">عدد الواجبات المُسلّمة من إجمالي واجبات الصف</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold mb-1">
            <FileQuestion className="w-4 h-4 text-teal-600" /> امتحانات الصف
          </div>
          <div className="text-2xl font-black text-slate-900">{examSubs.length} / {exams.length}</div>
          <div className="text-[11px] text-slate-500">امتحانات تم حلها من أصل {exams.length} بالصف</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold mb-1">
            <Sparkles className="w-4 h-4 text-teal-600" /> تفعيلات سابقة
          </div>
          <div className="text-2xl font-black text-slate-900">{logs.length}</div>
          <div className="text-[11px] text-slate-500">عملية تفعيل اشتراك مسجلة لهذا الطالب</div>
        </div>
      </div>

      {/* Lesson progress */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-black text-slate-900">تقدم المشاهدة في المحاضرات</h2>
          </div>
          {currentLesson && (
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> وقف عند المحاضرة رقم {currentLesson.orderIndex}: {currentLesson.title}
            </span>
          )}
        </div>

        {lessons.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">لم تُضف محاضرات لهذا الصف بعد.</p>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {lessons.map((lesson) => {
              const p = getLessonProgress(student.id, lesson.id);
              const isCompleted = p?.completed || (p && p.watchPercentage >= 90);
              const isUnlocked = student.subscription.unlockedLessons?.includes(lesson.id);
              const isCurrent = currentLesson?.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-3 ${
                    isCurrent ? 'border-teal-400 bg-teal-50/60 ring-1 ring-teal-200' : isCompleted ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                      {lesson.orderIndex}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{lesson.month}</span>
                        {isUnlocked && (
                          <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold">
                            <Lock className="w-3 h-3" /> مفتوحة يدوياً
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:w-56 shrink-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className={isCompleted ? 'font-black text-emerald-700' : p && p.watchedSeconds > 0 ? 'font-bold text-amber-700' : 'text-slate-400'}>
                          {isCompleted ? 'تمت المشاهدة' : p && p.watchedSeconds > 0 ? `مشاهدة ${p.watchPercentage}%` : 'لم يبدأ'}
                        </span>
                        {p && p.watchedSeconds > 0 && <span className="font-mono text-slate-400">{Math.floor(p.watchedSeconds / 60)} د</span>}
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-600' : p && p.watchPercentage > 0 ? 'bg-amber-500' : 'bg-slate-200'}`} style={{ width: `${p ? p.watchPercentage : 0}%` }} />
                      </div>
                    </div>
                    {isCurrent && <span className="text-[10px] font-black text-teal-700 shrink-0">الحالية</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ClipboardList className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-black text-slate-900">الواجبات ({assignments.length})</h2>
        </div>
        {assignments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">لا توجد واجبات مضافة لهذا الصف.</p>
        ) : (
          <div className="space-y-2.5">
            {assignments.map((a) => {
              const sub = assignmentSubs.find((s) => s.assignmentId === a.id);
              return (
                <div key={a.id} className="p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">الحد الأقصى: {a.maxScore} درجة{a.dueDate ? ` • التسليم قبل ${new Date(a.dueDate).toLocaleDateString('ar-EG')}` : ''}</p>
                  </div>
                  {!sub ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-full shrink-0">
                      <Clock className="w-3.5 h-3.5" /> لم يسلّم الواجب بعد
                    </span>
                  ) : sub.status === 'graded' ? (
                    <div className="text-left shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-full ${sub.passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> مصحح: {sub.score}/{sub.maxScore}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full shrink-0">
                      <Clock className="w-3.5 h-3.5" /> سلّم لكن بانتظار التصحيح
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exams */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileQuestion className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-black text-slate-900">الامتحانات ({exams.length})</h2>
        </div>
        {exams.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">لا توجد امتحانات مضافة لهذا الصف.</p>
        ) : (
          <div className="space-y-2.5">
            {exams.map((ex) => {
              const sub = examSubs.filter((s) => s.examId === ex.id).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).slice(-1)[0];
              return (
                <div key={ex.id} className="p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900">{ex.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">درجة النجاح {ex.passingScore}</p>
                  </div>
                  {!sub ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-full shrink-0">
                      <Clock className="w-3.5 h-3.5" /> لم يبدأ الامتحان بعد
                    </span>
                  ) : sub.hasPendingEssays ? (
                    <div className="text-left shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" /> سلّم والمقالي بانتظار التصحيح
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(sub.submittedAt).toLocaleDateString('ar-EG')} • {sub.percentage}%</div>
                    </div>
                  ) : (
                    <div className="text-left shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-full ${sub.passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> {sub.percentage}% — {sub.passed ? 'ناجح' : 'راسب'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activation history */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-black text-slate-900">سجل التفعيلات ({logs.length})</h2>
        </div>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">لا توجد عمليات تفعيل مسجلة.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block truncate">{log.detail}</span>
                  <span className="text-[10px] text-slate-400">{log.studentName || ''}{log.activatedBy === 'teacher' ? ' — تفعيل يدوي' : ' — كود تفعيل'}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5" />
        هذه الصفحة للعرض فقط كمشرف — تعديل الاشتراكات أو فتح المحاضرات مسؤولية المدرس حصراً.
      </p>
    </div>
  );
}