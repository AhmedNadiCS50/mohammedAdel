"use client";

import React, { useState, useEffect } from "react";

const WORDS = [
  "الدرجة النهائية 🎯",
  "تقفيل البكالوريا 🏆",
  "فهم البرمجة والتكنولوجيا 💻",
  "كليات القمة بإذن الله 🚀",
];

export default function HeroWordSwitcher() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setIsFading(false);
      }, 300);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block relative overflow-hidden align-middle">
      <span
        className={`inline-block transition-all duration-300 transform ${
          isFading
            ? "opacity-0 -translate-y-3 scale-95"
            : "opacity-100 translate-y-0 scale-100"
        } bg-gradient-to-l from-[#4ADE80] via-[#F3D879] to-white bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(74,222,128,0.45)]`}
      >
        {WORDS[index]}
      </span>
    </span>
  );
}
