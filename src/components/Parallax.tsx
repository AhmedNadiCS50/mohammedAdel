"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Parallax({
  children,
  speed = 0.2,
  className = "",
  disableOnMobile = true,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  disableOnMobile?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disableOnMobile && window.innerWidth < 768) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      const y = -progress * speed * 80;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, disableOnMobile]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}