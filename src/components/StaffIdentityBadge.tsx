"use client";

import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

interface Props {
  role: 'teacher' | 'moderator';
  name?: string;
  teacherLabel?: string;
  compact?: boolean;
}

/**
 * شارة تُعرّف كاتب المنشور/الرد من فريق الإشراف (المدرس أو المشرف).
 * رد المدرس يعرض "إجابة المدرس"، بينما رد المشرف يعرض شارة متحركة مميزة
 * "مشرف المنصة" مع اسمه بارزاً حتى يعرف الطالب من رد عليه.
 */
export default function StaffIdentityBadge({ role, name, teacherLabel = 'إجابة المدرس', compact = false }: Props) {
  if (role === 'moderator') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex h-2 w-2 shrink-0 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-l from-emerald-700 to-teal-600 text-white text-[11px] font-black shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          مشرف المنصة
        </span>
        {!compact && <span className="text-[13px] font-black text-emerald-900">{name}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-black text-green-800">
      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
      {teacherLabel}
    </span>
  );
}