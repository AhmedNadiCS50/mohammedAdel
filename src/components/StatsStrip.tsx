"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Users, Award, Headphones, Star } from 'lucide-react';
import Reveal from '@/components/Reveal';

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { icon: Users, value: 4, suffix: '', label: 'مسارات دراسية معتمدة' },
  { icon: Award, value: 100, suffix: '%', label: 'تغطية المنهج الوزاري' },
  { icon: Headphones, value: 24, suffix: '/7', label: 'دعم واتساب متواصل' },
  { icon: Star, value: 5, suffix: ' نجوم', label: 'تقييم أولياء الأمور' },
];

function useCountUp(target: number, started: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return value;
}

function StatItem({ stat, started, delay }: { stat: Stat; started: boolean; delay: number }) {
  const Icon = stat.icon;
  const value = useCountUp(stat.value, started);

  return (
    <Reveal delay={delay}>
      <div className="framed-num-card relative rounded-2xl bg-white/[0.07] border border-white/15 px-6 py-8 text-center backdrop-blur-sm transition-colors hover:bg-white/[0.12] hover:border-[#D4AF37]/40">
        <Icon className="w-6 h-6 mx-auto mb-3 text-[#F3D879]" />
        <p className="text-3xl sm:text-4xl font-black text-white leading-none" dir="ltr">
          {value}
          <span className="text-[#F3D879] text-xl sm:text-2xl mx-1">{stat.suffix}</span>
        </p>
        <p className="mt-3 text-xs sm:text-sm font-semibold text-emerald-100/80">{stat.label}</p>
      </div>
    </Reveal>
  );
}

export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#0B1F16] border-y border-[#1F3A2C] py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl animate-blob pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="prem-chip" style={{ background: "rgba(216,243,220,0.12)", borderColor: "rgba(82,183,136,0.35)", color: "#A8E6C0" }}>المنصة في أرقام</span>
          <h2 className="prem-h2 mt-4 text-white">مجهود حقيقي بنتائج حقيقية</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} started={started} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}