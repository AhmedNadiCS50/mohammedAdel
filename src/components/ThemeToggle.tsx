"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface ThemeToggleProps {
  variant?: 'default' | 'onDark';
  className?: string;
}

export default function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const onDark = variant === 'onDark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      onClick={toggleTheme}
      className={`relative flex items-center justify-between w-14 h-7 rounded-full p-1 shrink-0 transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
        onDark
          ? 'bg-white/10 border border-white/20 hover:bg-white/20'
          : isDark
            ? 'bg-slate-800 border border-slate-600/50 hover:bg-slate-700'
            : 'bg-emerald-100 border border-emerald-300/60 hover:bg-emerald-50'
      } ${className}`}
    >
      <span className={`relative z-10 flex items-center justify-center w-5 h-5 ${isDark ? 'text-slate-500' : 'text-amber-500'}`}>
        <Sun className="w-4 h-4" />
      </span>
      <span className={`relative z-10 flex items-center justify-center w-5 h-5 ${isDark ? 'text-amber-300' : 'text-slate-400'}`}>
        <Moon className="w-4 h-4" />
      </span>
      <span
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
          onDark ? 'shadow-black/40' : 'shadow-emerald-900/20'
        } ${isDark ? 'left-1' : 'right-1'}`}
      />
    </button>
  );
}