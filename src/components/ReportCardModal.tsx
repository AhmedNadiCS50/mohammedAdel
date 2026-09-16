"use client";

import React, { useRef, useEffect, useState } from "react";
import { Student } from "@/lib/types";
import { GRADE_LABELS, TRACK_LABELS } from "@/lib/storage";
import { Download, Copy, Check, X, Sparkles, Image as ImageIcon } from "lucide-react";

interface ReportCardModalProps {
  student: Student;
  lessonsCompleted: number;
  lessonsTotal: number;
  examsAverage: number | null;
  examsTaken: number;
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  onClose: () => void;
}

export default function ReportCardModal({
  student,
  lessonsCompleted,
  lessonsTotal,
  examsAverage,
  examsTaken,
  assignmentsSubmitted,
  assignmentsTotal,
  onClose,
}: ReportCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High resolution canvas: 1000 x 1200
    const w = 1000;
    const h = 1200;
    canvas.width = w;
    canvas.height = h;

    // Background Gradient: Deep emerald to midnight green
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#081c13");
    bg.addColorStop(0.5, "#0f2f21");
    bg.addColorStop(1, "#05130c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle decorative glow
    ctx.save();
    const radialGlow = ctx.createRadialGradient(w / 2, 200, 50, w / 2, 200, 450);
    radialGlow.addColorStop(0, "rgba(82, 183, 136, 0.22)");
    radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, w, 500);
    ctx.restore();

    // Outer Luxury Gold Border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Corner decorative accents
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 35);
      ctx.lineTo(0, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(45, 45, 0);
    drawCorner(w - 45, 45, Math.PI / 2);
    drawCorner(w - 45, h - 45, Math.PI);
    drawCorner(45, h - 45, (Math.PI * 3) / 2);

    // Header Badge
    ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 220, 70, 440, 42, 21);
    ctx.fill();
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#F3E5AB";
    ctx.font = "bold 20px 'Cairo', 'Tajawal', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("منصة مادة التكنولوجيا والبرمجة ✦ تقرير المتابعة", w / 2, 98);

    // Teacher Name Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 38px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("مستر عمرو شاهين", w / 2, 160);

    ctx.fillStyle = "#A3D9C9";
    ctx.font = "600 20px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("متابعة دورية مباشرة لأولياء الأمور الكرام", w / 2, 195);

    // Student Info Card Panel
    const cardY = 240;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.beginPath();
    ctx.roundRect(70, cardY, w - 140, 190, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(82, 183, 136, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Student Name in Gold
    ctx.fillStyle = "#F3E5AB";
    ctx.font = "900 36px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText(student.name, w / 2, cardY + 58);

    // Grade & Track
    const gradeLabel = GRADE_LABELS[student.grade] || student.grade;
    const trackLabel = student.track ? ` • مسار: ${TRACK_LABELS[student.track] || student.track}` : "";
    const govLabel = student.governorate ? ` • ${student.governorate}` : "";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText(`${gradeLabel}${trackLabel}${govLabel}`, w / 2, cardY + 105);

    // Date of report
    const today = new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ctx.fillStyle = "#74C69D";
    ctx.font = "600 18px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText(`تاريخ التقرير: ${today}`, w / 2, cardY + 148);

    // Stats Grid (3 Column Cards)
    const drawStatCard = (x: number, y: number, width: number, height: number, title: string, mainStat: string, subStat: string, accentColor: string) => {
      ctx.fillStyle = "rgba(15, 30, 23, 0.85)";
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 20);
      ctx.fill();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Card Title
      ctx.fillStyle = "#CBD5E1";
      ctx.font = "bold 22px 'Cairo', 'Tajawal', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, x + width / 2, y + 48);

      // Main Stat Number
      ctx.fillStyle = accentColor;
      ctx.font = "900 48px 'Cairo', 'Tajawal', sans-serif";
      ctx.fillText(mainStat, x + width / 2, y + 115);

      // SubStat info
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 19px 'Cairo', 'Tajawal', sans-serif";
      ctx.fillText(subStat, x + width / 2, y + 165);
    };

    const statsY = 465;
    const statW = 260;
    const statH = 200;
    const gap = 30;
    const totalW = statW * 3 + gap * 2;
    const startX = (w - totalW) / 2;

    // 1. Lessons
    const lessonPercent = lessonsTotal > 0 ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 100;
    drawStatCard(
      startX,
      statsY,
      statW,
      statH,
      "المحاضرات",
      `${lessonPercent}٪`,
      `أنهى ${lessonsCompleted} من ${lessonsTotal}`,
      "#52B788"
    );

    // 2. Exams
    const examAvgText = examsAverage !== null ? `${examsAverage}٪` : "لا يوجد";
    drawStatCard(
      startX + statW + gap,
      statsY,
      statW,
      statH,
      "الامتحانات",
      examAvgText,
      `حل ${examsTaken} امتحانات`,
      "#D4AF37"
    );

    // 3. Assignments
    const assignPercent = assignmentsTotal > 0 ? `${assignmentsSubmitted} / ${assignmentsTotal}` : "مكتمل";
    drawStatCard(
      startX + (statW + gap) * 2,
      statsY,
      statW,
      statH,
      "الواجبات",
      assignPercent,
      assignmentsSubmitted > 0 ? "تسليم والتزام عالي" : "بانتظار التسليم",
      "#38BDF8"
    );

    // Detailed Evaluation Block
    const evalY = 700;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.roundRect(70, evalY, w - 140, 240, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#F3E5AB";
    ctx.font = "bold 24px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("التقييم العام وتوجيهات المدرس", w / 2, evalY + 45);

    let statusText = "مستوى ممتاز وملتزم بالمحاضرات والامتحانات، استمر بنفس القوة! 🔥";
    let statusBadge = "طالب متميز ومثابر ⭐";
    if (examsAverage !== null && examsAverage < 60) {
      statusText = "الطالب يحتاج مراجعة المحاضرات وحل تدريبات أكثر لتحسين درجات الامتحانات 💪";
      statusBadge = "فرصة ذهبية للتحسن والتعويض 🎯";
    } else if (lessonsCompleted < Math.floor(lessonsTotal / 2)) {
      statusText = "يوجد تراكم في المحاضرات، يرجى تشجيع الطالب على إنهاء المتأخرات أولاً بأول ⏳";
      statusBadge = "تنبيه بالمحاضرات المتراكمة 🔔";
    }

    // Status Pill
    ctx.fillStyle = "#1B4332";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 180, evalY + 75, 360, 46, 23);
    ctx.fill();
    ctx.strokeStyle = "#52B788";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText(statusBadge, w / 2, evalY + 105);

    // Advice text
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "600 21px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText(statusText, w / 2, evalY + 165);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 17px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("أي استفسار بخصوص درجات الطالب أو مستواه، فريق العمل في خدمتكم دائماً.", w / 2, evalY + 205);

    // Footer Branding & Stamp
    const footerY = 980;
    ctx.fillStyle = "#52B788";
    ctx.font = "bold 22px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("منصة مادة التكنولوجيا — دفعة 2027", w / 2, footerY);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 18px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("المتابعة المستمرة تصنع الفارق ✦ للتواصل والواتساب: 01030585226", w / 2, footerY + 35);

    // Official Certified Stamp
    const stampX = w / 2;
    const stampY = footerY + 100;
    ctx.save();
    ctx.translate(stampX, stampY);
    ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#D4AF37";
    ctx.font = "900 14px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("معتمد وموثق", 0, -8);
    ctx.font = "bold 12px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillText("OFFICIAL", 0, 12);
    ctx.restore();

    // Export preview data URL
    setDataUrl(canvas.toDataURL("image/png"));
  }, [student, lessonsCompleted, lessonsTotal, examsAverage, examsTaken, assignmentsSubmitted, assignmentsTotal]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `تقرير-${student.name.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                بطاقة تقرير ولي الأمر الرسومية
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                صورة عالية الدقة جاهزة للتحميل أو الإرسال الفوري لولي الأمر على الواتساب.
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

        {/* Modal Body - Canvas Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-900/60">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[420px] rounded-2xl shadow-xl border border-amber-400/30 transition-transform hover:scale-[1.01]"
            style={{ aspectRatio: "1000 / 1200" }}
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            حجم الصورة: <span className="font-bold text-white">1000 × 1200 بكسل (Retina PNG)</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "تم النسخ بنجاح!" : "نسخ الصورة"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-teal-900/40"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الصورة (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
