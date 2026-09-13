"use client";

import React, { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video/hero.mp4";

interface ScrollCanvasProps {
  children?: React.ReactNode;
  heightClass?: string;
}

export default function ScrollCanvas({
  children,
  heightClass = "h-[130vh] sm:h-[260vh] lg:h-[400vh]",
}: ScrollCanvasProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      window.matchMedia("(hover: none) and (pointer: coarse)").matches
    );
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const video = videoRef.current;
    if (!section || !overlay || !content || !video) return;

    const touchDevice =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

let lastT = -1;

    const update = (p: number) => {
      if (!video.duration) return;
      if (reduceMotion) {
        if (lastT !== 0) {
          lastT = 0;
          video.currentTime = 0;
        }
        return;
      }
      const t = Math.min(
        Math.max(0, video.duration - 0.05),
        p * video.duration
      );
      if (Math.abs(t - lastT) < 0.015) return;
      lastT = t;
      try {
        video.currentTime = t;
      } catch {
        /* ignore */
      }
    };

    video.addEventListener("loadedmetadata", () => {
      if (touchDevice && !reduceMotion) {
        video.loop = true;
        video.play().catch(() => {
          /* ignore */
        });
      } else if (!touchDevice) {
        try {
          video.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    });

    const frame = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
      const isHeroDone = p >= 0.999;
      overlay.style.opacity = onScreen && !isHeroDone ? "1" : "0";

      if (touchDevice) {
        if (onScreen && !isHeroDone && !reduceMotion && video.paused) {
          video.play().catch(() => {
            /* ignore */
          });
        } else if ((!onScreen || isHeroDone || reduceMotion) && !video.paused) {
          video.pause();
        }
      } else {
        if (onScreen && !isHeroDone) update(p);
        if (content && !reduceMotion) {
          const fade = Math.max(0, Math.min(1, 1 - Math.pow(p, 1.5)));
          const rise = p * -50;
          content.style.opacity = String(fade);
          content.style.transform = `translateY(${rise}px)`;
          content.style.willChange = "opacity, transform";
        }
      }
      requestAnimationFrame(frame);
    };

    const raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollHeight = isTouch ? "h-dvh" : heightClass;

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`relative bg-black ${scrollHeight}`}
    >
      <div
        ref={overlayRef}
        className={`${isTouch ? "absolute" : "fixed"} inset-0 z-0 pointer-events-none`}
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{
            filter: "brightness(1.5) contrast(1.3) saturate(1.15)",
          }}
        />
      </div>

      <div className="sticky top-0 h-dvh overflow-hidden">
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.44) 12%, rgba(0,0,0,0.24) 30%, rgba(0,0,0,0.40) 62%, rgba(0,0,0,0.62) 100%), radial-gradient(ellipse 80% 60% at 50% 32%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.36) 55%, rgba(0,0,0,0.6) 100%)",
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