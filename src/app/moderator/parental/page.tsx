"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getStudents, GRADE_LABELS, getDaysRemaining, getLessons, getExams, getAssignments, getLessonProgress, getAllProgressForStudent, getExamSubmissions, getAssignmentSubmissions, syncFromFirestore } from '@/lib/storage';
import { normalizePhone } from '@/lib/phone';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Student, Lesson, Exam, Assignment } from '@/lib/types';
import {
  Send,
  Phone,
  Search,
  RefreshCw,
  Users,
  Video,
  HelpCircle,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GraduationCap,
} from 'lucide-react';

type MsgTone = 'success' | 'warn' | 'info' | 'neutral';

interface ReadyMessage {
  label: string;
  message: string;
  tone: MsgTone;
}

const isCompleted = (p?: { completed?: boolean; watchPercentage?: number } | null) => !!p && (p.completed === true || (p.watchPercentage ?? 0) >= 90);

function toInternational(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const m12 = digits.match(/201[0125]\d{8}$/);
  if (m12) return m12[0];
  const m11 = digits.match(/01[0125]\d{8}$/);
  if (m11) return '20' + m11[0].slice(1);
  const m10 = digits.match(/1[0125]\d{8}$/);
  if (m10) return '20' + m10[0];
  return digits;
}

function formatIntlDisplay(phone: string): string {
  const intl = toInternational(phone);
  if (!intl) return (phone || '').trim();
  if (/^201[0125]\d{8}$/.test(intl)) {
    return `+20 ${intl.slice(2, 4)} ${intl.slice(4, 8)} ${intl.slice(8)}`;
  }
  return `+${intl}`;
}

function waLink(parentPhone: string, message: string): string {
  const intl = toInternational(parentPhone);
  return intl ? `https://wa.me/${intl}?text=${encodeURIComponent(message)}` : '';
}

const toneClass: Record<MsgTone, string> = {
  success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-300',
  warn: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-300',
  info: 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 hover:border-teal-300',
  neutral: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300',
};

const greet = (s: Student) => `السلام عليكم ورحمة الله وبركاته، حضرتك ولي أمر الطالب ${s.name}،`;

interface GradeData {
  lessons: Lesson[];
  exams: Exam[];
  assignments: Assignment[];
}

