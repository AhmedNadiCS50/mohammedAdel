"use client";

import React from 'react';
import { Quote, Star } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';

interface Testimonial {
  text: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: 'والله يا مستر عمرو شرحك تحفة، وولادي من أول محاضرة اتحبسوا في المنصة. كل حاجة في مكانها والواحد يدخل يحس إن المادة بقت سهلة.',
    name: 'أحمد عادل',
    role: 'ولي أمر - طالب أولى ثانوي',
  },
  {
    text: 'صادق مفيش كلام، بقيت ألاقي ابني سايب الموبايل وداخل المنصة يذاكر لوحده. الأكواد اتصرفت في دقايق ودخلنا على طول، عشان كده مش هروح لمكان تاني.',
    name: 'سارة إبراهيم',
    role: 'ولية أمر',
  },
  {
    text: 'الامتحانات بتتصحح فوراً وبتبنّيلي غلطتي فين بالظبط، وده مش شفته في أي مكان قبل كده. بنوك الأسئلة الوزارية دي ماشاء الله عليها شبه الامتحان الحقيقي.',
    name: 'يوسف كمال',
    role: 'طالب تانية ثانوي',
  },
  {
    text: 'كنت ناوي أسيب المادة خالص، لحد ما فتحت محاضرة واحدة عشان أجرّب، قلت خلاص دي ونش، مش هسيبك تاني. التكنولوجيا عندك أحسن من كتير في السوق.',
    name: 'فارس حسن',
    role: 'طالب بكالوريا تخصصية',
  },
  {
    text: 'خدمة العملاء على الواتساب ردّت عليا على طول وأنا قلقان على الاشتراك، وحلّوا مشكلتي في أقل من عشر دقايق. ربنا يجزيك خير يا مستر.',
    name: 'كريم محمود',
    role: 'طالب أولى ثانوي',
  },
  {
    text: 'الكتاب وصلنا البيت في يومين بس، ومستوى الأسئلة جواه قريب جداً من الامتحان الحقيقي. أحسن من اللي كنت متوقعه بكتير، تسلم ايدك.',
    name: 'وليد فتحي',
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
                  className="w-[16rem] sm:w-[19rem] lg:w-[22rem] shrink-0 list-none [touch-action:pan-y]"
                >
                  <Tilt max={10} scale={1.06}>
                    <div
                      className="marquee-tcard bg-white/95 border border-[#D1E8D9] rounded-2xl p-5 shadow-[var(--shadow-sm)] cursor-pointer transition-all duration-300 ease-out hover:bg-white hover:border-emerald-400 hover:shadow-xl hover:ring-4 hover:ring-emerald-200/50"
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
                    </div>
                  </Tilt>
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