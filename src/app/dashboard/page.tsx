"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCurrentStudent,
  setCurrentStudent,
  getStudentById,
  getLessons,
  getExams,
  getDaysRemaining,
  isSubscriptionExpiringSoon,
  canStudentAccessLessonSequential,
  getLessonProgress,
  getExamSubmissions,
  verifySubscriptionExpiry,
  GRADE_LABELS
} from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getLessonsFromFirestore,
  getExamsFromFirestore,
  getStudentByIdFromFirestore
} from '@/lib/firestoreService';
import { Student, Lesson, Exam } from '@/lib/types';
import {
  Video,
  HelpCircle,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Play,
  BookOpen,
  Loader2,
  MessagesSquare,
  GraduationCap,
} from 'lucide-react';
import StudentCourseStats from '@/components/StudentCourseStats';
import PageHeader from '@/components/PageHeader';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'exams'>('lessons');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    if (s.grade && (s.grade as string).includes('baccalaureate')) {
      s.grade = (s.grade as string).includes('second') ? 'second_secondary_bac' : 'first_secondary_bac';
      setCurrentStudent(s);
    }
    // Normalize stale "active" flag so expired subscriptions show locked content/banner right away
    const normalized = verifySubscriptionExpiry(s);
    if (normalized !== s || normalized.subscription.isActive !== s.subscription.isActive) {
      setCurrentStudent(normalized);
    }
    setStudent(normalized);

    // 1. Instant load static & local lessons/exams so user never waits
    const staticLessons = getLessons(s.grade);
    const staticExams = getExams(s.grade);
    setLessons(staticLessons);
    setExams(staticExams);
    setDataLoading(false);

    const mergeLessons = (base: Lesson[], remote: Lesson[]) => {
      const map = new Map<string, Lesson>();
      base.forEach(l => map.set(l.id, l));
      remote.forEach(l => map.set(l.id, l));
      return Array.from(map.values()).sort((a, b) => a.orderIndex - b.orderIndex);
    };
    const mergeExams = (base: Exam[], remote: Exam[]) => {
      const map = new Map<string, Exam>();
      base.forEach(e => map.set(e.id, e));
      remote.forEach(e => map.set(e.id, e));
      return Array.from(map.values());
    };

    const loadData = async () => {
      try {
        if (isFirebaseConfigured()) {
          const [remoteLessons, remoteExams, freshStudent] = await Promise.all([
            getLessonsFromFirestore(s.grade),
            getExamsFromFirestore(s.grade),
            getStudentByIdFromFirestore(s.id),
          ]);

          let activeGrade = s.grade;
          if (freshStudent) {
            if (freshStudent.grade && (freshStudent.grade as string).includes('baccalaureate')) {
              freshStudent.grade = (freshStudent.grade as string).includes('second') ? 'second_secondary_bac' : 'first_secondary_bac';
            }
            activeGrade = freshStudent.grade;
            const normalizedFresh = verifySubscriptionExpiry(freshStudent);
            setStudent(normalizedFresh);
            setCurrentStudent(normalizedFresh);
          }

          // Merge cloud content — cloud always wins over static/local copies.
          // (Previously setLessons(getLessons(...)) overwrote the fresh Firestore
          // list with stale localStorage, so newly added lessons never appeared.)
          if (activeGrade !== s.grade) {
            const [gradeLessons, gradeExams] = await Promise.all([
              getLessonsFromFirestore(activeGrade),
              getExamsFromFirestore(activeGrade),
            ]);
            setLessons(mergeLessons(getLessons(activeGrade), gradeLessons));
            setExams(mergeExams(getExams(activeGrade), gradeExams));
          } else {
            setLessons(mergeLessons(staticLessons, remoteLessons));
            setExams(mergeExams(staticExams, remoteExams));
          }
        }
      } catch (err) {
        console.warn('Remote sync notice:', err);
      }
    };

    loadData();
  }, [router]);

  if (!student) return null;

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }


  const daysRemaining = getDaysRemaining(student.subscription.expiresAt);
  const isExpiringSoon = isSubscriptionExpiringSoon(student.subscription.expiresAt);
  const months = Array.from(new Set(lessons.map(l => l.month).filter(Boolean)));
  const filteredLessons = selectedMonth === 'all' ? lessons : lessons.filter(l => l.month === selectedMonth);

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Expiry Warning */}
        {isExpiringSoon && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 text-sm">اشتراكك على وشك الانتهاء!</p>
                <p className="text-xs text-amber-700">متبقي <strong>{daysRemaining} أيام</strong> فقط. جدّد قبل انقطاع خدمتك.</p>
              </div>
            </div>
            <Link href="/dashboard/subscription" className="self-start sm:self-auto shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors">
              تجديد الآن
            </Link>
          </div>
        )}

        {/* Welcome Card */}
        <PageHeader
          title={`مرحباً يا ${student.name} 👋`}
          subtitle={`${GRADE_LABELS[student.grade]} • لوحة الطالب`}
          icon={<GraduationCap className="w-6 h-6" />}
        >
          <div className="px-3.5 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-xs sm:text-sm">
            <p className="text-[11px] text-emerald-100/70 mb-0.5">حالة الاشتراك</p>
            {student.subscription.isActive ? (
              <span className="text-[#F3D879] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> مفعّل · {daysRemaining} يوم
              </span>
            ) : (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> غير مفعّل
              </span>
            )}
          </div>
          <Link href="/dashboard/subscription" className="btn-hero btn-hero--gold px-4 py-2 text-xs sm:text-sm">
            {student.subscription.isActive ? 'تفاصيل الاشتراك' : 'تفعيل الاشتراك'}
          </Link>
        </PageHeader>

        {/* Forum quick access */}
        <Link
          href="/forum"
          className="block bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-green-300 transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <MessagesSquare className="w-6 h-6 text-green-800" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">منتدى الأسئلة والنقاش</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  اسأل المدرس، شاهد إجاباته المباشرة، وشارك زملاء صفّك في النقاش.
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-bold text-green-800 hover:underline">دخول ←</span>
          </div>
        </Link>

        {/* Inactive notice */}
        {!student.subscription.isActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">المحاضرات والامتحانات مقفولة حالياً</h3>
                <p className="text-xs text-gray-600 mt-0.5">سدّد الاشتراك وأدخل كود التفعيل لفتح المحتوى كامل.</p>
              </div>
            </div>
            <Link href="/dashboard/subscription" className="w-full sm:w-auto text-center shrink-0 px-5 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl" style={{ background: '#1B4332' }}>
              صفحة الدفع والتفعيل
            </Link>
          </div>
        )}

        {/* Course Statistics Section */}
        <StudentCourseStats
          student={student}
          lessons={lessons}
          exams={exams}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Tabs & Month Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'lessons'
                  ? 'bg-green-800 text-white shadow-sm'
                  : 'text-gray-600 border border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <Video className="w-4 h-4" />
              <span>المحاضرات ({filteredLessons.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'exams'
                  ? 'bg-green-800 text-white shadow-sm'
                  : 'text-gray-600 border border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>الامتحانات ({exams.length})</span>
            </button>
          </div>

          {months.length > 0 && activeTab === 'lessons' && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-gray-500 font-medium">الشهر:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 cursor-pointer"
              >
                <option value="all">جميع الشهور</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* LESSONS GRID */}
        {activeTab === 'lessons' && (
          <div>
            {filteredLessons.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-gray-700">لا توجد محاضرات بعد</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">سيقوم المدرس برفع المحاضرات قريباً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredLessons.map((lesson) => {
                  const accessCheck = canStudentAccessLessonSequential(student, lesson, lessons);
                  const progress = getLessonProgress(student.id, lesson.id);
                  return (
                    <div key={lesson.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
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
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>نسبة الإنجاز</span>
                              <span className="font-bold text-green-700">{progress.watchPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full bg-green-700 rounded-full transition-all" style={{ width: `${progress.watchPercentage}%` }} />
                            </div>
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
                })}
              </div>
            )}
          </div>
        )}

        {/* EXAMS GRID */}
        {activeTab === 'exams' && (
          <div>
            {exams.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-gray-700">لا توجد امتحانات بعد</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">سيتم إضافة الامتحانات قريباً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {exams.map((exam) => {
                  const canTake = student.subscription.isActive;
                  const subs = getExamSubmissions(student.id, exam.id);
                  const latestSub = subs.length > 0 ? subs[0] : null;
                  return (
                    <div key={exam.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                            {exam.month || 'اختبار'}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
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
                            className="w-full py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white shadow-sm"
                            style={{ background: latestSub?.hasPendingEssays ? '#d97706' : '#1B4332' }}
                          >
                            <HelpCircle className="w-4 h-4" />
                            {latestSub ? (latestSub.hasPendingEssays ? 'عرض الإجابات' : 'عرض النتيجة') : 'ابدأ الامتحان'}
                          </Link>
                        ) : (
                          <Link href="/dashboard/subscription" className="w-full py-3 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200">
                            <Lock className="w-3.5 h-3.5" /> مغلق (يتطلب اشتراك)
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
