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
  Sparkles,
  Award,
  Video,
  FileCheck,
  PenLine,
  Trophy,
} from "lucide-react";
import Reveal from "@/components/Reveal";

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
          1. HERO — dark premium
      ════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0B1F16] border-b border-[#1F3A2C]">
        {/* ambient blobs */}
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-[#2D6A4F]/40 blur-3xl animate-blob pointer-events-none" />
        <div
          className="absolute -bottom-48 -left-32 w-[520px] h-[520px] rounded-full bg-[#D4AF37]/15 blur-3xl animate-blob pointer-events-none"
          style={{ animationDelay: "-5s" }}
        />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "-2s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Text side */}
            <div className="lg:col-span-7 text-center lg:text-right space-y-6">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#F3D879] animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-[#F3E9C0]">المنصة الرسمية المعتمدة • دفعة 2027</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#F3D879] shrink-0" />
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.3] sm:leading-[1.25] tracking-tight">
                  مادة التكنولوجيا مع
                  <span className="block mt-1 sm:mt-2 bg-gradient-to-l from-[#F3D879] via-[#E8C666] to-[#D4AF37] bg-clip-text text-transparent">
                    الخبير مستر محمد عادل
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={180}>
                <p className="text-emerald-100/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  المنصة التعليمية الأولى المتخصصة في شرح وتدريس مناهج الحاسب الآلي وتكنولوجيا المعلومات والبرمجة لطلاب المرحلة الثانوية (عام وتخصصي بكالوريا). من أول المفاهيم وحتى الدرجة النهائية.
                </p>
              </Reveal>

              <Reveal delay={260}>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                  <Link
                    href="/register"
                    className="btn-hero btn-hero--gold w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base"
                  >
                    <GraduationCap className="w-5 h-5 shrink-0" />
                    أنشئ حسابك وابدأ المذاكرة
                  </Link>
                  <Link
                    href="/dashboard/subscription"
                    className="btn-hero btn-hero--ghost w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm"
                  >
                    <Zap className="w-4 h-4 text-[#F3D879] shrink-0" />
                    تفعيل كود الاشتراك
                  </Link>
                  <Link
                    href="/products"
                    className="btn-hero btn-hero--ghost w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    كتاب البكالوريا الورقي
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={340}>
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
                  {[
                    { val: "4 صفوف", label: "عام وبكالوريا" },
                    { val: "100%", label: "تغطية المنهج" },
                    { val: "تصحيح فوري", label: "للواجبات والامتحانات" },
                    { val: "دفعة 2027", label: "الدفعة المعتمدة" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white/[0.06] border border-white/10 px-3 py-3 text-center hover:bg-white/[0.1] hover:border-white/20 transition-colors">
                      <div className="font-black text-sm sm:text-base text-[#F3D879]">{s.val}</div>
                      <div className="text-[10px] sm:text-[11px] text-emerald-100/70 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Teacher card side */}
            <Reveal delay={200} className="lg:col-span-5">
              <div className="relative flex justify-center">
                {/* glow behind card */}
                <div className="absolute inset-0 -m-6 rounded-[2.5rem] bg-gradient-to-b from-[#D4AF37]/25 to-transparent blur-2xl pointer-events-none" />

                <div className="relative w-full max-w-[300px] sm:max-w-[330px] rounded-[1.8rem] p-[3px] bg-gradient-to-b from-[#F3D879] via-[#D4AF37]/40 to-[#1B4332] shadow-2xl shadow-black/40">
                  <div className="rounded-[1.65rem] bg-white overflow-hidden">
                    <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#E7F3EA] to-[#D6EBDC] flex items-end justify-center">
                      <Image
                        src="/images/teacher.png"
                        alt="الخبير مستر محمد عادل"
                        fill
                        priority
                        className="object-contain object-bottom"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur border border-green-200 px-3 py-1 rounded-full text-[11px] font-bold text-green-800 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        الخبير أونلاين
                      </div>
                      <div className="absolute top-3 left-3 bg-[#1B4332] text-[#F3D879] text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                        2027
                      </div>
                    </div>
                    <div className="px-4 py-4 text-center bg-white">
                      <h3 className="text-lg font-black text-gray-900">مستر محمد عادل</h3>
                      <p className="text-[11px] font-bold text-green-800 mt-0.5 leading-normal">
                        خبير مادة التكنولوجيا والبرمجة ومؤلف كتاب البكالوريا
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-500">
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">ثانوي عام وبكالوريا</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">مصر • أونلاين</span>
                      </div>
                    </div>
                  </div>

                  {/* floating chips */}
                  <div className="absolute -top-4 -left-5 sm:-left-8 animate-float rounded-2xl bg-white/95 backdrop-blur border border-green-100 shadow-lg px-3.5 py-2.5 flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 text-green-800 flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </span>
                    <div className="text-right">
                      <div className="text-[13px] font-black text-gray-900 leading-none">مئات المحاضرات</div>
                      <div className="text-[10px] text-gray-500 mt-1">شرح بالصوت والصورة</div>
                    </div>
                  </div>

                  <div className="absolute -bottom-5 -right-4 sm:-right-9 animate-float rounded-2xl bg-white/95 backdrop-blur border border-amber-100 shadow-lg px-3.5 py-2.5 flex items-center gap-2" style={{ animationDelay: "-2.5s" }}>
                    <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <PenLine className="w-5 h-5" />
                    </span>
                    <div className="text-right">
                      <div className="text-[13px] font-black text-gray-900 leading-none">واجبات وتصحيح</div>
                      <div className="text-[10px] text-gray-500 mt-1">بتعليق شخصي من المدرس</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>

        {/* bottom curve fade */}
        <div className="relative h-8 bg-gradient-to-b from-transparent to-[#FAFAF8]" />
      </section>

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
                <div className="relative w-44 h-60 sm:w-52 sm:h-72 lg:w-56 lg:h-80 rounded-2xl overflow-hidden shadow-xl border border-gray-200 shrink-0 -rotate-1 hover:rotate-0 transition-transform">
                  <Image src="/images/book-cover.jpg" alt="كتاب الصف الثاني البكالوريا" fill className="object-cover" />
                </div>
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