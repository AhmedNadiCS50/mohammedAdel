"use client";

import React from 'react';
import { Quote, Star } from 'lucide-react';
import Reveal from '@/components/Reveal';

interface Testimonial {
  text: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: 'مستر عمرو شرحه تحفة وبضعه عالي، وكل حاجة في المنصة سهل تلقاها: محاضرة، امتحان، واجب. بقت آخر حاجة أفتحها في اليوم.',
    name: 'أحمد',
    role: 'طالب أولى ثانوي',
  },
  {
    text: 'ابني بقى بيدخل المنصة لوحده ويذاكر من غير ما نقوله. نظام الأكواد سهل جداً والتفعيل تم في دقايق عن طريق الواتساب.',
    name: 'أم محمد',
    role: 'ولية أمر',
  },
  {
    text: 'الامتحانات بتصحح فوراً وتبينلي غلطي، وبنوك أسئلة الوزارة خلتني واثق في نفسي قبل الامتحان. أفضل خدمة في المادة.',
    name: 'يوسف',
    role: 'طالب تانية ثانوي',
  },
  {
    text: 'أفضل منصة في مادة التكنولوجيا بصراحة. الشرح واضح ومحاضرة بعد محاضرة والوقت بيعدي واحنا بنستفيد ومبسوطين.',
    name: 'فارس',
    role: 'طالب بكالوريا تخصصية',
  },
  {
    text: 'خدمة العملاء على الواتساب رجعتلي بسرعة وحلت مشكلة الكود في أقل من عشر دقايق. جزاك الله خير يا مستر عمرو، استمر.',
    name: 'كريم',
    role: 'طالب أولى ثانوي',
  },
  {
    text: 'الكتاب الورقي وصلنا البيت في يومين بالشحن، ومستوى الأسئلة فيه قريب جداً من نماذج الامتحان الوزاري. قيمة حقيقية.',
    name: 'وليد',
    role: 'ولي أمر',
  },
];

function MarqueeRow({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  const half = [...items, ...items];
  return (
    <div className="marquee-shell">
      <div className={`marquee-track ${reverse ? 'marquee-left' : 'marquee-right'}`}>
        {[0, 1].map((side) => (
          <ul key={side} className="flex items-stretch gap-4 pr-4 list-none m-0 p-0" aria-hidden={side === 1}>
            {half.map((t, i) => (
              <li
                key={`${side}-${i}`}
                className="w-[19rem] sm:w-[22rem] shrink-0 bg-white/95 border border-[#D1E8D9] rounded-2xl p-5 shadow-[var(--shadow-sm)] transition-colors"
                style={{ direction: 'rtl', textAlign: 'right' }}
              >
                <span className="inline-flex w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 items-center justify-center mb-3">
                  <Quote className="w-4 h-4 fill-current" />
                </span>
                <p className="text-[13px] leading-relaxed text-[#2D4A38] min-h-[5.5rem]">{t.text}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D1E8D9]">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{t.name}</h4>
                    <span className="text-[11px] text-gray-500">{t.role}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[#D4AF37]">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsMarquee() {
  return (
    <section className="bg-[#F3F7F4] border-y border-[#D1E8D9] py-14 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="prem-chip prem-chip--gold">آراء الطلاب وأولياء الأمور</span>
          <h2 className="prem-h2 mt-4">قالوا عنا كلام جميل</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            من كلام الطلاب وأولياء الأمور الحقيقي في محاضرات مستر عمرو شاهين — تحرك بالماوس فوق أي رسالة لقراءتها بتأني.
          </p>
        </Reveal>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={testimonials} />
        <MarqueeRow items={testimonials} reverse />
      </div>
    </section>
  );
}