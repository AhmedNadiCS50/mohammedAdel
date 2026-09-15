"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentStudent,
  setCurrentStudent,
  GRADE_LABELS,
  getLessons,
  getAssignments,
  getExams,
  getAllProgressForStudent,
  getAssignmentSubmissions,
  getExamSubmissions,
  getLessonProgress,
  getSettings,
} from '@/lib/storage';
import { Student } from '@/lib/types';
import { isFirebaseConfigured } from '@/lib/firebase';
import { getOwnStudentFromFirestore, saveOwnProfile } from '@/lib/profileService';
import StudentAvatar from '@/components/StudentAvatar';
import {
  User,
  Phone,
  GraduationCap,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  Copy,
  Check,
  Pencil,
  Save,
  MapPin,
  MessageCircle,
  TrendingUp,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DashboardSkeleton from '@/components/DashboardSkeleton';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'القليوبية',
  'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد',
  'مطروح', 'شمال سيناء', 'جنوب سيناء', 'أخرى',
];

const VIA_LABELS: Record<string, string> = {
  code: 'عن طريق كود تفعيل',
  manual: 'تفعيل يدوي من المدرس',
  none: '—',
};

function daysRemaining(expiresAt: string, nowMs: number): { days: number; hours: number } {
  const diff = Math.max(0, new Date(expiresAt).getTime() - nowMs);
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000) };
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [parentPhone, setParentPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
    setParentPhone(s.parentPhone || '');
    setGovernorate(s.governorate || 'القاهرة');

    if (isFirebaseConfigured()) {
      getOwnStudentFromFirestore(s).then((remote) => {
        if (remote) {
          if (remote.photoUrl || remote.governorate || remote.parentPhone) {
            const merged: Student = {
              ...s,
              ...(remote.photoUrl ? { photoUrl: remote.photoUrl } : {}),
              ...(remote.governorate ? { governorate: remote.governorate } : {}),
              ...(remote.parentPhone ? { parentPhone: remote.parentPhone } : {}),
            };
            setStudent(merged);
            setCurrentStudent(merged);
            setGovernorate(remote.governorate || s.governorate || 'القاهرة');
            setParentPhone(remote.parentPhone || s.parentPhone || '');
          }
        }
      });
    }
  }, [router]);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const {
    sub,
    isActive,
    remaining,
    lessons,
    progressList,
    assignments,
    assignmentSubs,
    exams,
    examSubs,
    completedLessons,
    overallPercent,
    currentLesson,
    submittedAssignments,
    solvedExamCount,
    latestExam,
    latestAssignment,
    lastActivity,
    whatsappDigits,
    teacherName,
  } = useMemo(() => {
    const sub = student?.subscription;
    const isActive = !!sub?.isActive && (!sub.expiresAt || new Date(sub.expiresAt).getTime() > nowMs);
    const remaining = sub?.expiresAt ? daysRemaining(sub.expiresAt, nowMs) : null;

    // Progress stats (device-local store) — parsed once per student/tick, not per keystroke.
    const lessons = student ? getLessons(student.grade).sort((a, b) => a.orderIndex - b.orderIndex) : [];
    const progressList = student ? getAllProgressForStudent(student.id) : [];
    const assignments = student ? getAssignments(student.grade) : [];
    const assignmentSubs = student ? getAssignmentSubmissions(undefined, student.id) : [];
    const exams = student ? getExams(student.grade) : [];
    const examSubs = student ? getExamSubmissions(student.id) : [];

    const completedLessons = lessons.filter((l) => {
      const p = student ? getLessonProgress(student.id, l.id) : null;
      return !!p && (p.completed || p.watchPercentage >= 90);
    }).length;
    const overallPercent = lessons.length === 0 ? 0 : Math.round((completedLessons / lessons.length) * 100);
    const currentLesson = lessons.find((l) => {
      const p = student ? getLessonProgress(student.id, l.id) : null;
      return !(p && (p.completed || p.watchPercentage >= 90));
    });
    const submittedAssignments = assignmentSubs.filter((s) => s.status === 'submitted' || s.status === 'graded');
    const solvedExamCount = new Set(examSubs.map((s) => s.examId)).size;
    const byDateDesc = <T extends { submittedAt: string }>(a: T, b: T) => b.submittedAt.localeCompare(a.submittedAt);
    const latestExam = [...examSubs].sort(byDateDesc)[0];
    const latestAssignment = [...assignmentSubs].sort(byDateDesc)[0];
    const lastActivity = [
      ...progressList.map((p) => p.lastUpdated),
      ...assignmentSubs.map((s) => s.submittedAt),
      ...examSubs.map((s) => s.submittedAt),
    ].filter(Boolean).sort().slice(-1)[0];

    const settings = getSettings();
    const whatsappRaw = settings.whatsappNumber || '';
    const whatsappDigits = whatsappRaw.replace(/\D/g, '');
    const teacherName = settings.teacherName || 'المدرس';

    return {
      sub,
      isActive,
      remaining,
      lessons,
      progressList,
      assignments,
      assignmentSubs,
      exams,
      examSubs,
      completedLessons,
      overallPercent,
      currentLesson,
      submittedAssignments,
      solvedExamCount,
      latestExam,
      latestAssignment,
      lastActivity,
      whatsappDigits,
      teacherName,
    };
  }, [student, nowMs]);

  if (!student) return <DashboardSkeleton />;

  const applyStudent = (patch: Partial<Student>) => {
    const merged = { ...student, ...patch };
    setStudent(merged);
    setCurrentStudent(merged);
  };

  const flashMsg = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    window.setTimeout(() => setMsg(null), 4000);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      flashMsg(false, 'صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      flashMsg(false, 'حجم الصورة أكبر من 2MB.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads/avatar', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        flashMsg(false, data.error || 'فشل رفع الصورة.');
        return;
      }
      const saved = await saveOwnProfile(student.id, { photoUrl: data.url });
      if (saved.success) {
        applyStudent({ photoUrl: data.url });
        flashMsg(true, 'تم تحديث الصورة الشخصية بنجاح.');
      } else {
        flashMsg(false, saved.error || 'تم رفع الصورة لكن فشل الحفظ في حسابك.');
      }
    } catch {
      flashMsg(false, 'تعذّر رفع الصورة. تحقق من الاتصال.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveEdit = async () => {
    const cleanPhone = parentPhone.replace(/\D/g, '');
    if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 14)) {
      flashMsg(false, 'رقم ولي الأمر غير صحيح — يجب أن يكون من 10 إلى 14 رقماً.');
      return;
    }
    if (governorate === 'أخرى') {
      flashMsg(false, 'اختر اسم المحافظة من القائمة.');
      return;
    }
    setSavingEdit(true);
    const res = await saveOwnProfile(student.id, {
      parentPhone: cleanPhone || '',
      governorate,
    });
    setSavingEdit(false);
    if (res.success) {
      applyStudent({ parentPhone: cleanPhone || '', governorate });
      setEditing(false);
      flashMsg(true, 'تم حفظ تعديلاتك بنجاح.');
    } else {
      flashMsg(false, res.error || 'فشل حفظ التعديلات.');
    }
  };

  const copyNumber = async () => {
    if (!whatsappDigits) return;
    try {
      await navigator.clipboard.writeText(whatsappDigits);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      flashMsg(false, 'تعذّر نسخ الرقم.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="الملف الشخصي" subtitle="بياناتك وتقدمك على المنصة" icon={<User className="w-6 h-6" />} />

      {msg && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${msg.ok ? 'bg-green-50 border border-green-300 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Profile card + avatar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <StudentAvatar name={student.name} photoUrl={student.photoUrl} className="w-24 h-24" textClass="text-3xl" />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="تغيير الصورة الشخصية"
              className="absolute -bottom-1.5 -left-1.5 w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-emerald-800 disabled:opacity-60 transition-colors"
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleAvatar} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900 truncate">{student.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-emerald-800 font-bold" dir="ltr">
              <Phone className="w-4 h-4" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 font-bold">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>{GRADE_LABELS[student.grade]}</span>
            </div>
            {student.governorate && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{student.governorate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress stats */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-black text-gray-900">تقدمك في المنصة</h3>
          <span className="text-[11px] text-gray-400 mr-auto">{overallPercent}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 mb-4 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-l from-emerald-700 to-emerald-500 transition-all" style={{ width: `${overallPercent}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-1">
              <BookOpen className="w-3.5 h-3.5" /> المحاضرات
            </div>
            <p className="text-lg font-black text-gray-900">{completedLessons} <span className="text-[11px] font-bold text-gray-500">/ {lessons.length}</span></p>
            <p className="text-[10px] text-gray-500 mt-0.5">مكتملة</p>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800 mb-1">
              <ClipboardList className="w-3.5 h-3.5" /> الواجبات
            </div>
            <p className="text-lg font-black text-gray-900">{submittedAssignments.length} <span className="text-[11px] font-bold text-gray-500">/ {assignments.length}</span></p>
            <p className="text-[10px] text-gray-500 mt-0.5">سلّمتها</p>
          </div>
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-800 mb-1">
              <FileCheck2 className="w-3.5 h-3.5" /> الامتحانات
            </div>
            <p className="text-lg font-black text-gray-900">{solvedExamCount} <span className="text-[11px] font-bold text-gray-500">/ {exams.length}</span></p>
            <p className="text-[10px] text-gray-500 mt-0.5">حللتها</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
          {currentLesson ? (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              محاضرتك الحالية: <span className="font-bold text-gray-800">{currentLesson.title}</span>
            </span>
          ) : lessons.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> أكملت كل المحاضرات! أحسنت 🎉
            </span>
          ) : null}
          {lastActivity && (
            <span className="inline-flex items-center gap-1.5 mr-auto">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              آخر نشاط: {formatDate(lastActivity)}
            </span>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-700" /> آخر نشاط
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {latestExam ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <p className="text-[11px] font-bold text-gray-500 mb-1">آخر امتحان</p>
              <p className="font-bold text-gray-800 line-clamp-1">{latestExam.examTitle}</p>
              <p className="text-gray-500 mt-0.5">
                النتيجة: {latestExam.percentage}% ({latestExam.passed ? 'ناجح' : latestExam.hasPendingEssays ? 'في انتظار تصحيح المقالي' : 'راسب'}) · {formatDate(latestExam.submittedAt)}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-gray-400">لا توجد امتحانات بعد.</div>
          )}
          {latestAssignment ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <p className="text-[11px] font-bold text-gray-500 mb-1">آخر واجب</p>
              <p className="font-bold text-gray-800 line-clamp-1">{latestAssignment.assignmentTitle}</p>
              <p className="text-gray-500 mt-0.5">
                الحالة: {latestAssignment.status === 'graded' ? `تم التصحيح (${latestAssignment.score ?? '—'}/${latestAssignment.maxScore})` : 'مسلّم بانتظار التصحيح'} · {formatDate(latestAssignment.submittedAt)}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-gray-400">لم تسلّم واجبات بعد.</div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-black text-gray-900">تواصل مع {teacherName}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> واتساب المدرس
          </a>
          <button
            type="button"
            onClick={copyNumber}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-700 border border-gray-300 text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'تم النسخ' : 'نسخ الرقم'}
          </button>
          <span className="text-[11px] text-gray-400" dir="ltr">{whatsappDigits}</span>
        </div>
      </div>

      {/* Details + edit */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-900">تفاصيل الحساب</h3>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> تعديل البيانات
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">رقم الهاتف</label>
            <p className="text-sm font-bold text-gray-800" dir="ltr">{student.phone}</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">رقم ولي الأمر</label>
            {editing ? (
              <input
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                inputMode="numeric"
                placeholder="01000000000"
                maxLength={14}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            ) : (
              <p className="text-sm font-bold text-gray-800" dir="ltr">{student.parentPhone || '—'}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">الصف الدراسي</label>
            <p className="text-sm font-bold text-gray-800">{GRADE_LABELS[student.grade]}</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">المحافظة</label>
            {editing ? (
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            ) : (
              <p className="text-sm font-bold text-gray-800">{student.governorate || '—'}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">تاريخ التسجيل</label>
            <p className="text-sm font-bold text-gray-800">{formatDate(student.createdAt)}</p>
          </div>
        </div>
        {editing && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold disabled:opacity-60 hover:bg-emerald-900 transition-colors"
            >
              {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ التعديلات
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setParentPhone(student.parentPhone || ''); setGovernorate(student.governorate || 'القاهرة'); }}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      {/* Subscription status */}
      <div className={`border rounded-2xl p-5 shadow-sm ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-gray-500'}`} />
          <h3 className="text-sm font-black text-gray-900">حالة الاشتراك</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isActive ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800">اشتراكك مفعّل</span>
              {remaining && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-800 mr-auto">
                  <Clock className="w-3.5 h-3.5" />
                  يتبقى {remaining.days} يوم و {remaining.hours} ساعة
                </span>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-600">لا يوجد اشتراك مفعّل</span>
              <a href="/dashboard/subscription" className="text-xs font-bold text-green-800 hover:underline mr-auto">تفعيل الآن</a>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="rounded-xl bg-white/70 border border-emerald-100 p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">ينتهي في</p>
            <p className="font-bold text-gray-800">{formatDate(sub?.expiresAt)}</p>
          </div>
{sub?.monthName && (
            <div className="rounded-xl bg-white/70 border border-emerald-100 p-3">
              <p className="font-bold text-gray-800">{sub?.monthName}</p>
            </div>
          )}
          <div className="rounded-xl bg-white/70 border border-emerald-100 p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">طريقة التفعيل</p>
            <p className="font-bold text-gray-800">{VIA_LABELS[sub?.activatedVia ?? 'none'] || VIA_LABELS.none}</p>
          </div>
        </div>
        {sub?.activatedAt && (
          <p className="text-[11px] text-gray-500 mt-3">تم التفعيل في {formatDate(sub?.activatedAt)}</p>
        )}
      </div>
    </div>
  );
}