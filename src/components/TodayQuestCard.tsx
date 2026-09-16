"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { getLessonProgress, getExamSubmissions, getAssignmentSubmissions } from '@/lib/storage';
import { Student, Lesson, Exam, Assignment } from '@/lib/types';
import { Target, Video, HelpCircle, ClipboardList, PartyPopper, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TodayQuestCardProps {
  student: Student;
  lessons: Lesson[];
  exams: Exam[];
  assignments: Assignment[];
}

export default function TodayQuestCard({ student, lessons, exams, assignments }: TodayQuestCardProps) {
  const quest = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
    for (const l of sorted) {
      const p = getLessonProgress(student.id, l.id);
      if (!p || (!p.completed && (p.watchPercentage ?? 0) < 90)) {
        return { type: 'lesson' as const, title: l.title, href: `/dashboard/lessons/${l.id}`, note: 'شاهد المحاضرة لتفك التالية 🎬' };
      }
    }
    for (const e of exams) {
      if (getExamSubmissions(student.id, e.id).length === 0) {
        return { type: 'exam' as const, title: e.title, href: `/dashboard/exams/${e.id}`, note: 'حل الامتحان للتدريب على الشكل النهائي' };
      }
    }
    const submitted = new Set(getAssignmentSubmissions(undefined, student.id).map((s) => s.assignmentId));
    for (const a of assignments) {
      if (!submitted.has(a.id)) {
        return { type: 'assignment' as const, title: a.title, href: '/dashboard/assignments', note: 'سلّم الواجب في وقته' };
      }
    }
    return null;
  }, [student, lessons, exams, assignments]);

  const iconOf = {
    lesson: <Video className="w-5 h-5" />,
    exam: <HelpCircle className="w-5 h-5" />,
    assignment: <ClipboardList className="w-5 h-5" />,
  } as const;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 text-[11px] font-black text-emerald-800 mb-3">
        <Target className="w-4 h-4 text-amber-500" />
        <span>مهمتك لليوم 🎯</span>
      </div>

      {quest ? (
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              {iconOf[quest.type]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-700">{quest.note}</p>
              <h3 className="text-sm font-black text-gray-900 truncate">{quest.title}</h3>
            </div>
          </div>
          <Link
            href={quest.href}
            className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-black text-xs transition-all hover:opacity-90 shadow-sm"
            style={{ background: '#1B4332' }}
          >
            نفّذها الآن
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <PartyPopper className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> كل مهامك خلصت!
            </p>
            <p className="text-xs text-gray-500 mt-0.5">راجع محاضرة أو جرّب حل امتحان تاني للمزيد من النقاط.</p>
          </div>
        </div>
      )}
    </div>
  );
}