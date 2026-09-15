"use client";

import { useRef, type ReactNode } from "react";

export default function Tilt({
  children,
  className = "",
  max = 8,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const HOVER_QUERY = "(hover: hover)";

  const onMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && !window.matchMedia(HOVER_QUERY).matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${(px * max).toFixed(2)}deg) rotateX(${(-py * max).toFixed(2)}deg) scale(${scale})`;
  };

  const reset = () => {
    if (typeof window !== "undefined" && !window.matchMedia(HOVER_QUERY).matches) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.12s ease-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}