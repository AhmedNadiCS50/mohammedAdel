"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('app-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('light-mode', saved === 'light');
      document.documentElement.classList.toggle('dark-mode', saved === 'dark');
    } else {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('app-theme', next);
    document.documentElement.classList.toggle('light-mode', next === 'light');
    document.documentElement.classList.toggle('dark-mode', next === 'dark');
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: next }));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="تبديل المظهر"
      className="p-2 rounded-xl transition-all duration-300 border flex items-center justify-center"
      style={{
        background: theme === 'dark' ? 'rgba(0, 245, 160, 0.08)' : 'rgba(6, 78, 59, 0.08)',
        borderColor: theme === 'dark' ? 'rgba(0, 245, 160, 0.25)' : 'rgba(6, 78, 59, 0.2)',
        color: theme === 'dark' ? '#00f5a0' : '#064e3b',
      }}
      title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-800" />
      )}
    </button>
  );
}
