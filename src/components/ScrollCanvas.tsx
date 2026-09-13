"use client";

import React, { useEffect, useRef } from "react";

const FRAME_FIRST = 1;
const FRAME_LAST = 121;
const SKIPPED = new Set<number>([108]);

function buildFrameUrls(): string[] {
  const urls: string[] = [];
  for (let i = FRAME_FIRST; i <= FRAME_LAST; i++) {
    if (SKIPPED.has(i)) continue;
    urls.push(`/images/frames/frame_${String(i).padStart(3, "0")}.png`);
  }
  return urls;
}

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

    const urls = buildFrameUrls();
    const images = urls.map(() => {
      const img = new Image();
      img.decoding = "async";
      return img;
    });
    const loaded = new Array<boolean>(urls.length).fill(false);
    const inFlight = new Array<boolean>(urls.length).fill(false);

    const load = (i: number) => {
      if (i < 0 || i >= urls.length || inFlight[i]) return;
      inFlight[i] = true;
      images[i].src = urls[i];
      images[i].onload = () => {
        loaded[i] = true;
      };
      images[i].onerror = () => {
        loaded[i] = true;
      };
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let W = 0;
    let H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * scale));
      canvas.height = Math.max(1, Math.round(H * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      draw(Math.round(currentIdx));
    };

    const drawImage = (img: HTMLImageElement) => {
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) {
        ctx.imageSmoothingQuality = "high";
      }
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s;
      const dh = ih * s;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    };

    let currentIdx = 0;
    let drawnFrame = -1;
    let wall = 0;

    const draw = (idx: number) => {
      const clamped = Math.max(0, Math.min(urls.length - 1, idx));
      let i = clamped;
      while (i >= 0 && (!loaded[i] || !images[i].naturalWidth)) i--;
      if (i < 0 || i === drawnFrame) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      drawImage(images[i]);
      drawnFrame = i;
    };

    const scrollProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / total));
    };

    let visible = true;

    const update = (p: number) => {
      const target = p * (urls.length - 1);

      if (reduceMotion) {
        currentIdx = target;
      } else {
        const diff = target - currentIdx;
        currentIdx += diff * 0.18;
        if (Math.abs(diff) < 0.01) currentIdx = target;
      }

      const ci = Math.round(currentIdx);
      for (let k = 0; k < 8; k++) {
        load(ci + k);
        load(ci - k);
      }
      for (let k = 0; k < 2; k++) {
        if (wall < urls.length) {
          load(wall);
          wall++;
        }
      }

      draw(ci);

      if (content && !reduceMotion) {
        const fade = Math.max(0, Math.min(1, 1 - Math.pow(p, 1.5)));
        const rise = p * -50;
        content.style.opacity = String(fade);
        content.style.transform = `translateY(${rise}px)`;
        content.style.willChange = "opacity, transform";
      }
    };

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

    for (let i = 0; i < 4; i++) load(i);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    const raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
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
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
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