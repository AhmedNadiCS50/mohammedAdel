"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessagesSquare } from 'lucide-react';
import { getSettings } from '@/lib/storage';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [number, setNumber] = useState('201030585226');

  useEffect(() => {
    const s = getSettings();
    if (s?.whatsappNumber) {
      setNumber(s.whatsappNumber.replace(/^0/, '20'));
    }
  }, []);

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const text = encodeURIComponent(
    'مرحباً مستر عمرو شاهين 👋\nعندي استفسار بخصوص الاشتراك أو تفعيل الأكواد أو الكتب، ممكن المساعدة؟'
  );
  const href = `https://wa.me/${number}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="group fixed bottom-5 left-5 z-50 flex items-center"
    >
      <span className="pointer-events-none opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ml-3 bg-white border border-gray-200 shadow-lg rounded-xl px-3 py-2 text-xs font-bold text-gray-800 whitespace-nowrap max-w-40">
        تواصل معنا واتساب
      </span>
      <span className="relative flex h-14 w-14">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-50 animate-ping" />
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-900/30 transition-transform group-hover:scale-110">
          <MessagesSquare className="w-7 h-7" />
        </span>
      </span>
    </a>
  );
}