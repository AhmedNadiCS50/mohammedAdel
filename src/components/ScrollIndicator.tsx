"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <span className="text-[10px] sm:text-xs font-bold tracking-wider text-white/70 backdrop-blur-sm px-3 py-1 rounded-full bg-white/5 border border-white/10 select-none">
        مرر لأسفل لاكتشاف المنهج والمسارات ✦
      </span>
      {/* Mouse Icon with animated wheel */}
      <div className="w-5 h-8 sm:w-6 sm:h-9 rounded-full border-2 border-white/40 flex items-start justify-center p-1 bg-black/20 backdrop-blur-sm shadow-lg">
        <div className="w-1.5 h-2 bg-[#4ADE80] rounded-full animate-bounce" />
      </div>
      <ChevronDown className="w-4 h-4 text-white/50 animate-pulse -mt-1" />
    </div>
  );
}
