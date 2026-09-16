"use client";

import React from "react";
import { Student } from "@/lib/types";
import {
  getAllProgressForStudent,
  getExamSubmissions,
  getAssignmentSubmissions,
  getLessonNotes,
  getLessons,
} from "@/lib/storage";
import {
  Award,
  Zap,
  Target,
  ShieldCheck,
  BookmarkCheck,
  Lock,
  Sparkles,
} from "lucide-react";

interface StudentBadgesProps {
  student: Student;
}

interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  earned: boolean;
  progressText: string;
  accent: string;
}

export default function StudentBadges({ student }: StudentBadgesProps) {
  const lessons = getLessons(student.grade);
  const progressList = getAllProgressForStudent(student.id);
  const completedLessons = progressList.filter((p) => p.completed).length;

  const examSubs = getExamSubmissions(student.id);
  const perfectExams = examSubs.filter((s) => s.percentage >= 100).length;

  const assignSubs = getAssignmentSubmissions(student.id);

  // Check days registered or active
  const createdDate = student.createdAt ? new Date(student.createdAt) : new Date();
  const daysActive = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  const badges: Badge[] = [
    {
      id: "master",
      title: "وحش التكنولوجيا",
      desc: "أكمل جميع محاضرات المنهج بنسبة 100%",
      icon: <Award className="w-5 h-5" />,
      earned: lessons.length > 0 && completedLessons >= lessons.length,
      progressText: `${completedLessons} / ${lessons.length} محاضرة`,
      accent: "from-amber-500 to-yellow-600 text-amber-500",
    },
    {
      id: "sniper",
      title: "قناص الدرجات",
      desc: "حصل على الدرجة النهائية 100% في أحد الامتحانات",
      icon: <Target className="w-5 h-5" />,
      earned: perfectExams > 0,
      progressText: perfectExams > 0 ? "تم تحقيق العلامة الكاملة 🎯" : "احصل على 100% في امتحان",
      accent: "from-emerald-500 to-teal-600 text-emerald-500",
    },
    {
      id: "starter",
      title: "المبادر السريع",
      desc: "سلّم أول تطبيق وواجب عملي على المنصة",
      icon: <Zap className="w-5 h-5" />,
      earned: assignSubs.length > 0,
      progressText: assignSubs.length > 0 ? `سلّم ${assignSubs.length} واجبات` : "سلّم أول واجب لفتحه",
      accent: "from-sky-500 to-blue-600 text-sky-500",
    },
    {
      id: "committed",
      title: "طالب ملتزم",
      desc: "عضوية فعّالة وحساب نشط في المنصة",
      icon: <ShieldCheck className="w-5 h-5" />,
      earned: student.subscription.isActive,
      progressText: student.subscription.isActive ? "اشتراكك مفعّل بنجاح" : "فعّل اشتراكك لفتحه",
      accent: "from-purple-500 to-indigo-600 text-purple-500",
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              أوسمة وإنجازات الطالب
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              شارات تقديرية تُمنح تلقائياً عند تفوقك والتزامك بالمنهج.
            </p>
          </div>
        </div>
        <div className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {earnedCount} من {badges.length} مكتسبة
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`relative p-4 rounded-2xl border transition-all ${
              b.earned
                ? "bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/90 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                : "bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  b.earned
                    ? "bg-gradient-to-br " + b.accent + " text-white shadow-sm"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {b.icon}
              </div>
              {b.earned ? (
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  مكتمل ✓
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> قيد الإنجاز
                </span>
              )}
            </div>

            <div className="mt-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {b.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {b.desc}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {b.progressText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
