"use client";

import React from "react";
import Link from "next/link";
import { X, Play, Sparkles, GraduationCap, CheckCircle2 } from "lucide-react";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export default function PromoModal({
  isOpen,
  onClose,
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
}: PromoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                برومو وشرح المنهج مع مستر عمرو شاهين
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                تعرف على طريقة الشرح والتطبيق العملي ونظام المنصة لدفعة 2027.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#1B4332] to-slate-900 text-center p-6">
            <div className="space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-3xl bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-[#4ADE80] flex items-center justify-center mx-auto shadow-lg shadow-green-900/40">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h4 className="text-lg font-black text-white">
                مرحبا بكم في مادة التكنولوجيا والبرمجة 2027
              </h4>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                شرح مبسط لكافة موضوعات التكنولوجيا، وتطبيقات عملية على البرمجة والذكاء الاصطناعي وبنوك أسئلة الوزارة المعتمدة.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-300 pt-2">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" /> جودة Full HD
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" /> تدريب على كل جزئية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium">
            مستعد للبدء؟ احجز مقعدك وانضم لدفعة 2027 الآن.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              إغلاق
            </button>
            <Link
              href="/register"
              onClick={onClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-900/40"
            >
              <GraduationCap className="w-4 h-4" />
              <span>أنشئ حسابك وابدأ الآن</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
