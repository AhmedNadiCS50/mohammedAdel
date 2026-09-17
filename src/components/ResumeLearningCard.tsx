"use client";

import React from 'react';
import Link from 'next/link';
import { getLastWatchedLesson } from '@/lib/storage';
import { Student } from '@/lib/types';
import { Play, Clock } from 'lucide-react';

function mmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function ResumeLearningCard({ student }: { student: Student }) {
  const target = getLastWatchedLesson(student.id);
  if (!target) return null;
  const { lesson, progress } = target;
  const percentage = progress.watchPercentage || 0;
  const remainingSec = Math.max(0, (progress.durationSeconds || 0) - (progress.watchedSeconds || 0));
  const remainingMin = Math.max(1, Math.ceil(remainingSec / 60));

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Play className="w-6 h-6 fill-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-emerald-700 mb-0.5">استكمل من حيث وقفت 🎬</p>
          <h3 className="text-sm font-black text-gray-900 truncate">{lesson.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            <Clock className="w-3.5 h-3.5 inline-block align-[-2px] text-amber-500 ml-1" />
            <span>فضل حوالي <strong className="text-gray-700">{remainingMin} دقيقة</strong></span>
            <span className="text-gray-400 mx-1">·</span>
            <span>الإنجاز: <strong className="text-emerald-700">{percentage}%</strong></span>
          </p>
          <div className="mt-2 w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-gold-500 rounded-full" style={{ width: `${Math.max(percentage, 2)}%` }} />
          </div>
        </div>
      </div>

      <Link
        href={`/dashboard/lessons/${lesson.id}`}
        className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-black text-xs transition-all hover:opacity-90 shadow-sm"
        style={{ background: '#1B4332' }}
      >
        <Play className="w-3.5 h-3.5 fill-white" />
        متابعة المشاهدة من الدقيقة {mmss(progress.watchedSeconds)} 🎬
      </Link>
    </div>
  );
}