export default function ModeratorParentalPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [onlyWithParent, setOnlyWithParent] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadStudents = () => setStudents(getStudents());

  useEffect(() => {
    loadStudents();
    if (isFirebaseConfigured()) {
      setIsSyncing(true);
      syncFromFirestore().then(() => {
        loadStudents();
        setIsSyncing(false);
      });
    }
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncFromFirestore();
    loadStudents();
    setIsSyncing(false);
  };

  const grades = useMemo(() => Array.from(new Set(students.map((s) => s.grade))), [students]);

  const gradeDataMap = useMemo<Record<string, GradeData>>(() => {
    const map: Record<string, GradeData> = {};
    grades.forEach((g) => {
      const lessons = [...getLessons(g)].sort((a, b) => a.orderIndex - b.orderIndex);
      const exams = [...getExams(g)].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      const assignments = [...getAssignments(g)].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      map[g] = { lessons, exams, assignments };
    });
    return map;
  }, [grades]);

  const buildMessages = (s: Student): { lessons: ReadyMessage[]; exams: ReadyMessage[]; assignments: ReadyMessage[] } => {
    const out = { lessons: [] as ReadyMessage[], exams: [] as ReadyMessage[], assignments: [] as ReadyMessage[] };
    const data = gradeDataMap[s.grade];
    if (!data) return out;

    const progressMap = new Map(getAllProgressForStudent(s.id).map((p) => [p.lessonId, p]));

    // ── المحاضرات ────────────────────────────────
    const completedLessons = data.lessons.filter((l) => isCompleted(progressMap.get(l.id)));
    const lastCompleted = completedLessons.slice(-2).reverse();
    lastCompleted.forEach((l) => {
      out.lessons.push({
        label: `خلّص محاضرة: ${l.title}`,
        message: `${greet(s)} ماشاء الله — الطالب خلّص محاضرة «${l.title}». نسأل الله له التوفيق والسداد، ياريت تشجعوه يكمل باقي المحاضرات.`,
        tone: 'success',
      });
    });

    if (data.lessons.length > 1) {
      const lagging = data.lessons.filter((l) => !isCompleted(progressMap.get(l.id)));
      const critical = lagging.filter((l) => {
        const later = data.lessons.find((o) => o.orderIndex > l.orderIndex);
        return !!later;
      });
      critical.slice(0, 3).forEach((l) => {
        const afterCount = data.lessons.filter((o) => o.orderIndex > l.orderIndex).length;
        out.lessons.push({
          label: `متأخر عن محاضرة: ${l.title}`,
          message: `${greet(s)} حبيت أوقف حضرتك — الطالب لسه مخلّصش محاضرة «${l.title}» رغم نزول ${afterCount} محا${afterCount > 2 ? 'ضرا' : 'ضرة'} بعدها. ياريت تشجعوه يلحق يقفل المحاضرات المتراكمة.`,
          tone: 'warn',
        });
      });
    }

    // ── الامتحانات ───────────────────────────────
    const newestExam = data.exams[0];
    data.exams.slice(0, 2).forEach((exam) => {
      const subs = getExamSubmissions(s.id, exam.id);
      const latest = subs.length > 0 ? subs[0] : null;
      if (latest) {
        if (latest.hasPendingEssays) {
          out.exams.push({
            label: `امتحان مستلم بانتظار التصحيح: ${exam.title}`,
            message: `${greet(s)} الطالب سلّم امتحان «${exam.title}» وهو حالياً بانتظار تصحيح المدرس للمقالي.`,
            tone: 'info',
          });
        } else {
          out.exams.push({
            label: `خلّص امتحان (${latest.percentage}٪): ${exam.title}`,
            message: `${greet(s)} الطالب أنهى امتحان «${exam.title}» وحصل على ${latest.percentage}٪${latest.passed ? ' — ناجح، مبروك.' : ' — ولم يجتز الامتحان، ياريت يذاكر المحاضرة ويعيد المحاولة.'}`,
            tone: latest.passed ? 'success' : 'warn',
          });
        }
      } else {
        out.exams.push({
          label: `لسه مخدش امتحان: ${exam.title}`,
          message: `${greet(s)} الطالب لسه مخدش امتحان «${exam.title}». الامتحان تدريب مهم على شكل الامتحان النهائي، ياريت تشجعوه يحله.`,
          tone: 'neutral',
        });
      }
    });

    // ── الواجبات ────────────────────────────────
    const subsMap = new Map<string, { status: string; score?: number; maxScore: number }>();
    getAssignmentSubmissions(s.id).forEach((sub) => subsMap.set(sub.assignmentId, sub));
    data.assignments.slice(0, 2).forEach((assign) => {
      const sub = subsMap.get(assign.id);
      if (sub) {
        const graded = sub.status === 'graded' && typeof sub.score === 'number';
        out.assignments.push({
          label: `سلّم واجب: ${assign.title}`,
          message: `${greet(s)} الطالب سلّم واجب «${assign.title}».${graded ? ` تم تصحيحه وحصل على ${sub.score}/${sub.maxScore}.` : ''}`,
          tone: 'success',
        });
      } else {
        out.assignments.push({
          label: `لسه مسلّمش واجب: ${assign.title}`,
          message: `${greet(s)} الطالب لسه مسلّمش واجب «${assign.title}». ياريت تشجعوه يسلمه في وقته.`,
          tone: 'neutral',
        });
      }
    });

    return out;
  };

  const filtered = students.filter((s) => {
    const parentDst = formatIntlDisplay(s.parentPhone).replace(/[^0-9]/g, '');
    const queryDst = searchQuery.replace(/[^0-9]/g, '');
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.parentPhone.includes(searchQuery) ||
      (queryDst !== '' && parentDst.includes(queryDst));
    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    const matchesParent = !onlyWithParent || s.parentPhone.trim().length > 0;
    return matchesSearch && matchesGrade && matchesParent;
  });

  const SectionBlock = ({ title, icon, msgs, parentPhone }: { title: string; icon: React.ReactNode; msgs: ReadyMessage[]; parentPhone: string }) => (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 mb-2">
        <span className="text-teal-600">{icon}</span>
        <span>{title}</span>
      </div>
      {msgs.length === 0 ? (
        <p className="text-[11px] text-slate-400">لا يوجد ما يُرسل حالياً.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {msgs.map((m, i) => (
            <a
              key={i}
              href={waLink(parentPhone, m.message)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${toneClass[m.tone]}`}
            >
              <Send className="w-3 h-3 shrink-0" />
              <span className="max-w-[11rem] truncate">{m.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">واتساب ولي الأمر</h1>
          <p className="text-xs text-slate-500 mt-1">
            كل طالب جهّزنا له أزرار رسائل جاهزة حسب حالته — اضغط الزر وتفتح محادثة ولي الأمر والرسالة جاهزة للإرسال.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري التحديث...' : 'تحديث من السحابة'}</span>
          </button>
          <div className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3.5 py-2 rounded-xl">
            الطلاب: <span className="font-black text-base">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الطالب أو رقم ولي الأمر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none"
          >
            <option value="all">جميع الصفوف</option>
            <option value="first_secondary_general">الأول الثانوي (عام)</option>
            <option value="first_secondary_bac">الأول الثانوي (بكالوريا)</option>
            <option value="second_secondary_general">الثاني الثانوي (عام)</option>
            <option value="second_secondary_bac">الثاني الثانوي (بكالوريا)</option>
            <option value="first_secondary_azhari">الأول الثانوي (أزهر)</option>
            <option value="second_secondary_azhari">الثاني الثانوي (أزهر)</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyWithParent}
              onChange={(e) => setOnlyWithParent(e.target.checked)}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            فقط من لديهم رقم ولي أمر
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 py-16 text-center text-slate-500 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800">لا يوجد طلاب مطابقين</p>
          <p className="text-xs">غيّر الفلاتر أو فعّل مزامنة البيانات من السحابة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const msgs = buildMessages(s);
            const hasAll = msgs.lessons.length + msgs.exams.length + msgs.assignments.length;
            const hasParent = s.parentPhone.trim().length > 0;
            const daysRemaining = getDaysRemaining(s.subscription.expiresAt);
            return (
              <div key={s.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                        {s.name.trim().charAt(0) || 'ط'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 text-sm truncate">{s.name}</h3>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-0.5">
                          <GraduationCap className="w-3 h-3 text-teal-600" />
                          <span>{GRADE_LABELS[s.grade]}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {s.subscription.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> مفعّل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> غير مفعّل
                        </span>
                      )}
                      {s.subscription.isActive && daysRemaining !== null && (
                        <span className="text-[10px] text-emerald-700 font-bold">متبقي {daysRemaining} يوم</span>
                      )}
                    </div>
                  </div>

                  {hasParent ? (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-fit">
                      <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span dir="ltr">{formatIntlDisplay(s.parentPhone)}</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      لا يوجد رقم ولي أمر لهذا الطالب — لن يتم الإرسال.
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 space-y-4 flex-1">
                  <SectionBlock title="المحاضرات" icon={<Video className="w-3.5 h-3.5" />} msgs={msgs.lessons} parentPhone={s.parentPhone} />
                  <SectionBlock title="الامتحانات" icon={<HelpCircle className="w-3.5 h-3.5" />} msgs={msgs.exams} parentPhone={s.parentPhone} />
                  <SectionBlock title="الواجبات" icon={<ClipboardList className="w-3.5 h-3.5" />} msgs={msgs.assignments} parentPhone={s.parentPhone} />
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                  {!hasParent ? (
                    <p className="text-[11px] text-red-600">
                      اطلب من الطالب إضافة رقم ولي الأمر من ملفه الشخصي لتفعيل هذه الميزة.
                    </p>
                  ) : hasAll === 0 ? (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      لا توجد أحداث حالياً لهذا الطالب — زر للرسالة العامة أدناه.
                      <a
                        href={waLink(s.parentPhone, `${greet(s)} محتاجين متابعتكم مع الطالب خلال الفترة الجاية، وأي استفسار تفضلوا بكتابته وأحنا موجودين.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold"
                      >
                        <Send className="w-3 h-3" /> رسالة عامة
                      </a>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      الرسالة تُرسل من رقم الواتساب الخاص بجهازك — اضغط الزر وستفتح محادثة ولي الأمر جاهزة للإرسال.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}