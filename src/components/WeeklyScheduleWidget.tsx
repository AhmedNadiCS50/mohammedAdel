"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Lesson, Exam, Assignment } from '@/lib/types';
import { CalendarDays, Video, HelpCircle, ClipboardList, ArrowLeft } from 'lucide-react';

interface WeeklyScheduleWidgetProps {
  lessons: Lesson[];
  exams: Exam[];
  assignments: Assignment[];
}

const WEEK_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

type Item = {
  key: string;
  kind: 'lesson' | 'exam' | 'assignment';
  title: string;
  date: Date;
  href: string;
};

const MONTHS_AR: Record<string, string> = {
  '1': 'يناير', '2': 'فبراير', '3': 'مارس', '4': 'أبريل', '5': 'مايو', '6': 'يونيو',
  '7': 'يوليو', '8': 'أغسطس', '9': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
};

export default function WeeklyScheduleWidget({ lessons, exams, assignments }: WeeklyScheduleWidgetProps) {
  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    lessons.forEach((l) => {
      const d = l.createdAt ? new Date(l.createdAt) : null;
      if (d) list.push({ key: `l-${l.id}`, kind: 'lesson', title: l.title, date: d, href: `/dashboard/lessons/${l.id}` });
    });
    exams.forEach((e) => {
      const d = e.createdAt ? new Date(e.createdAt) : null;
      if (d) list.push({ key: `e-${e.id}`, kind: 'exam', title: e.title, date: d, href: `/dashboard/exams/${e.id}` });
    });
    assignments.forEach((a) => {
      const d = a.dueDate ? new Date(a.dueDate) : a.createdAt ? new Date(a.createdAt) : null;
      if (d) list.push({ key: `a-${a.id}`, kind: 'assignment', title: a.title, date: d, href: '/dashboard/assignments' });
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return list
      .filter((i) => i.date >= todayStart && i.date <= weekEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  }, [lessons, exams, assignments]);

  const meta = {
    lesson: { label: 'محاضرة تنزل', icon: <Video className="w-3.5 h-3.5" />, cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    exam: { label: 'امتحان متاح', icon: <HelpCircle className="w-3.5 h-3.5" />, cls: 'bg-amber-50 border-amber-200 text-amber-800' },
    assignment: { label: 'تسليم واجب', icon: <ClipboardList className="w-3.5 h-3.5" />, cls: 'bg-teal-50 border-teal-200 text-teal-800' },
  } as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 mb-4">
        <CalendarDays className="w-4 h-4 text-teal-600" />
        <span>أسبوعك القادم 📅</span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 leading-relaxed">
          لا مواعيد جديدة في الأسبوع ده حالياً — تابع المحاضرات المتاحة من القائمة تحت، وهنحدّث الجدول أول ما المدرس ينزّل الجديد.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((i) => {
            const m = meta[i.kind];
            const day = i.date.getDate();
            return (
              <Link
                key={i.key}
                href={i.href}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-colors"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-800 leading-none">{day}</span>
                  <span className="text-[8px] text-slate-500 mt-0.5">{MONTHS_AR[String(i.date.getMonth() + 1)]?.slice(0, 4) || ''}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${m.cls}`}>
                    {m.icon} {m.label}
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate mt-1">{i.title}</p>
                </div>
                <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-teal-700 font-bold">
                  {WEEK_DAYS[i.date.getDay()]} <ArrowLeft className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}