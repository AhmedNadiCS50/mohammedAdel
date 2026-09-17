"use client";

import React from 'react';

type Cols = 1 | 2 | 3 | 4;

const GRID_CLASSES: Record<Cols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

interface ResponsiveGridProps {
  cols?: Cols;
  className?: string;
  children: React.ReactNode;
}

export default function ResponsiveGrid({ cols = 2, className = '', children }: ResponsiveGridProps) {
  return <div className={`grid ${GRID_CLASSES[cols]} gap-3 sm:gap-4 ${className}`}>{children}</div>;
}