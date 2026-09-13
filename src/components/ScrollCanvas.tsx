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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!section || !content || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const urls = buildFrameUrls();
    const images = urls.map(() => {
      const img = new Image();
      img.decoding = "async";
      return img;
    });
    const loaded = new Array<boolean>(urls.length).fill(false);
    const inFlight = new Array<boolean>(urls.length).fill(false);
    let ready = false;

    const load = (i: number) => {
      if (i < 0 || i >= urls.length || inFlight[i]) return;
      inFlight[i] = true;
      images[i].src = urls[i];
      images[i].onload = () => {
        loaded[i] = true;
        if (i === 0) ready = true;
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
    let drawnIdx = -1;
    let wall = 0;

    const draw = (idx: number) => {
      const clamped = Math.max(0, Math.min(urls.length - 1, idx));
      if (clamped === drawnIdx && ready) return;
      let i = clamped;
      while (i >= 0 && !loaded[i]) i--;
      if (i < 0) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      drawImage(images[i]);
      drawnIdx = clamped;
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
        currentIdx += diff * 0.1;
        if (Math.abs(diff) < 0.005) currentIdx = target;
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
        const fade = Math.max(0, Math.min(1, 1 - p * 1.6));
        const rise = p * -70;
        content.style.opacity = String(fade);
        content.style.transform = `translateY(${rise}px)`;
        content.style.willChange = "opacity, transform";
      }
    };

    const frame = () => {
      if (visible) update(scrollProgress());
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
      className={`relative overflow-hidden bg-black ${heightClass}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
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