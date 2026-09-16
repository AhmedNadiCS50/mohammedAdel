"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker if supported
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
      });
    }

    // 2. Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // 3. Check if user dismissed recently
    const dismissedUntil = localStorage.getItem("pwa_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // 4. Capture beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds of entering
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem("pwa_dismissed_until", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <aside
      aria-label="تثبيت التطبيق"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-br from-slate-900 via-[#1B4332] to-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black flex items-center gap-1.5 text-white">
              تثبيت تطبيق المنصة على هاتفك
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
              تصفح أسرع، بدون شريط المتصفح، ودخول فوري للمحاضرات والامتحانات بلمسة واحدة.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="إغلاق إشعار التثبيت"
          className="text-slate-400 hover:text-white p-1 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-bold transition-colors"
        >
          لاحقاً
        </button>
        <button
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-emerald-900/40 transition-all hover:scale-[1.02]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت الآن مجاناً</span>
        </button>
      </div>
    </aside>
  );
}
