"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, BookOpen, Shield } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="text-emerald-100/80 pt-12 pb-8 text-sm" style={{ background: '#143326', borderTop: '1px solid #20503B' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Teacher Branding */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-[8px] overflow-hidden border border-emerald-600/40 shrink-0" style={{ background: '#1B4332' }}>
                <Image 
                  src="/images/teacher.png" 
                  alt="مستر عمرو شاهين"
                  fill
                  sizes="48px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-snug">مادة التكنولوجيا مع الخبير</h3>
                <p className="text-emerald-300 text-xs mt-0.5">مستر عمرو شاهين • المرحلة الثانوية</p>
              </div>
            </div>
            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed max-w-md">
              المنصة الرسمية المعتمدة لتدريس وشرح مناهج الحاسب الآلي وتكنولوجيا المعلومات والبرمجة لطلاب المرحلة الثانوية (عام وتخصصي بكالوريا)، مع تدريب مكثف على نماذج الامتحانات الوزارية.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">روابط المنصة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">الصفحة الرئيسية</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">كتاب الصف الثاني البكالوريا</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">لوحة دروس الطالب</Link>
              </li>
              <li>
                <Link href="/dashboard/subscription" className="hover:text-white transition-colors">تفعيل الاشتراك الشهري</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">التواصل والدعم</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-200">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr">01030585226</span>
              </div>
              <p className="text-emerald-100/60 leading-relaxed text-[11px] pt-1">
                لأي استفسار بخصوص تفعيل الاشتراكات أو حجز الكتب تواصل معنا مباشرة عبر الواتساب.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-emerald-900/60 text-center text-xs text-emerald-100/60">
          <p>© 2026 - 2027 منصة مادة التكنولوجيا مع الخبير مستر عمرو شاهين. جميع الحقوق محفوظة.</p>
          <p className="mt-2 text-emerald-200/60">تم تطوير الموقع من قبل أحمد نادي · <span dir="ltr">01030585226</span></p>
        </div>

      </div>
    </footer>
  );
}
