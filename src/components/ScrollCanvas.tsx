"use client";

import React, { useEffect, useRef } from "react";

const VIDEO_SRC = "/video/hero.mp4";

interface ScrollCanvasProps {
  children?: React.ReactNode;
  heightClass?: string;
}

export default function ScrollCanvas({
  children,
  heightClass = "h-[400vh]",
}: ScrollCanvasProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!section || !overlay || !content || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if ("filter" in ctx) {
      ctx.filter = "brightness(1.5) contrast(1.3) saturate(1.15)";
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const video = document.createElement("video");
    video.src = VIDEO_SRC;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.disableRemotePlayback = true;
    video.loop = false;
    video.pause();

    let W = 0;
    let H = 0;

    const videoReady = () =>
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      video.currentTime >= 0;

    const drawVideo = () => {
      if (!videoReady()) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      const s = Math.max(W / video.videoWidth, H / video.videoHeight);
      const dw = video.videoWidth * s;
      const dh = video.videoHeight * s;
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) {
        ctx.imageSmoothingQuality = "high";
      }
      ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * scale));
      canvas.height = Math.max(1, Math.round(H * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawVideo();
    };

    const scrollProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / total));
    };

    let visible = true;
    let lastTarget = -1;
    let requested = false;

    const requestDraw = () => {
      if (requested) return;
      requested = true;
      requestAnimationFrame(() => {
        requested = false;
        if (visible) drawVideo();
      });
    };

    const update = (p: number) => {
      if (!video.duration || !videoReady()) {
        lastTarget = -1;
        return;
      }
      if (reduceMotion) {
        if (lastTarget !== 0) {
          lastTarget = 0;
          video.currentTime = 0;
        }
        return;
      }
      const t = Math.min(
        Math.max(0, video.duration - 0.02),
        p * video.duration
      );
      if (Math.abs(t - lastTarget) < 0.02) return;
      lastTarget = t;
      video.currentTime = t;
      requestDraw();
    };

    video.addEventListener("loadedmetadata", () => {
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      requestDraw();
    });
    video.addEventListener("seeked", () => {
      if (visible) drawVideo();
    });
    video.addEventListener("loadeddata", () => {
      if (visible) drawVideo();
    });

    const frame = () => {
      const p = scrollProgress();
      const isHeroDone = p >= 0.999;
      overlay.style.opacity = visible && !isHeroDone ? "1" : "0";
      if (visible) update(p);
      requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "15% 0px 15% 0px" }
    );
    io.observe(section);

    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    video.load();
    const raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      video.removeAttribute("src");
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`relative bg-black ${heightClass}`}
    >
      <div
        ref={overlayRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 12%, rgba(0,0,0,0.16) 30%, rgba(0,0,0,0.30) 62%, rgba(0,0,0,0.55) 100%), radial-gradient(ellipse 80% 60% at 50% 32%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          ref={contentRef}
          className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center"
        >
          {children}
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/10 z-10 pointer-events-none" />
      </div>
    </section>
  );
}