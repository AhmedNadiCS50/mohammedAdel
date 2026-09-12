"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Truck, 
  ShieldCheck, 
  BadgeCheck,
  Sparkles,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { getSettings } from '@/lib/storage';

export default function ProductsPage() {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const whatsappLink = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    'مرحباً مستر محمد عادل، أود حجز وشراء نسخة من "كتاب الصف الثاني البكالوريا برمجة". يرجى إفادتي بالسعر وتفاصيل الشحن والتوصيل.'
  )}`;

  const bookFeatures = [
    'تغطية شاملة لمنهج التكنولوجيا والبرمجة للصف الثاني الثانوي كاملاً بأحدث التعديلات الوزارية.',
    'شرح وافٍ ومبسط لأساسيات الخوارزميات ومفاهيم البرمجة بدون أي تعقيد.',
    'أكثر من 500 سؤال وتدريب عملي بنظام الاختيار من متعدد مع الإجابات النموذجية.',
    'نماذج امتحانات البكالوريا المتوقعة وتدريبات شاملة بعد كل فصل.',
    'طباعة فاخرة بالألوان وورق عالي الجودة وتجليد مريح للمذاكرة والمتابعة.',
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
            <ShoppingBag className="w-3.5 h-3.5 text-green-700" />
            <span>المطبوعات والمؤلفات الرسمية المعتمدة</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
            متجر كتب ومؤلفات الخبير مستر محمد عادل
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            جميع الملازم والكتب متوفرة للطلب المباشر مع خدمة التوصيل والشحن لجميع محافظات مصر حتى باب المنزل.
          </p>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Product Image Cover */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[300px] aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-gray-200">
                <Image
                  src="/images/book-cover.jpg"
                  alt="كتاب الصف الثاني البكالوريا برمجة - مستر محمد عادل"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-green-900 text-xs font-bold px-3 py-1 rounded-full border border-green-200 shadow-sm">
                  طبعة 2027 المحدثة
                </div>
              </div>
            </div>

            {/* Product Details & Purchase CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-green-800 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  المرحلة الثانوية • بكالوريا تخصصية
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
                  كتاب الصف الثاني البكالوريا برمجة
                </h2>
                <p className="text-xs sm:text-sm text-green-800 font-bold mt-1.5 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-green-700" />
                  <span>تأليف وإعداد: الخبير مستر محمد عادل</span>
                </p>
              </div>

              {/* Status Box */}
              <div className="p-4 rounded-xl border border-green-200 bg-green-50/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 block">حالة الحجز والطلب:</span>
                  <span className="text-base sm:text-lg font-black text-green-900 leading-snug">
                    متاح للطلب والتوصيل المباشر
                  </span>
                </div>
                <div className="text-left shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-white text-green-800 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                    <Truck className="w-3.5 h-3.5 text-green-700" /> شحن لجميع المحافظات
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-gray-900 mb-2">مميزات محتوى الكتاب:</h4>
                {bookFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-800" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 font-bold rounded-xl text-white text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  style={{ background: '#1B4332' }}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>طلب الكتاب عبر الواتساب الآن</span>
                </a>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-gray-700 hover:text-green-800 bg-gray-50 hover:bg-green-50 text-sm font-bold border border-gray-200 text-center transition-all"
                >
                  العودة للوحة الطالب
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
