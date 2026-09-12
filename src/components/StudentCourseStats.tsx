"use client";

import React from 'react';
import Link from 'next/link';
import { Student, Lesson, Exam } from '@/lib/types';
import { getLessonProgress, getExamSubmissions } from '@/lib/storage';

interface StudentCourseStatsProps {
  student: Student;
  lessons: Lesson[];
  exams: Exam[];
  onSelectTab?: (tab: 'lessons' | 'exams') => void;
}

export default function StudentCourseStats({
  student,
  lessons,
  exams,
  onSelectTab,
}: StudentCourseStatsProps) {
  // 1. VIDEOS STATS (Only for student's grade)
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) => {
    const progress = getLessonProgress(student.id, lesson.id);
    return progress?.completed || (progress && progress.watchPercentage >= 90);
  });
  const completedVideosCount = completedLessons.length;
  const videoPercent = totalLessons > 0 ? Math.min(100, Math.round((completedVideosCount / totalLessons) * 100)) : 0;

  // 2. EXAMS STATS (Only for student's grade)
  const totalExams = exams.length;
  const examsTaken = exams.filter((exam) => {
    const subs = getExamSubmissions(student.id, exam.id);
    return subs.length > 0;
  });
  const examsTakenCount = examsTaken.length;
  const examPercent = totalExams > 0 ? Math.min(100, Math.round((examsTakenCount / totalExams) * 100)) : 0;

  // 3. AVERAGE EXAM SCORES & WEEKLY PERFORMANCE
  const allSubmissions = exams.flatMap((exam) => getExamSubmissions(student.id, exam.id));
  const validScores = allSubmissions.map((s) => s.percentage).filter((p): p is number => typeof p === 'number');
  const averageScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  // Weekly points mapping (Saturday to Friday)
  // Day order: Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4), Friday (5)
  const dayLabels = ['س', 'م', 'ث', 'ر', 'خ', 'ج', 'س'];
  const dayIndices = [6, 0, 1, 2, 3, 4, 5];

  // Map submissions to day of week
  const dayScores: number[] = dayIndices.map((dayIdx) => {
    const subsOnDay = allSubmissions.filter((s) => {
      const d = new Date(s.submittedAt);
      return d.getDay() === dayIdx;
    });
    if (subsOnDay.length === 0) return 0;
    const avg = subsOnDay.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / subsOnDay.length;
    return Math.round(avg);
  });

  // If student has no activity yet, show gentle baseline or preview curve if scores exist
  const maxDayScore = Math.max(...dayScores);
  const peakIndex = maxDayScore > 0 ? dayScores.indexOf(maxDayScore) : 2;

  // Build smooth SVG curve coordinates
  const svgWidth = 140;
  const svgHeight = 65;
  const paddingX = 12;
  const usableWidth = svgWidth - paddingX * 2;
  const stepX = usableWidth / (dayLabels.length - 1);

  const points = dayScores.map((score, i) => {
    const x = paddingX + i * stepX;
    // Map score 0-100 to y (55 to 10)
    const normalizedScore = score > 0 ? score : (maxDayScore === 0 && i === 2 ? 0 : 0);
    const y = 55 - (normalizedScore / 100) * 45;
    return { x, y, score };
  });

  // Construct SVG Path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  // Performance cheering badge text
  let cheerBadge = 'يلا ابدأ!';
  if (averageScore >= 85) cheerBadge = 'عاش يا بطل!!';
  else if (averageScore >= 60) cheerBadge = 'عاش!!';
  else if (averageScore > 0) cheerBadge = 'استمر وشد حيلك!';

  return (
    <div className="w-full space-y-3">
      {/* Header with Title and "اعرض الكل" */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>احصائيات كورساتك</span>
        </h2>
        {onSelectTab && (
          <button
            onClick={() => onSelectTab('lessons')}
            className="text-xs sm:text-sm font-bold text-gray-500 hover:text-green-800 transition-colors flex items-center gap-1 group"
          >
            <span>اعرض الكل</span>
            <span className="transition-transform group-hover:-translate-x-1">←</span>
          </button>
        )}
      </div>

      {/* 3 Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">

        {/* 1. CARD RIGHT: عدد الفيديوهات اللي شوفتها */}
        <div
          onClick={() => onSelectTab && onSelectTab('lessons')}
          className="bg-[#0e1626] border border-gray-800/80 hover:border-sky-500/40 rounded-2xl p-5 sm:p-6 text-white shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-between relative overflow-hidden"
        >
          {/* Right Text Content (in RTL this appears on right) */}
          <div className="space-y-1.5 z-10">
            <span className="text-[11px] font-semibold text-gray-400 block">يلا ابدأ</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-snug">
              عدد الفيديوهات اللي شوفتها
            </h3>
            <p className="text-xs text-gray-400 font-medium">تقدمك في الكورسات</p>
            <div className="pt-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-gray-300 tracking-wider">
                {totalLessons} / {completedVideosCount}
              </span>
            </div>
          </div>

          {/* Left Liquid Circular Progress */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#080d18] border-2 border-sky-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
            {/* Liquid Fill Level */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-sky-500 transition-all duration-700 ease-out"
              style={{ height: `${videoPercent}%` }}
            >
              {/* Wave Curvature Top */}
              {videoPercent > 0 && videoPercent < 100 && (
                <div
                  className="absolute -top-2 left-[-20%] right-[-20%] h-4 bg-sky-400/90 rounded-full blur-[0.5px]"
                  style={{
                    transform: 'scaleX(1.3)',
                  }}
                />
              )}
            </div>

            {/* Percentage Text */}
            <span className="relative z-10 text-lg sm:text-2xl font-black text-white drop-shadow-md tracking-wider">
              {videoPercent}%
            </span>
          </div>
        </div>

        {/* 2. CARD MIDDLE: عدد الإختبارات اللي خلصتها */}
        <div
          onClick={() => onSelectTab && onSelectTab('exams')}
          className="bg-[#0e1626] border border-gray-800/80 hover:border-sky-500/40 rounded-2xl p-5 sm:p-6 text-white shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-between relative overflow-hidden"
        >
          {/* Right Text Content */}
          <div className="space-y-1.5 z-10">
            <span className="text-[11px] font-semibold text-gray-400 block">يلا ابدأ</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-snug">
              عدد الإختبارات اللي خلصتها
            </h3>
            <p className="text-xs text-gray-400 font-medium">تقدمك في الكورسات</p>
            <div className="pt-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-gray-300 tracking-wider">
                {totalExams} / {examsTakenCount}
              </span>
            </div>
          </div>

          {/* Left Liquid Circular Progress */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#080d18] border-2 border-sky-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
            {/* Liquid Fill Level */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-sky-500 transition-all duration-700 ease-out"
              style={{ height: `${examPercent}%` }}
            >
              {/* Wave Curvature Top */}
              {examPercent > 0 && examPercent < 100 && (
                <div
                  className="absolute -top-2 left-[-20%] right-[-20%] h-4 bg-sky-400/90 rounded-full blur-[0.5px]"
                  style={{
                    transform: 'scaleX(1.3)',
                  }}
                />
              )}
            </div>

            {/* Percentage Text */}
            <span className="relative z-10 text-lg sm:text-2xl font-black text-white drop-shadow-md tracking-wider">
              {examPercent}%
            </span>
          </div>
        </div>

        {/* 3. CARD LEFT: متوسط النتائج اللي جبتها */}
        <div className="bg-[#0e1626] border border-gray-800/80 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
          {/* Mini Line Curve Chart (Left side in LTR, Right side in visual layout) */}
          <div className="flex items-center gap-2">
            {/* Y-Axis Ticks */}
            <div className="flex flex-col justify-between h-14 text-[9px] font-mono text-gray-500 select-none text-right">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* SVG Spline Curve & X-Axis */}
            <div className="flex flex-col items-center">
              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="overflow-visible"
              >
                {/* Baseline grid lines */}
                <line x1="8" y1="55" x2={svgWidth - 8} y2="55" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="8" y1="32" x2={svgWidth - 8} y2="32" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,2" strokeWidth="1" />
                <line x1="8" y1="10" x2={svgWidth - 8} y2="10" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,2" strokeWidth="1" />

                {/* Spline Path */}
                {maxDayScore > 0 ? (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  /* Baseline Line when 0 */
                  <line
                    x1="12"
                    y1="55"
                    x2={svgWidth - 12}
                    y2="55"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}

                {/* Points on the curve */}
                {points.map((pt, idx) => {
                  const isPeak = idx === peakIndex && pt.score > 0;
                  return (
                    <g key={idx}>
                      {isPeak && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill="#22c55e"
                          opacity="0.35"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isPeak ? '4.5' : '3'}
                        fill={isPeak ? '#22c55e' : '#38bdf8'}
                        stroke="#ffffff"
                        strokeWidth={isPeak ? '1.5' : '1'}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis Days: س  م  ث  ر  خ  ج  س */}
              <div className="flex justify-between w-full px-2 mt-1 text-[10px] text-gray-400 font-bold select-none">
                {dayLabels.map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Text Content & Average Percentage */}
          <div className="text-left space-y-1 z-10 mr-2">
            <span className="text-[11px] font-bold text-gray-300 block">{cheerBadge}</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-snug">
              متوسط النتائج اللي جبتها
            </h3>
            <div className="pt-1">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {averageScore}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
