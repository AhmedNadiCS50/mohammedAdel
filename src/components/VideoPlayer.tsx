"use client";

import React, { useState, useEffect, useRef } from 'react';
import { extractYoutubeId, getLessonProgress, saveLessonProgress, getSettings } from '@/lib/storage';
import { Student, LessonProgress } from '@/lib/types';
import { Shield, AlertCircle, CheckCircle2, Clock, Play, Award, Sparkles } from 'lucide-react';

interface VideoPlayerProps {
  videoUrlOrId: string;
  title: string;
  student: Student | null;
  lessonId?: string;
  onProgressUpdate?: (progress: LessonProgress) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({ 
  videoUrlOrId, 
  title, 
  student, 
  lessonId,
  onProgressUpdate 
}: VideoPlayerProps) {
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });
  const [currentProgress, setCurrentProgress] = useState<LessonProgress | null>(null);
  const [threshold, setThreshold] = useState(90);
  const [isResumed, setIsResumed] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerIdRef = useRef<string>(`yt-player-${lessonId || 'vid'}-${Math.random().toString(36).substring(2, 7)}`);

  const videoId = extractYoutubeId(videoUrlOrId);

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

  // Floating watermark for intellectual property protection
  useEffect(() => {
    if (!student) return;
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 70) + 15;
      const left = Math.floor(Math.random() * 70) + 15;
      setWatermarkPos({ top, left });
    }, 12000);

    return () => clearInterval(interval);
  }, [student]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Check if script already exists
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

    // Fallback timer if onYouTubeIframeAPIReady doesn't fire
    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [videoId]);

  // Initialize YT Player once API is ready
  useEffect(() => {
    if (!apiReady || !videoId || typeof window === 'undefined') return;

    const domElement = document.getElementById(containerIdRef.current);
    if (!domElement) return;

    // Destroy existing player instance if re-mounting
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (e) {
        // Safe catch
      }
    }

    try {
      const player = new window.YT.Player(containerIdRef.current, {
        videoId: videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            // Restore previous watch progress if available
            if (student && lessonId) {
              const saved = getLessonProgress(student.id, lessonId);
              if (saved && saved.watchedSeconds > 5) {
                event.target.seekTo(saved.watchedSeconds, true);
              }
            }
          },
          onStateChange: (event: any) => {
            // event.data: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
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
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Safe catch
        }
      }
    };
  }, [apiReady, videoId, student, lessonId]);

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
    if (!student || !lessonId || !player) return;
    try {
      if (typeof player.getCurrentTime !== 'function' || typeof player.getDuration !== 'function') {
        return;
      }
      const currentTime = Math.floor(player.getCurrentTime() || 0);
      const duration = Math.floor(player.getDuration() || 0);

      if (duration > 0) {
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
        if (onProgressUpdate) {
          onProgressUpdate(updated);
        }
      }
    } catch (e) {
      // safe fallback
    }
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-slate-800">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="font-semibold text-white">لم يتم تحديد رابط فيديو صالح لهذا الدرس</p>
        <p className="text-xs mt-1 text-slate-400">يرجى من المدرس مراجعة رابط يوتيوب في لوحة التحكم</p>
      </div>
    );
  }

  const isCompleted = currentProgress?.completed || (currentProgress && currentProgress.watchPercentage >= threshold);
  const currentPct = currentProgress?.watchPercentage || 0;

  return (
    <div className="space-y-3">
      {/* Video Container */}
      <div 
        className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-emerald-800/40 select-none group"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* YouTube API Mount Element */}
        <div id={containerIdRef.current} className="w-full h-full" />

        {/* Dynamic Security Watermark (Anti-Piracy) */}
        {student && (
          <div
            className="video-watermark-layer absolute transition-all duration-1000 ease-in-out pointer-events-none text-[11px] sm:text-xs font-mono font-bold text-white/45 tracking-wider bg-black/30 px-3 py-1 rounded-md backdrop-blur-[1px] border border-white/10 z-10"
            style={{
              top: `${watermarkPos.top}%`,
              left: `${watermarkPos.left}%`,
            }}
          >
            <span>{student.name} • {student.phone}</span>
          </div>
        )}

        {/* Top-corner platform badge */}
        <div className="absolute top-3 right-3 pointer-events-none z-20 flex items-center gap-1.5 bg-emerald-950/85 backdrop-blur-sm border border-emerald-700/50 text-[11px] font-bold text-emerald-300 px-2.5 py-1 rounded-lg shadow-sm">
          <Shield className="w-3 h-3 text-gold-400" />
          <span>منصة الخبير م. محمد عادل</span>
        </div>
      </div>

      {/* Sequential Progress & Watch Tracking Bar */}
      {student && lessonId && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تمت مشاهدة المحاضرة بنجاح (المحاضرة التالية مفتوحة لك الآن)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>نسبة المشاهدة الفعلية: <strong className="text-emerald-800 font-mono text-sm">{currentPct}%</strong></span>
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

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted 
                  ? 'bg-emerald-600 shadow-sm' 
                  : 'bg-gradient-to-r from-emerald-700 to-gold-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(currentPct, 2))}%` }}
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
