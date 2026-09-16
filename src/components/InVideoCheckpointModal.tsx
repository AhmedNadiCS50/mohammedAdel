"use client";

import React, { useState } from 'react';
import { VideoCheckpoint } from '@/lib/types';
import { CheckCircle2, XCircle, RotateCcw, SkipForward, HelpCircle } from 'lucide-react';

interface InVideoCheckpointModalProps {
  checkpoint: VideoCheckpoint;
  onCorrect: () => void;
  onReplay: (secondsBack: number) => void;
  onRetry?: () => void;
}

export default function InVideoCheckpointModal({
  checkpoint,
  onCorrect,
  onReplay,
  onRetry,
}: InVideoCheckpointModalProps) {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const answered = pickedIndex !== null;
  const isCorrect = answered && pickedIndex === checkpoint.correctIndex;

  const handleRetry = () => {
    setPickedIndex(null);
    if (onRetry) onRetry();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>توقف سريع أثناء الشرح — أجب لاستكمال المحاضرة</span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
          {checkpoint.question}
        </h3>

        <div className="space-y-2">
          {checkpoint.options.map((opt, i) => {
            let cls = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
            if (answered) {
              if (i === checkpoint.correctIndex) {
                cls = 'bg-emerald-50 hover:bg-emerald-50 border-emerald-300 text-emerald-900';
              } else if (i === pickedIndex) {
                cls = 'bg-red-50 hover:bg-red-50 border-red-300 text-red-900';
              } else {
                cls = 'bg-slate-50 border-slate-200 text-slate-400';
              }
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => setPickedIndex(i)}
                className={`w-full text-right flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-colors ${cls}`}
              >
                <span className="w-6 h-6 shrink-0 rounded-full border border-slate-300 bg-white flex items-center justify-center text-[11px] font-black text-slate-600">
                  {i + 1}
                </span>
                <span className="flex-1">{opt}</span>
                {answered && i === checkpoint.correctIndex && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {answered && i === pickedIndex && i !== checkpoint.correctIndex && (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {isCorrect && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 space-y-3">
            <p className="text-sm font-black text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> إجابة صحيحة، ممتاز! 🎉
            </p>
            <button
              type="button"
              onClick={onCorrect}
              className="w-full py-2.5 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
              style={{ background: '#1B4332' }}
            >
              <SkipForward className="w-3.5 h-3.5" /> استكمال الشرح 🚀
            </button>
          </div>
        )}

        {answered && !isCorrect && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 space-y-3">
            <p className="text-sm font-black text-amber-900 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-500" /> إجابة غير صحيحة
            </p>
            {checkpoint.explanation && (
              <p className="text-xs text-amber-800 leading-relaxed">
                {checkpoint.explanation}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => onReplay(45)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> إعادة آخر 45 ثانية ⏪
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}