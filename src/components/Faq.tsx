"use client";

import React, { useState } from 'react';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import Reveal from '@/components/Reveal';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'كيف أحصل على كود تفعيل الاشتراك؟',
    a: 'تواصل معنا عبر الواتساب من زر "تواصل معنا واتساب" الموجود أسفل الشاشة، وسنرسل لك كود التفعيل الخاص بصفك الدراسي خلال دقائق بعد سداد الاشتراك.',
  },
  {
    q: 'كيف أفعّل الكود بعد استلامه؟',
    a: 'افتح رابط "تفعيل كود الاشتراك" من الصفحة الرئيسية، أدخل الكود الظاهر في رسالة الواتساب، واضغط تفعيل. ينشط حسابك فوراً ويُفتح لك محتوى الصف كاملاً.',
  },
  {
    q: 'هل المحاضرات تعمل على الموبايل والتابلت؟',
    a: 'نعم، المنصة متوافقة تماماً مع الجوال والتابلت والكمبيوتر، ويعود تقدمك في المحاضرات تلقائياً على كل الأجهزة — تابع من حيث أكملت.',
  },
  {
    q: 'هل الامتحانات والبنوك متاحة مع الاشتراك؟',
    a: 'نعم، تشمل المحاضرات امتحاناً إلكترونياً بعد كل درس مع تصحيح فوري وإظهار الإجابات النموذجية، بالإضافة إلى بنوك أسئلة الوزارة للتدريب على الامتحان النهائي.',
  },
  {
    q: 'ماذا يحدث إذا انتهى اشتراكي الشهري؟',
    a: 'يُقفل المحتوى تلقائياً عند انتهاء المدة، لكن يحتفظ نظامنا بدرجاتك وتقدمك. جدد اشتراكك بأي كود جديد وسيُفتح لك كل شيء من حيث توقفت.',
  },
  {
    q: 'كيف أطلب كتاب البكالوريا الورقي؟',
    a: 'من صفحة "كتاب الصف الثاني البكالوريا" اضغط "طلب الكتاب وتفاصيل الشحن" وتواصل معنا على الواتساب لتأكيد الطلب، ونوصل الكتاب لجميع محافظات مصر حتى باب المنزل خلال يومين.',
  },
  {
    q: 'هل الدعم متاح على مدار الساعة؟',
    a: 'نعم، يرد فريق الدعم على استفساراتكم عبر الواتساب على مدار اليوم، ويساعدكم في تفعيل الاشتراكات وحل أي مشكلة في أسرع وقت.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="prem-chip prem-chip--gold">الإجابات الأكثر طلباً</span>
        <h2 className="prem-h2 mt-4">الأسئلة الشائعة</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-3">
          جواب مباشر لكل سؤال بيتردد كتير قبل ما تبدأ معانا
        </p>
      </Reveal>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => {
          const open = openIndex === i;
          return (
            <Reveal key={item.q} delay={i * 50}>
              <div className={`prem-card overflow-hidden transition-shadow ${open ? 'ring-1 ring-green-200' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-3 p-5 text-right cursor-pointer"
                >
                  <h3 className="text-sm sm:text-base font-black text-gray-900 leading-snug flex-1">{item.q}</h3>
                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-green-800 text-white rotate-180' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}

        <Reveal delay={400}>
          <div className="flex items-center justify-center gap-2 pt-4 rounded-2xl bg-[#F3F7F4] border border-[#D1E8D9] p-5 text-center flex-col sm:flex-row">
            <LifeBuoy className="w-5 h-5 text-green-700 shrink-0" />
            <p className="text-sm text-gray-700 font-medium">
              لسة عندك سؤال؟ كلمنا واتساب واحنا هنرد عليك فوراً.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}