"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Zap,
  ShoppingBag,
  Star,
  ChevronLeft,
  Award,
  Video,
  FileCheck,
  PenLine,
  Trophy,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";
import ScrollCanvas from "@/components/ScrollCanvas";

export default function Home() {
  const grades = [
    {
      id: "g1_general",
      title: "الصف الأول الثانوي",
      badge: "عام - المنهج الجديد",
      desc: "التأسيس الشامل في مبادئ تكنولوجيا المعلومات، المفاهيم الرقمية والأمان السيبراني، ونماذج امتحانات الوزارة.",
      icon: "💻",
      ring: "from-emerald-400 to-teal-600",
      chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      id: "g1_specialized",
      title: "الصف الأول الثانوي",
      badge: "بكالوريا تخصصية",
      desc: "المنهج التخصصي لمبادئ البرمجة والتفكير الخوارزمي، حل المشكلات البرمجية خطوة بخطوة والتطبيق العملي.",
      icon: "🐍",
      ring: "from-green-400 to-emerald-700",
      chip: "bg-teal-50 text-teal-800 border-teal-200",
    },
    {
      id: "g2_general",
      title: "الصف الثاني الثانوي",
      badge: "عام - علمي وأدبي",
      desc: "شرح مكثف لتصميم الويب، قواعد البيانات، أساسيات البرمجة، والتدريب على الأسئلة المقالية والاختيارية.",
      icon: "⚡",
      ring: "from-teal-400 to-green-700",
      chip: "bg-green-50 text-green-800 border-green-200",
    },
    {
      id: "g2_specialized",
      title: "الصف الثاني الثانوي",
      badge: "كتاب البكالوريا المعتمد",
      desc: "المنهج الشامل في لغات البرمجة المتقدمة وتطوير المشروعات وتطبيقات الحاسب مع المرجع الورقي الرسمي.",
      icon: "🚀",
      ring: "from-yellow-400 to-amber-600",
      chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
  ];

  const features = [
    {
      icon: Video,
      title: "محاضرات تفاعلية عالية الجودة",
      desc: "شرح مبسط لكل جزئية في المنهج بالصوت والصورة مع أمثلة واقعية وتطبيق عملي على الشاشة.",
      tint: "from-emerald-500 to-teal-700",
    },
    {
      icon: FileCheck,
      title: "امتحانات دورية وتصحيح فوري",
      desc: "اختبار بعد كل محاضرة يقيس استيعابك بنظام الاختيار من متعدد مع إظهار النتيجة والإجابات النموذجية فوراً.",
      tint: "from-green-500 to-emerald-800",
    },
    {
      icon: PenLine,
      title: "واجبات حقيقية بتصحيح شخصي",
      desc: "المدرس يسلّم واجبات لكل صف، والطالب يرد بالنص وصور الكراسة ويستلم درجته مع تعليق شخصي.",
      tint: "from-amber-400 to-orange-600",
    },
    {
      icon: Award,
      title: "بنوك أسئلة الوزارة المعتمدة",
      desc: "تدريب مكثف على نماذج امتحانات الأعوام السابقة ونماذج الوزارة الاسترشادية لضمان الدرجة النهائية.",
      tint: "from-emerald-600 to-green-900",
    },
  ];

  const steps = [
    {
      num: "1",
      title: "أنشئ حسابك",
      desc: "سجّل بياناتك وحدد صفك الدراسي في أقل من دقيقة.",
    },
    {
      num: "2",
      title: "فعّل اشتراكك",
      desc: "اشحن كود الاشتراك الشهري أو راسلنا عبر الواتساب لتفعيله فوراً.",
    },
    {
      num: "3",
      title: "تابع دروسك",
      desc: "شاهد المحاضرات بجودة عالية وحمّل الملازم الخاصة بكل درس.",
    },
    {
      num: "4",
      title: "احصد الدرجة النهائية",
      desc: "حل الواجبات والامتحانات الإلكترونية وقوّم مستواك أولاً بأول.",
    },
  ];

  return (
    <div className="pb-16 sm:pb-20">
      {/* ═════════════════════════════════════════════
          1. HERO — cinematic scroll sequence
      ════════════════════════════════════════════════ */}
      <ScrollCanvas>
        <div className="grid gap-10 lg:gap-14 items-center text-center lg:text-right mx-auto w-full max-w-5xl lg:grid-cols-[1fr_auto]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs tracking-[0.3em] font-bold text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F3D879] shadow-[0_0_10px_#F3D879]" />
                المنصة الرسمية المعتمدة • دفعة 2027
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-6 text-[2rem] leading-[1.35] sm:text-4xl lg:text-[3.4rem] sm:leading-[1.25] font-extrabold text-white tracking-tight drop-shadow-[0_6px_30px_rgba(0,0,0,0.9)] [text-shadow:0_2px_24px_rgba(0,0,0,0.7)]">
                مادة التكنولوجيا مع
                <span className="block mt-2 bg-gradient-to-l from-white via-white to-[#D8D2FF] bg-clip-text text-transparent drop-shadow-[0_4px_28px_rgba(0,0,0,0.85)]">
                  الخبير مستر محمد عادل
                </span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium drop-shadow-[0_3px_16px_rgba(0,0,0,0.8)]">
                المنصة التعليمية الأولى المتخصصة في شرح وتدريس مناهج الحاسب الآلي وتكنولوجيا المعلومات والبرمجة لطلاب المرحلة الثانوية، من أول المفاهيم وحتى الدرجة النهائية.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-9 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/register"
                  className="btn-hero btn-hero--gold w-full sm:w-auto px-7 py-3 text-sm sm:text-base"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  أنشئ حسابك وابدأ المذاكرة
                </Link>
                <Link
                  href="/dashboard/subscription"
                  className="btn-hero btn-hero--ghost w-full sm:w-auto px-6 py-3 text-sm"
                >
                  <Zap className="w-4 h-4 text-[#F3D879] shrink-0" />
                  تفعيل كود الاشتراك
                </Link>
                <Link
                  href="/products"
                  className="btn-hero btn-hero--ghost w-full sm:w-auto px-6 py-3 text-sm"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  كتاب البكالوريا الورقي
                </Link>
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                <span>4 صفوف · عام وبكالوريا</span>
                <span className="w-px h-3 bg-white/25" />
                <span>تغطية 100% للمنهج</span>
                <span className="w-px h-3 bg-white/25" />
                <span>تصحيح فوري</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto lg:mr-auto">
              <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-[#F3D879]/30 via-transparent to-[#C9C2FF]/25 blur-xl" />
              <Image
                src="/images/teacher.png"
                alt="مستر محمد عادل"
                width={834}
                height={1024}
                priority
                className="relative w-full h-full object-cover rounded-[2rem] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
              />
            </div>
          </Reveal>
        </div>
      </ScrollCanvas>

      {/* ═════════════════════════════════════════════
          2. CURRICULUM & GRADES
      ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <Reveal className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="prem-chip">المسارات الدراسية المعتمدة</span>
          <h2 className="prem-h2 mt-4">اختر صفك الدراسي وابدأ التفوق</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl mx-auto">
            محتوى مخصص ومبسط لكل مرحلة دراسية يشمل المحاضرات والواجبات ونماذج الامتحانات
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {grades.map((grade, i) => (
            <Reveal key={grade.id} delay={i * 90}>
              <div className="prem-card p-5 sm:p-6 flex flex-col justify-between group h-full">
                <div className={`mx-auto -mt-10 sm:-mt-11 mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br ${grade.ring} flex items-center justify-center text-3xl shadow-lg shadow-green-900/10 ring-4 ring-white`}>
                  <span>{grade.icon}</span>
                </div>
                <div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${grade.chip}`}>
                    {grade.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 mt-3 mb-2 leading-snug">{grade.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">{grade.desc}</p>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center border border-gray-200 text-gray-700 group-hover:border-green-700 group-hover:bg-green-50 group-hover:text-green-900 transition-all flex items-center justify-center gap-1 mt-auto"
                >
                  اشترك في هذا الصف
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          3. WHY US / FEATURES
      ════════════════════════════════════════════════ */}
      <section className="bg-[#F3F7F4] border-y border-[#D1E8D9] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="prem-chip prem-chip--gold">مميزات المنصة</span>
            <h2 className="prem-h2 mt-4">لماذا يختار الطلاب منصة مستر محمد عادل؟</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3">
              منظومة متكاملة صُممت خصيصاً لتضمن لك التفوق والدرجة النهائية بأسهل طريقة ممكنة
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <Reveal key={feat.title} delay={i * 90}>
                  <div className="prem-card p-6 h-full group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.tint} flex items-center justify-center text-white mb-4 shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-base text-gray-900 mb-2 leading-snug">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          4. BOOK SHOWCASE
      ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-[#D1E8D9] p-5 sm:p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-[#F3D879] via-[#D4AF37] to-transparent" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-4 flex justify-center">
                <Tilt max={12} className="shrink-0">
                  <div className="relative w-44 h-60 sm:w-52 sm:h-72 lg:w-56 lg:h-80 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                    <Image src="/images/book-cover.jpg" alt="كتاب الصف الثاني البكالوريا" fill className="object-cover" />
                  </div>
                </Tilt>
              </div>

              <div className="lg:col-span-8 space-y-4 text-center lg:text-right">
                <span className="prem-chip prem-chip--gold">متاح الآن للطلب والشحن المباشر 🚚</span>
                <h2 className="text-xl sm:text-3xl lg:text-[2rem] font-black text-gray-900 leading-snug">
                  كتاب الصف الثاني الثانوي البكالوريا (تكنولوجيا وبرمجة)
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  المرجع الشامل والمتكامل لكل طالب في مادة التكنولوجيا. أعده مستر محمد عادل بأسلوب تفاعلي فريد يضم أسئلة الامتحانات الوزارية، بنوك الأسئلة الحديثة، والتدريبات العملية بالأكواد البرمجية.
                </p>
                <div className="flex items-center gap-2 text-amber-600 justify-center lg:justify-start pt-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-gray-700 mr-1">المرجع الأقرب للدرجة النهائية</span>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link href="/products" className="btn-hero btn-hero--green w-full sm:w-auto px-7 py-3 text-sm">
                    <ShoppingBag className="w-5 h-5 shrink-0" />
                    طلب الكتاب وتفاصيل الشحن
                  </Link>
                  <div className="text-xs font-bold text-[#2D6A4F] bg-[#D8F3DC] border border-[#A8D5B5] px-4 py-2.5 rounded-xl">
                    توصيل سريع لجميع المحافظات حتى باب المنزل
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═════════════════════════════════════════════
          5. HOW TO START (4 STEPS)
      ════════════════════════════════════════════════ */}
      <section className="bg-[#0B1F16] border-y border-[#1F3A2C] py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#2D6A4F]/30 blur-3xl animate-blob pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="prem-chip" style={{ background: "rgba(216,243,220,0.12)", borderColor: "rgba(82,183,136,0.35)", color: "#A8E6C0" }}>خطوات سهلة وسريعة</span>
            <h2 className="prem-h2 mt-4 text-white">كيف تبدأ المذاكرة معنا؟</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 90}>
                <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-6 text-center space-y-3 relative group transition-colors hover:bg-white/[0.1] hover:border-[#D4AF37]/40 h-full">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-black text-base text-[#241a03] bg-gradient-to-br from-[#F3D879] to-[#D4AF37] shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <h3 className="font-black text-base text-white leading-snug">{step.title}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          6. FINAL CTA BANNER
      ════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 pt-14 sm:pt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-12 text-center shadow-2xl bg-gradient-to-br from-[#1B4332] via-[#245A42] to-[#1B4332]">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#D4AF37]/15 blur-3xl animate-blob pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-400/15 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "-4s" }} />

            <div className="relative space-y-4 sm:space-y-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm mx-auto">
                <Trophy className="w-7 h-7 text-[#F3D879]" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug">
                جاهز لتحقيق الدرجة النهائية في التكنولوجيا؟
              </h2>
              <p className="text-[#D8F3DC] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                انضم الآن لمئات الطلاب الذين يدرسون مادة التكنولوجيا بأحدث الأساليب التعليمية مع الخبير مستر محمد عادل.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/register" className="btn-hero btn-hero--gold w-full sm:w-auto px-9 py-3.5 text-sm sm:text-base">
                  <GraduationCap className="w-5 h-5 shrink-0" />
                  أنشئ حسابك الآن
                </Link>
                <Link
                  href="/dashboard/subscription"
                  className="btn-hero btn-hero--ghost w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm"
                >
                  <Zap className="w-4 h-4 text-[#F3D879] shrink-0" />
                  تفعيل كود المحاضرات
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}