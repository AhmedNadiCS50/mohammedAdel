"use client";

import React, { type ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({ title, subtitle, icon, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="w-9 h-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-black text-slate-800 leading-tight truncate">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}