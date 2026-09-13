import React, { type ReactNode } from "react";
import Image from "next/image";
import { Video, PenLine, FileCheck, Sparkles } from "lucide-react";

export default function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-[#0B1F16] min-h-[88vh] flex items-center justify-center px-4 py-12">
      {/* ambient blobs */}
      <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-[#2D6A4F]/40 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-48 -left-32 w-[420px] h-[420px] rounded-full bg-[#D4AF37]/12 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "-5s" }} />

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] overflow-hidden bg-white shadow-2xl shadow-black/40 border border-white/10">
        {/* Brand side */}
        <div className="relative lg:col-span-5 bg-gradient-to-br from-[#1B4332] via-[#245A42] to-[#0F2B1E] p-7 sm:p-9 flex flex-col justify-between overflow-hidden">
          <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-0 w-40 h-40 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-center lg:justify-start">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#F3D879]/50 shadow-lg ring-2 ring-[#F3D879]/20">
              <Image src="/images/teacher.png" alt="مستر محمد عادل" fill className="object-cover object-top" />
            </div>
          </div>

          <div className="relative text-center lg:text-right space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#F3E9C0]">
              <Sparkles className="w-3.5 h-3.5 text-[#F3D879]" />
              المنصة الرسمية المعتمدة • دفعة 2027
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {title}
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">{subtitle}</p>
            <ul className="space-y-2.5 pt-2 hidden sm:block">
              {[
                { icon: Video, label: "محاضرات تفاعلية بالصوت والصورة" },
                { icon: PenLine, label: "واجبات حقيقية بتصحيح شخصي" },
                { icon: FileCheck, label: "امتحانات إلكترونية بنتيجة فورية" },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <li key={it.label} className="flex items-center gap-2.5 text-emerald-100/90 text-xs">
                    <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#F3D879]" />
                    </span>
                    {it.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative text-center lg:text-right text-[11px] text-emerald-100/50">
            الخبير مستر محمد عادل — تكنولوجيا المعلومات والبرمجة
          </div>
        </div>

        {/* Form side */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 flex flex-col justify-center">
          {children}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">{footer}</div>
        </div>
      </div>
    </div>
  );
}