"use client";

import React, { useState, useEffect } from "react";
import { Student, LessonNote, VideoChapter } from "@/lib/types";
import { getLessonNotes, saveLessonNote, deleteLessonNote } from "@/lib/storage";
import {
  FileEdit,
  Plus,
  Trash2,
  Clock,
  Play,
  Sparkles,
  BookOpen,
  Bookmark,
  ChevronRight,
} from "lucide-react";

interface LessonNotesSectionProps {
  student: Student;
  lessonId: string;
  chapters?: VideoChapter[];
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function LessonNotesSection({
  student,
  lessonId,
  chapters = [],
}: LessonNotesSectionProps) {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);

  const loadNotes = () => {
    setNotes(getLessonNotes(student.id, lessonId));
  };

  useEffect(() => {
    loadNotes();
  }, [student.id, lessonId]);

  const handleStartAddNote = () => {
    const time = typeof (window as any).adelGetVideoTime === "function"
      ? (window as any).adelGetVideoTime()
      : 0;
    setCurrentTime(time);
    setIsAdding(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    saveLessonNote({
      studentId: student.id,
      lessonId,
      text: newNoteText.trim(),
      timeSeconds: currentTime,
    });

    setNewNoteText("");
    setIsAdding(false);
    loadNotes();
  };

  const handleDelete = (noteId: string) => {
    deleteLessonNote(noteId);
    loadNotes();
  };

  const handleSeek = (seconds: number) => {
    window.dispatchEvent(
      new CustomEvent("adel-video-seek", { detail: { time: seconds } })
    );
  };

  return (
    <div className="space-y-6 mt-8">
      {/* ── فصول المحاضرة (Video Chapters) ── */}
      {chapters && chapters.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              فصول ومحطات المحاضرة
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => handleSeek(ch.timeSeconds)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:border-teal-500/50 group"
              >
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  {formatTime(ch.timeSeconds)}
                </span>
                <span>{ch.title}</span>
                <Play className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ملاحظات الطالب الذكية (Smart Notes) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
                ملاحظاتي الذكية على المحاضرة
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سجّل أي فكرة أو قانون عند الدقيقة الحالية واضغط عليه للرجوع لنفس اللحظة لاحقاً.
              </p>
            </div>
          </div>

          {!isAdding && (
            <button
              onClick={handleStartAddNote}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black transition-all shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة ملاحظة عند اللحظة الحالية</span>
            </button>
          )}
        </div>

        {/* نموذج كتابة الملاحظة */}
        {isAdding && (
          <form
            onSubmit={handleSaveNote}
            className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>التوقيت المسجل:</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-700/60 font-black">
                  {formatTime(currentTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                إلغاء
              </button>
            </div>

            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="اكتب ملاحظتك هنا (مثلاً: قانون الدائرة المغلقة، أو فكرة المسألة)..."
              rows={2}
              autoFocus
              className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition-colors disabled:opacity-50"
              >
                حفظ الملاحظة
              </button>
            </div>
          </form>
        )}

        {/* قائمة الملاحظات */}
        {notes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            لا توجد ملاحظات محفوظة لهذه المحاضرة بعد. اضغط على زر الإضافة لتسجيل أول ملاحظة!
          </div>
        ) : (
          <div className="space-y-2.5">
            {notes.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleSeek(n.timeSeconds)}
                    title="اضغط للقفز إلى هذه اللحظة في الفيديو"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-600 text-teal-800 dark:text-teal-300 hover:text-white border border-teal-200 dark:border-teal-800/60 font-mono text-xs font-bold transition-all shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{formatTime(n.timeSeconds)}</span>
                  </button>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5 break-words">
                    {n.text}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  title="حذف الملاحظة"
                  className="p-1 text-slate-400 hover:text-red-500 opacity-60 hover:opacity-100 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
