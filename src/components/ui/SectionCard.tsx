"use client";

import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
}

export default function SectionCard({ children, className = '', as = 'div' }: SectionCardProps) {
  const Tag = as;
  return (
    <Tag className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm ${className}`}>
      {children}
    </Tag>
  );
}