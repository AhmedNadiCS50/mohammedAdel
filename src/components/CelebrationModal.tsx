"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, CheckCircle2, ArrowLeft, Share2 } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  score?: number | string;
  onClose: () => void;
  continueActionText?: string;
  onContinue?: () => void;
}

export default function CelebrationModal({
  isOpen,
  title = "مبروك الإنجاز والتفوق! 🎉",
  subtitle = "لقد أكملت المهمة بنجاح وخطوت خطوة جديدة نحو تقفيل المادة بإذن الله 💪",
  badgeLabel = "إنجاز جديد ✦ مستر عمرو شاهين",
  score,
  onClose,
  continueActionText = "متابعة التقدم في المنصة",
  onContinue,
}: CelebrationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Launch celebratory confetti with brand colors (Emerald & Gold)
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#1B4332", "#52B788", "#D4AF37", "#F3E5AB", "#10B981"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-[#0d281e] to-slate-950 border border-amber-400/40 w-full max-w-md rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden transform animate-scale-up">
        {/* Glow ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Badge Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-black mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{badgeLabel}</span>
        </div>

        {/* Trophy Animated Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-5 ring-8 ring-amber-400/20 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xs mx-auto mb-6">
          {subtitle}
        </p>

        {score !== undefined && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-center gap-3">
            <span className="text-xs text-slate-300 font-bold">النتيجة المحققة:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {score}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              if (onContinue) onContinue();
              onClose();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
          >
            <span>{continueActionText}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
