"use client";

import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { Student } from '@/lib/types';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const WEEK_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function StudyStreakBanner({ student }: { student: Student }) {
  const streak = student.streak;
  const current = streak?.currentStreak || 0;
  const best = streak?.bestStreak || 0;
  const activeDays = streak?.activeDays || [];
  const today = dateKey(new Date());

  const days: { label: string; isToday: boolean; active: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: WEEK_DAYS[d.getDay()],
      isToday: dateKey(d) === today,
      active: activeDays.includes(dateKey(d)),
    });
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center shrink-0">
          <Flame className="w-7 h-7 text-amber-500" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-gray-900">
            {current > 0 ? (
              <>أنت ملتزم لليوم الـ <span className="text-amber-600">{current}</span> على التوالي! حافظ على الشعلة 🔥</>
            ) : (
              <>ابدأ أول يوم التزام النهاردة 🔥</>
            )}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {current > 0
              ? 'شاهد محاضرة أو حل امتحان يومياً عشان الشعلة تفضل مضيئة.'
              : 'أكمل محاضرة واحدة حالياً ورجعلنا بكرة — خليها عادة!'}
            {best > 0 && <span className="font-bold text-gray-700">أفضل ستريك: {best} 🔥</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[13px] font-black transition-all ${
                d.isToday
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-sm'
                  : d.active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {d.isToday ? <Flame className="w-4 h-4" /> : d.active ? '✓' : '·'}
            </div>
            <span className="text-[9px] font-bold text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}