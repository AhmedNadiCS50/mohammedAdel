"use client";

import React, { useState, useEffect } from 'react';
import { getLeaderboardLocal, computeLeaderboard, LeaderboardEntry } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getStudentsFromFirestore,
  getSubmissionsFromFirestore,
  getAssignmentSubmissionsFromFirestore,
  getAllProgressForStudentFromFirestore,
} from '@/lib/firestoreService';
import { Student, GradeLevel, LessonProgress, ExamSubmission, AssignmentSubmission } from '@/lib/types';
import { Trophy, Crown, Medal, Flame, Loader2 } from 'lucide-react';

interface ClassLeaderboardProps {
  student: Student;
}

const rankMeta = (rank: number) => {
  if (rank === 1) return { icon: <Crown className="w-4 h-4 text-amber-600" />, cls: 'bg-amber-100 border-amber-300 text-amber-900' };
  if (rank === 2) return { icon: <Medal className="w-4 h-4 text-slate-500" />, cls: 'bg-slate-100 border-slate-300 text-slate-800' };
  if (rank === 3) return { icon: <Medal className="w-4 h-4 text-emerald-600" />, cls: 'bg-emerald-100 border-emerald-300 text-emerald-900' };
  return { icon: null, cls: 'bg-slate-50 border-slate-200 text-slate-600' };
};

export default function ClassLeaderboard({ student }: ClassLeaderboardProps) {
  const grade = student.grade as GradeLevel;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const local = getLeaderboardLocal(grade);

    const apply = (list: LeaderboardEntry[]) => {
      if (cancelled) return;
      setEntries(list);
      setLoading(false);
    };

    if (!isFirebaseConfigured()) {
      apply(local);
      return;
    }

    (async () => {
      try {
        const [remoteStudents, examSubs, assignSubs] = await Promise.all([
          getStudentsFromFirestore(),
          getSubmissionsFromFirestore(),
          getAssignmentSubmissionsFromFirestore(),
        ]);

        const progressMap: Record<string, LessonProgress[]> = {};
        await Promise.all(
          remoteStudents.map(async (st) => {
            try {
              progressMap[st.id] = await getAllProgressForStudentFromFirestore(st.id);
            } catch {
              progressMap[st.id] = [];
            }
          })
        );

        const subsByStudent: Record<string, ExamSubmission[]> = {};
        examSubs.forEach((su) => {(subsByStudent[su.studentId] = subsByStudent[su.studentId] || []).push(su);});
        const assignByStudent: Record<string, AssignmentSubmission[]> = {};
        assignSubs.forEach((su) => {(assignByStudent[su.studentId] = assignByStudent[su.studentId] || []).push(su);});

        const cloud = computeLeaderboard(remoteStudents, grade, progressMap, subsByStudent, assignByStudent);
        if (cancelled) return;
        setEntries(cloud.length > 0 ? cloud : local);
      } catch {
        if (!cancelled) setEntries(local);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [grade, student.id]);

  const me = entries.find((e) => e.studentId === student.id);
  const top10 = entries.slice(0, 10);
  const pointsToTop10 = me && me.rank > 10 && top10.length > 0 ? Math.max(0, top10[top10.length - 1].points - me.points) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 mb-4">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span>لوحة شرف الصف 🏆</span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />}
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-slate-400">لا توجد بيانات كافية بعد — أول طالب يبدأ التعلم علمك يظهر هنا.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {top10.map((e) => {
              const meta = rankMeta(e.rank);
              const isMe = e.studentId === student.id;
              return (
                <div
                  key={e.studentId}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isMe ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300' : meta.cls
                  }`}
                >
                  <span className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center text-[11px] font-black ${meta.cls}`}>
                    {meta.icon ? <span className="flex items-center">{meta.icon}</span> : e.rank}
                  </span>
                  <span className={`truncate font-bold ${isMe ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {e.name}
                    {isMe && <span className="mr-1 text-[10px] text-emerald-700 font-black">(أنت)</span>}
                  </span>
                  <span className="mr-auto shrink-0 flex items-center gap-1 font-black text-slate-800">
                    {e.points}
                    <span className="text-[9px] text-slate-400 font-bold">نقطة</span>
                  </span>
                </div>
              );
            })}
          </div>

          {me && me.rank > 10 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                ترتيبك الحالي رقم {me.rank} — لسه {pointsToTop10} نقطة وبتخش التوب 10. كمّل المحاضرات والامتحانات! 💪
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}