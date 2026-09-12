"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  getStudentById, 
  getLessons, 
  manuallyActivateStudentMonth, 
  toggleStudentCourseAccess, 
  getActivationLogs,
  deleteStudent,
  getDaysRemaining,
  getLessonProgress,
  manuallyUnlockLesson,
  manuallyLockLesson,
  GRADE_LABELS
} from '@/lib/storage';
import { Student, Lesson, ActivationLog } from '@/lib/types';
import { 
  ArrowRight, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Sparkles, 
  History, 
  ShieldCheck,
  Smartphone,
  AlertCircle,
  Trash2
} from 'lucide-react';

export default function StudentRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [logs, setLogs] = useState<ActivationLog[]>([]);

  // Form states for manual activation
  const [monthName, setMonthName] = useState('شهر أكتوبر');
  const [durationDays, setDurationDays] = useState(30);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = () => {
    const s = getStudentById(studentId);
    setStudent(s);
    if (s) {
      setLessons(getLessons(s.grade));
    }
    const allLogs = getActivationLogs();
    setLogs(allLogs.filter(l => l.studentId === studentId));
  };

  const handleManualActivateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const res = manuallyActivateStudentMonth(student.id, monthName, Number(durationDays));
    if (res.success) {
      setActionNotice(`تم تفعيل اشتراك شهر (${monthName}) بنجاح لمدة ${durationDays} يوم!`);
      loadData();
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleToggleCourse = (lessonId: string) => {
    if (!student) return;
    const res = toggleStudentCourseAccess(student.id, lessonId);
    if (res.success) {
      setActionNotice(res.granted ? 'تم فتح الدرس لهذا الطالب بنجاح' : 'تم قفل الدرس لهذا الطالب');
      loadData();
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleToggleManualUnlock = (lessonId: string, isCurrentlyUnlocked: boolean) => {
    if (!student) return;
    if (isCurrentlyUnlocked) {
      manuallyLockLesson(student.id, lessonId);
      setActionNotice('تم إلغاء التجاوز اليدوي وإعادة خضوع المحاضرة للترتيب التلقائي.');
    } else {
      manuallyUnlockLesson(student.id, lessonId);
      setActionNotice('تم فتح المحاضرة يدوياً لهذا الطالب بنجاح (تجاوز الترتيب).');
    }
    loadData();
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDeleteStudent = () => {
    if (!student) return;
    if (confirm(`تحذير نهائي: هل أنت متأكد من حذف الطالب "${student.name}" من المنصة وقاعدة البيانات نهائياً؟`)) {
      deleteStudent(student.id);
      router.push('/admin/students');
    }
  };

  if (!student) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">تعذر العثور على سجل هذا الطالب</h2>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الطلاب
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(student.subscription.expiresAt);
  const customCourses = student.subscription.customAccessCourses || [];

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الطلاب</span>
        </Link>
        <span className="text-xs font-bold text-gold-600 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
          سجل الطالب الرسمي (Owner Profile)
        </span>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-2xl flex items-center gap-2 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. Student Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-gold-400 flex items-center justify-center font-black text-2xl border-2 border-gold-400 shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {GRADE_LABELS[student.grade]}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1 font-mono font-bold text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" /> الطالب: {student.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  ولي الأمر: {student.parentPhone}
                </span>
              </div>
            </div>
          </div>

          <div>
            {student.subscription.isActive ? (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-right">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> اشتراك شهري نشط
                </span>
                <div className="text-xs text-slate-700 mt-1">
                  الشهر: <strong>{student.subscription.monthName}</strong>
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5">
                  ينتهي في: {new Date(student.subscription.expiresAt!).toLocaleDateString('ar-EG')} ({daysRemaining} يوم متبقي)
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-right">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" /> غير مفعّل (متوقف)
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك تفعيل اشتراكه يدوياً بعد استلام تحويل فودافون كاش
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>تاريخ تسجيل الحساب: {new Date(student.createdAt).toLocaleString('ar-EG')}</span>
          <span className="font-mono">ID: {student.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. Manual Monthly Activation Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">تفعيل اشتراك الشهر بالكامل يدوياً</h2>
              <p className="text-xs text-slate-500">اضغط تفعيل بعد مراجعة إثبات سداد فودافون كاش</p>
            </div>
          </div>

          <form onSubmit={handleManualActivateMonth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشهر أو الوحدة</label>
              <input
                type="text"
                required
                value={monthName}
                onChange={(e) => setMonthName(e.target.value)}
                placeholder="مثال: شهر أكتوبر أو الباب الأول"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مدة الاشتراك بالأيام</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none"
              >
                <option value={30}>30 يوماً (شهر كامل)</option>
                <option value={60}>60 يوماً (شهرين)</option>
                <option value={90}>90 يوماً (فصل دراسي كامل)</option>
                <option value={15}>15 يوماً (نصف شهر)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تفعيل اشتراك الشهر لهذا الطالب الآن</span>
            </button>
          </form>
        </div>

        {/* 3. Granular Course/Lesson Access (إتاحة وصول جزئي) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">إتاحة وصول جزئي لمحاضرات معينة</h2>
              <p className="text-xs text-slate-500">فتح أو قفل درس محدد لهذا الطالب دون تفعيل باقي الشهر</p>
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              لم تتم إضافة أي دروس في هذا الصف بعد.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lessons.map((lesson) => {
                const isCustomGranted = customCourses.includes(lesson.id);
                const hasFullSubscription = student.subscription.isActive;

                return (
                  <div
                    key={lesson.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 hover:bg-slate-50"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{lesson.title}</span>
                      <span className="text-[10px] text-slate-400">{lesson.month}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasFullSubscription ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          مفتوح بالاشتراك الكامل
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleCourse(lesson.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isCustomGranted
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-slate-200 text-slate-700 hover:bg-emerald-700 hover:text-white'
                          }`}
                        >
                          {isCustomGranted ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>مفتوح للطالب</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>مغلق (اضغط للفتح)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Sequential Unlock & Manual Override */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">ترتيب فتح المحاضرات والتجاوز اليدوي</h2>
              <p className="text-xs text-slate-500">
                متابعة تقدم مشاهدة الطالب في كل محاضرة وفتح أي محاضرة له يدوياً متجاوزاً شرط إكمال المحاضرة السابقة
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            تجاوز الترتيب التتابعي
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            لم تتم إضافة أي دروس في هذا الصف بعد.
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const progress = getLessonProgress(student.id, lesson.id);
              const isManuallyUnlocked = student.subscription.unlockedLessons?.includes(lesson.id);
              const isCompleted = progress?.completed || (progress && progress.watchPercentage >= 90);

              return (
                <div
                  key={lesson.id}
                  className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{lesson.title}</h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {lesson.month}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mr-8">
                      {isCompleted ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> أكمل المشاهدة ({progress?.watchPercentage || 100}%)
                        </span>
                      ) : progress && progress.watchedSeconds > 0 ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> شاهد {progress.watchPercentage}% (آخر موضع: {Math.floor(progress.watchedSeconds / 60)} دقيقة)
                        </span>
                      ) : (
                        <span className="text-slate-400">لم يبدأ مشاهدتها بعد (0%)</span>
                      )}

                      {isManuallyUnlocked && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          مفتوحة يدويًا بتجاوز منك
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isManuallyUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleToggleManualUnlock(lesson.id, true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>إلغاء الفتح اليدوي</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleManualUnlock(lesson.id, false)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>فتح المحاضرة يدويًا للطالب</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Activation History Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-emerald-800" />
          <h3 className="font-bold text-sm text-slate-900">سجل عمليات التفعيل السابقة لهذا الطالب:</h3>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">لا توجد عمليات تفعيل سابقة مسجلة لهذا الطالب.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{log.detail}</span>
                  <span className="text-[10px] text-slate-400">
                    بواسطة: {log.activatedBy === 'teacher' ? 'مستر محمد عادل يدوياً' : 'كود تفعيل بواسطة الطالب'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 5. Danger Zone: Delete Student */}
      <div className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-red-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>منطقة الحذف النهائي (Danger Zone)</span>
            </h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              حذف هذا الطالب سيمسح حسابه واشتراكه وسجل درجاته نهائياً من قاعدة البيانات والمنصة.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeleteStudent}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف الطالب نهائياً من المنصة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
