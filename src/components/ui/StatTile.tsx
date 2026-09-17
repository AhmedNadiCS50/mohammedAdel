"use client";

import React, { type ReactNode } from 'react';

interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: 'emerald' | 'amber' | 'teal' | 'slate';
  hint?: string;
}

const ACCENTS: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  amber: 'bg-amber-50 text-amber-800 border-amber-100',
  teal: 'bg-teal-50 text-teal-800 border-teal-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function StatTile({ label, value, icon, accent = 'emerald', hint }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm flex items-center gap-3 min-w-0">
      {icon && (
        <span className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${ACCENTS[accent]}`}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm sm:text-base font-black text-slate-800 truncate leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 font-bold truncate">{label}</p>
        {hint && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  );
}