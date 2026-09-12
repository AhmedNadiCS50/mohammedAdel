"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  Zap,
  ShoppingBag,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Award,
  Video,
  FileCheck,
  Users,
  Star,
  ShieldCheck,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const grades = [
    {
      id: 'g1_general',
      title: 'الصف الأول الثانوي',
      badge: 'عام - المنهج الجديد',
      desc: 'التأسيس الشامل في مبادئ تكنولوجيا المعلومات، المفاهيم الرقمية والأمان السيبراني، ونماذج امتحانات الوزارة.',
      icon: '💻',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'g1_specialized',
      title: 'الصف الأول الثانوي',
      badge: 'بكالوريا تخصصية',
      desc: 'المنهج التخصصي لمبادئ البرمجة والتفكير الخوارزمي، حل المشكلات البرمجية خطوة بخطوة والتطبيق العملي.',
      icon: '🐍',
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'g2_general',
      title: 'الصف الثاني الثانوي',
      badge: 'عام - علمي وأدبي',
      desc: 'شرح مكثف لتصميم الويب، قواعد البيانات، أساسيات البرمجة، والتدريب على الأسئلة المقالية والاختيارية.',
      icon: '⚡',
      color: 'bg-green-50 text-green-800 border-green-200'
    },
    {
      id: 'g2_specialized',
      title: 'الصف الثاني الثانوي',
      badge: 'كتاب البكالوريا المعتمد',
      desc: 'المنهج الشامل في لغات البرمجة المتقدمة وتطوير المشروعات وتطبيقات الحاسب مع المرجع الورقي الرسمي.',
      icon: '🚀',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  ];

  const features = [
    {
      icon: Video,
      title: 'محاضرات تفاعلية عالية الجودة',
      desc: 'شرح مبسط لكل جزئية في المنهج بالصوت والصورة مع أمثلة واقعية وتطبيق عملي على الشاشة.'
    },
    {
      icon: FileCheck,
      title: 'امتحانات دورية وتصحيح فوري',
      desc: 'اختبار بعد كل محاضرة يقيس استيعابك بنظام الاختيار من متعدد مع إظهار النتيجة والإجابات النموذجية فوراً.'
    },
    {
      icon: Award,
      title: 'بنوك أسئلة الوزارة المعتمدة',
      desc: 'تدريب مكثف على نماذج امتحانات الأعوام السابقة ونماذج الوزارة الاسترشادية لضمان الدرجة النهائية.'
    },
    {
      icon: ShoppingBag,
      title: 'كتاب البكالوريا الورقي',
      desc: 'إمكانية طلب الكتاب الورقي المعتمد وتوصيله حتى باب بيتك للمذاكرة وحل التدريبات كتابياً.'
    }
  ];

  const steps = [
    {
      num: '1',
      title: 'أنشئ حسابك',
      desc: 'سجّل بياناتك وحدد صفك الدراسي في أقل من دقيقة.'
    },
    {
      num: '2',
      title: 'فعّل اشتراكك',
      desc: 'اشحن كود الاشتراك الشهري أو راسلنا عبر الواتساب لتفعيله فوراً.'
    },
    {
      num: '3',
      title: 'تابع دروسك',
      desc: 'شاهد المحاضرات بجودة عالية وحمّل الملازم الخاصة بكل درس.'
    },
    {
      num: '4',
      title: 'احصد الدرجة النهائية',
      desc: 'حل الواجبات والامتحانات الإلكترونية وقوّم مستواك أولاً بأول.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 sm:pb-20">

      {/* ═════════════════════════════════════════════
          1. HERO SECTION
      ════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-white to-gray-50 border-b border-gray-200 pt-8 pb-12 sm:pt-14 sm:pb-20 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-right">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100/80 border border-green-200 text-xs font-bold text-green-900">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0" />
                <span>المنصة الرسمية المعتمدة • دفعة 2027</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </div>

              {/* Responsive Heading with generous line-height */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.32] sm:leading-[1.28] tracking-tight">
                <span>مادة التكنولوجيا مع</span>
                <span className="block mt-1 sm:mt-2 text-[#1B4332]">الخبير مستر محمد عادل</span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                المنصة التعليمية الأولى المتخصصة في شرح وتدريس مناهج الحاسب الآلي وتكنولوجيا المعلومات والبرمجة لطلاب المرحلة الثانوية (عام وتخصصي بكالوريا). من أول المفاهيم وحتى الدرجة النهائية.
              </p>

              {/* CTAs - fully responsive for mobile, tablet, laptop */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-white font-black text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  style={{ background: '#1B4332' }}
                >
                  <GraduationCap className="w-5 h-5 shrink-0" />
                  <span>أنشئ حسابك وابدأ المذاكرة</span>
                </Link>

                <Link
                  href="/dashboard/subscription"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-white border border-gray-300 text-gray-700 hover:text-green-800 hover:border-green-300 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>تفعيل كود الاشتراك</span>
                </Link>

                <Link
                  href="/products"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-green-900 bg-green-100/60 hover:bg-green-100 border border-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-green-700 shrink-0" />
                  <span>كتاب البكالوريا الورقي</span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="pt-5 border-t border-gray-200 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-right">
                  <div className="font-black text-xl sm:text-2xl text-[#1B4332]">4 صفوف</div>
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">عام وبكالوريا</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="font-black text-xl sm:text-2xl text-[#1B4332]">100%</div>
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">تغطية المنهج</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="font-black text-xl sm:text-2xl text-[#1B4332]">فوري</div>
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">تصحيح ذكي</div>
                </div>
              </div>

            </div>

            {/* Right: Teacher Image Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-2xl border border-gray-200 shadow-md p-3">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-b from-green-50 to-emerald-100/60 flex items-end justify-center">
                  <Image
                    src="/images/teacher.png"
                    alt="الخبير مستر محمد عادل"
                    fill
                    className="object-contain object-bottom"
                    priority
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-green-200 px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>الخبير أونلاين</span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 text-center">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">مستر محمد عادل</h3>
                  <p className="text-xs font-bold text-green-800 mt-1 leading-normal">
                    خبير مادة التكنولوجيا والبرمجة ومؤلف كتاب البكالوريا
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[11px]">
                      ثانوي عام وبكالوريا
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                      دفعة 2027
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          2. CURRICULUM & GRADES
      ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200 inline-block">
            المسارات الدراسية المعتمدة
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-3 leading-snug">
            اختر صفك الدراسي وابدأ التفوق
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-2">
            محتوى مخصص ومبسط لكل مرحلة دراسية يشمل المحاضرات والواجبات ونماذج الامتحانات
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 flex flex-col justify-between hover:border-green-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-3xl shrink-0">{grade.icon}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border text-center ${grade.color}`}>
                    {grade.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2 leading-snug">{grade.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                  {grade.desc}
                </p>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center border border-gray-200 text-gray-700 group-hover:border-green-700 group-hover:bg-green-50 group-hover:text-green-900 transition-all flex items-center justify-center gap-1 mt-auto"
              >
                <span>اشترك في هذا الصف</span>
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          3. WHY US / PLATFORM FEATURES
      ════════════════════════════════════════════════ */}
      <section className="bg-gray-50 border-y border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200 inline-block">
              مميزات المنصة
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-3 leading-snug">
              لماذا يختار الطلاب منصة مستر محمد عادل؟
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              منظومة متكاملة صُممت خصيصاً لتضمن لك التفوق والدرجة النهائية بأسهل طريقة ممكنة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:border-green-200 hover:shadow-sm transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shrink-0"
                    style={{ background: '#1B4332' }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-base text-gray-900 mb-2 leading-snug">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          4. BOOK SHOWCASE SECTION
      ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Book Cover */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-44 h-60 sm:w-52 sm:h-72 lg:w-56 lg:h-80 rounded-xl overflow-hidden shadow-md border border-gray-200 shrink-0">
                <Image
                  src="/images/book-cover.jpg"
                  alt="كتاب الصف الثاني البكالوريا"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4 text-center lg:text-right">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200 inline-block">
                متاح الآن للطلب والشحن المباشر
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-snug">
                كتاب الصف الثاني الثانوي البكالوريا (تكنولوجيا وبرمجة)
              </h2>

              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                المرجع الشامل والمتكامل لكل طالب في مادة التكنولوجيا. أعده مستر محمد عادل بأسلوب تفاعلي فريد يضم أسئلة الامتحانات الوزارية، بنوك الأسئلة الحديثة، والتدريبات العملية بالأكواد البرمجية.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  style={{ background: '#1B4332' }}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>طلب الكتاب وتفاصيل الشحن</span>
                </Link>

                <div className="text-xs font-medium text-gray-500 text-center">
                  🚚 توصيل سريع لجميع المحافظات حتى باب المنزل
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          5. HOW TO START (4 STEPS)
      ════════════════════════════════════════════════ */}
      <section className="bg-emerald-50/50 border-y border-green-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200 inline-block">
              خطوات سهلة وسريعة
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-3 leading-snug">
              كيف تبدأ المذاكرة معنا؟
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 text-center space-y-2.5 sm:space-y-3 relative shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white font-black text-sm"
                  style={{ background: '#1B4332' }}
                >
                  {step.num}
                </div>
                <h3 className="font-black text-base text-gray-900 leading-snug">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          6. FINAL CTA BANNER
      ════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div
          className="rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-md space-y-4 sm:space-y-5"
          style={{ background: '#1B4332' }}
        >
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black leading-snug sm:leading-tight">
            جاهز لتحقيق الدرجة النهائية في التكنولوجيا؟
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            انضم الآن لمئات الطلاب الذين يدرسون مادة التكنولوجيا بأحدث الأساليب التعليمية مع الخبير مستر محمد عادل.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-gray-900 text-sm bg-white hover:bg-gray-100 transition-all shadow-sm text-center"
            >
              أنشئ حسابك الآن
            </Link>
            <Link
              href="/dashboard/subscription"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white text-sm bg-green-800/80 hover:bg-green-800 border border-green-700 transition-all text-center"
            >
              تفعيل كود المحاضرات
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
