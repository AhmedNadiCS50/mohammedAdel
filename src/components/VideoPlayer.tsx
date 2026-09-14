"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { extractYoutubeId, getLessonProgress, saveLessonProgress, getSettings } from '@/lib/storage';
import { Student, LessonProgress, LessonVideoSource } from '@/lib/types';
import { Shield, AlertCircle, CheckCircle2, Clock, Sparkles, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  videoUrlOrId: string;
  title: string;
  student: Student | null;
  lessonId?: string;
  videoSource?: LessonVideoSource;
  hlsPath?: string;
  onProgressUpdate?: (progress: LessonProgress) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Watermark spec: always visible, drifts for 3s every 5s cycle, rests 2s
const WM_CYCLE_MS = 5000;
const WM_MOVE_MS = 3000;

export default function VideoPlayer({
  videoUrlOrId,
  title,
  student,
  lessonId,
  videoSource,
  hlsPath,
  onProgressUpdate
}: VideoPlayerProps) {
  const [wmVisible, setWmVisible] = useState(true);
  const [isContainerFS, setIsContainerFS] = useState(false);
  const [wmPos, setWmPos] = useState<{ top: number; left: number; usePx: boolean }>({
    top: 20,
    left: 20,
    usePx: false,
  });
  const driftRef = useRef<() => void>(() => {});
  const [currentProgress, setCurrentProgress] = useState<LessonProgress | null>(null);
  const [threshold, setThreshold] = useState(90);
  const [isResumed, setIsResumed] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [hlsError, setHlsError] = useState(false);

  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerIdRef = useRef<string>(`yt-player-${lessonId || 'vid'}-${Math.random().toString(36).substring(2, 7)}`);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  const isHls = videoSource === 'hls';
  const videoId = isHls ? '' : extractYoutubeId(videoUrlOrId);

  // Resolve HLS playback URL from lessonId or hlsPath
  const hlsPlayUrl = useCallback((): string | null => {
    if (!isHls) return null;
    let id = lessonId || '';
    if (!id && hlsPath) {
      const match = hlsPath.match(/^lessons\/([^/]+)\/hls\/index\.m3u8$/);
      id = match ? match[1] : '';
    }
    return id ? `/api/hls/play/${id}/index.m3u8` : null;
  }, [isHls, lessonId, hlsPath]);

  // Load completion threshold & existing progress
  useEffect(() => {
    const settings = getSettings();
    const targetThreshold = settings.completionThreshold ?? 90;
    setThreshold(targetThreshold);

    if (student && lessonId) {
      const saved = getLessonProgress(student.id, lessonId);
      if (saved) {
        setCurrentProgress(saved);
        if (saved.watchedSeconds > 5) {
          setIsResumed(true);
        }
      }
    }
  }, [student, lessonId]);

  // Always-visible watermark: random drift every 5s (3s eased move + 2s rest),
// positioned INSIDE the actual rendered video frame (handles letterbox bars)
  useEffect(() => {
    if (!student) return;
    const drift = () => {
      const el = videoRef.current;
      const elW = el?.clientWidth || 0;
      const elH = el?.clientHeight || 0;
      const vW = el?.videoWidth || 0;
      const vH = el?.videoHeight || 0;
      if (elW > 0 && elH > 0 && vW > 0 && vH > 0) {
        const er = elW / elH;
        const vr = vW / vH;
        let offX = 0;
        let offY = 0;
        let w = elW;
        let h = elH;
        if (vr > er) {
          w = elH * vr;
          offX = (elW - w) / 2;
        } else {
          h = elW / vr;
          offY = (elH - h) / 2;
        }
        const pad = 0.1;
        setWmPos({
          top: Math.round(offY + h * (pad + Math.random() * (1 - 2 * pad))),
          left: Math.round(offX + w * (pad + Math.random() * (1 - 2 * pad))),
          usePx: true,
        });
      } else {
        setWmPos({
          top: Math.floor(Math.random() * 68) + 8,
          left: Math.floor(Math.random() * 68) + 8,
          usePx: false,
        });
      }
    };
    driftRef.current = drift;
    drift();
    const interval = setInterval(drift, WM_CYCLE_MS);
    window.addEventListener('resize', drift);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', drift);
    };
  }, [student]);

  // Fullscreen handling: container-based fullscreen keeps the watermark visible.
// We hide the native fullscreen button and use our own drum-fullscreen toggle.
  useEffect(() => {
    const onFs = () => {
      const container = containerRef.current;
      setIsContainerFS(Boolean(container && document.fullscreenElement === container));
      setTimeout(() => driftRef.current(), 60);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement === container) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    }
  }, []);

  // ---------- HLS MODE ----------
  const initHls = useCallback(async () => {
    const url = hlsPlayUrl();
    const el = videoRef.current;
    if (!url || !el) return;

    const handleHlsError = () => setHlsError(true);

    const Hls = (await import('hls.js')).default;
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, maxBufferLength: 30, backBufferLength: 60 });
      hlsRef.current = hls;
      hls.attachMedia(el);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url));
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (student && lessonId) {
          const saved = getLessonProgress(student.id, lessonId);
          if (saved && saved.watchedSeconds > 5) {
            el.currentTime = saved.watchedSeconds;
          }
        }
        el.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data?.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            handleHlsError();
          }
          setHlsError(true);
        }
      });
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = url;
      el.addEventListener('loadedmetadata', () => {
        if (student && lessonId) {
          const saved = getLessonProgress(student.id, lessonId);
          if (saved && saved.watchedSeconds > 5) {
            el.currentTime = saved.watchedSeconds;
          }
        }
        el.play().catch(() => {});
      });
    } else {
      setHlsError(true);
    }
  }, [hlsPlayUrl, student, lessonId]);

  useEffect(() => {
    if (!isHls || !hlsPlayUrl()) return;
    initHls();
    return () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch { /* noop */ }
        hlsRef.current = null;
      }
    };
  }, [isHls, initHls, hlsPlayUrl]);

  // ---------- YOUTUBE MODE ----------
  useEffect(() => {
    if (isHls || !videoId) return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setApiReady(true);
    };

    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isHls, videoId]);

  useEffect(() => {
    if (isHls || !apiReady || !videoId || typeof window === 'undefined') return;

    const domElement = document.getElementById(containerIdRef.current);
    if (!domElement) return;

    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try { playerRef.current.destroy(); } catch { /* noop */ }
    }

    try {
      const player = new window.YT.Player(containerIdRef.current, {
        videoId: videoId,
        playerVars: { rel: 0, modestbranding: 1, controls: 1, playsinline: 1 },
        events: {
          onReady: (event: any) => {
            if (student && lessonId) {
              const saved = getLessonProgress(student.id, lessonId);
              if (saved && saved.watchedSeconds > 5) {
                event.target.seekTo(saved.watchedSeconds, true);
              }
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              startTracking(event.target);
            } else {
              stopTracking();
              recordProgress(event.target);
            }
          },
        },
      });
      playerRef.current = player;
    } catch (e) {
      console.error('Error initializing YouTube Player:', e);
    }

    return () => {
      stopTracking();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch { /* noop */ }
      }
    };
  }, [isHls, apiReady, videoId, student, lessonId]);

  // HLS native video tracking
  useEffect(() => {
    if (!isHls) return;
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => {
      currentTimeRef.current = el.currentTime || 0;
      durationRef.current = el.duration || 0;
      recordFromTimes(currentTimeRef.current, durationRef.current);
    };
    el.addEventListener('timeupdate', onTime);
    const onEnded = () => stopTracking();
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
    };
  }, [isHls]);

  // ---------- shared tracking ----------
  const startTracking = (player: any) => {
    stopTracking();
    intervalRef.current = setInterval(() => {
      recordProgress(player);
    }, 3000);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const recordProgress = (player: any) => {
    if (!player) return;
    try {
      if (typeof player.getCurrentTime !== 'function' || typeof player.getDuration !== 'function') return;
      recordFromTimes(Math.floor(player.getCurrentTime() || 0), Math.floor(player.getDuration() || 0));
    } catch { /* safe fallback */ }
  };

  const recordFromTimes = (currentTime: number, duration: number) => {
    if (!student || !lessonId || !duration || duration <= 0) return;
    const percentage = Math.min(100, Math.round((currentTime / duration) * 100));
    const completed = percentage >= threshold;

    const updated = saveLessonProgress({
      studentId: student.id,
      lessonId,
      watchedSeconds: currentTime,
      durationSeconds: duration,
      watchPercentage: percentage,
      completed,
    });

    setCurrentProgress(updated);
    if (onProgressUpdate) onProgressUpdate(updated);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch { /* noop */ }
      }
    };
  }, []);

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showEmptyState = !isHls && !videoId;

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-emerald-800/40 select-none group"
        style={isContainerFS ? { width: '100vw', height: '100vh', maxWidth: '100vw', aspectRatio: 'auto', borderRadius: 0 } : undefined}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isHls ? (
          hlsError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
              <p className="font-semibold text-white">تعذّر تشغيل المحاضرة المشفّرة</p>
              <p className="text-xs mt-1 text-slate-400">تأكد من نشر قواعد Firebase Storage للسماح بقراءة ملفات الدرس، ثم حدّث الصفحة.</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="video-hls w-full h-full object-contain bg-black"
              controls
              playsInline
              preload="auto"
              onLoadedMetadata={() => driftRef.current()}
            />
          )
        ) : showEmptyState ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
            <p className="font-semibold text-white">لم يتم تحديد مصدر فيديو صالح لهذا الدرس</p>
            <p className="text-xs mt-1 text-slate-400">يرجى من المدرس إضافة يوتيوب أو رفع ملف في لوحة التحكم</p>
          </div>
        ) : (
          <div id={containerIdRef.current} className="w-full h-full" />
        )}

        {/* Moving watermark (always visible, red, 3s drift / 2s rest cycle) */}
        {student && (
          <div
            className="video-watermark-layer absolute pointer-events-none text-xs sm:text-sm font-mono font-bold text-white tracking-wider bg-red-600/40 px-3 py-1 rounded-md backdrop-blur-[1px] border border-red-400/40 z-10 opacity-80"
            style={{
              top: wmPos.usePx ? `${wmPos.top}px` : `${wmPos.top}%`,
              left: wmPos.usePx ? `${wmPos.left}px` : `${wmPos.left}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'top 3s ease-in-out, left 3s ease-in-out, opacity 300ms ease-in-out',
            }}
          >
            <span>{student.name} • {student.phone}</span>
          </div>
        )}

        {/* Custom fullscreen toggle (container-based so the watermark stays visible) */}
        {isHls && !hlsError && (
          <button
            type="button"
            aria-label="ملء الشاشة"
            onClick={toggleFullscreen}
            className="absolute bottom-3 right-3 z-30 pointer-events-auto flex items-center justify-center w-11 h-11 rounded-xl bg-black/50 hover:bg-black/75 text-white border border-white/20 transition-colors"
          >
            {isContainerFS ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        )}

        <div className="absolute top-3 right-3 pointer-events-none z-20 flex items-center gap-1.5 bg-emerald-950/85 backdrop-blur-sm border border-emerald-700/50 text-[11px] font-bold text-emerald-300 px-2.5 py-1 rounded-lg shadow-sm">
          <Shield className="w-3 h-3 text-gold-400" />
          <span>منصة الخبير م. محمد عادل</span>
        </div>
      </div>

      {student && lessonId && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {currentProgress?.completed || (currentProgress && currentProgress.watchPercentage >= threshold) ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تمت مشاهدة المحاضرة بنجاح (المحاضرة التالية مفتوحة لك الآن)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>نسبة المشاهدة الفعلية: <strong className="text-emerald-800 font-mono text-sm">{currentProgress?.watchPercentage || 0}%</strong></span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
              {currentProgress && currentProgress.watchedSeconds > 0 && (
                <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  آخر نقطة: {formatSeconds(currentProgress.watchedSeconds)}
                </span>
              )}
              <span>المطلوب للاكتمال: <strong>{threshold}%</strong> من مدة الفيديو</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentProgress?.completed
                  ? 'bg-emerald-600 shadow-sm'
                  : 'bg-gradient-to-r from-emerald-700 to-gold-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(currentProgress?.watchPercentage || 0, 2))}%` }}
            />
          </div>

          {isResumed && (
            <p className="text-[11px] text-emerald-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
              <span>تم استئناف الفيديو تلقائياً من آخر موضع توقفت عنده.</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}