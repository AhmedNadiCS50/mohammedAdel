"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, Trash2, RotateCcw, AlertCircle, AudioLines } from 'lucide-react';

const MAX_SECONDS = 120;
const POST_URL = '/api/uploads/audio';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function VoiceRecorder({
  url,
  onChange,
}: {
  url: string | null;
  onChange: (url: string | null) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
      clearTimer();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.onstop = null;
        try {
          recorderRef.current.stop();
        } catch {
          // recorder may already be stopped
        }
      }
    };
  }, []);

  const start = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('المتصفح لا يدعم التسجيل الصوتي. جرّب متصفح Chrome أو Edge.');
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('تعذّر الوصول إلى الميكروفون. تأكد من منح الإذن وإغلاق أي برنامج يستخدم الميكروفون.');
      return;
    }
    if (!('MediaRecorder' in window)) {
      stopStream();
      setError('المتصفح لا يدعم التسجيل الصوتي.');
      return;
    }

    let mime = '';
    const mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    for (const m of mimes) {
      if (MediaRecorder.isTypeSupported(m)) {
        mime = m;
        break;
      }
    }

    try {
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorderRef.current = recorder;
      streamRef.current = stream;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => handleUpload();
      recorder.start(250);
      setRecording(true);
      setElapsed(0);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(s);
        if (s >= MAX_SECONDS && recorderRef.current?.state === 'recording') {
          recorderRef.current.stop();
        }
      }, 250);
    } catch (err) {
      stopStream();
      setError('تعذّر بدء التسجيل.');
      console.error('voice recorder start error:', err);
    }
  };

  const stop = () => {
    clearTimer();
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const handleUpload = async () => {
    const chunks = chunksRef.current;
    const mimeType = recorderRef.current?.mimeType || 'audio/webm';
    stopStream();
    recorderRef.current = null;
    setRecording(false);
    if (chunks.length === 0) {
      setError('لم يتم التقاط صوت. أعد المحاولة.');
      return;
    }
    const blob = new Blob(chunks, { type: mimeType });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', blob, 'voice.webm');
      const res = await fetch(POST_URL, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل رفع التسجيل الصوتي.');
        return;
      }
      onChange(data.url);
    } catch {
      setError('تعذّر رفع التسجيل. تحقق من الاتصال.');
    } finally {
      setUploading(false);
    }
  };

  const reRecord = () => {
    setError('');
    onChange(null);
    setElapsed(0);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && (
        <p className="flex w-full items-center gap-1.5 text-[11px] text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      {url ? (
        <>
          <audio
            controls
            src={url}
            preload="metadata"
            className="h-9 w-56 rounded-xl bg-gray-50"
          />
          <button
            type="button"
            onClick={reRecord}
            disabled={uploading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200 hover:border-amber-500 hover:text-amber-700 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> إعادة
          </button>
          <button
            type="button"
            onClick={() => { onChange(null); setError(''); }}
            disabled={uploading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200 hover:border-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> حذف
          </button>
        </>
      ) : recording ? (
        <>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <AudioLines className="w-3.5 h-3.5" />
            جارٍ التسجيل… {formatTime(elapsed)}
          </span>
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] font-bold hover:bg-gray-700 transition-colors"
          >
            <Square className="w-3 h-3" /> إيقاف
          </button>
        </>
      ) : uploading ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري رفع التسجيل…
        </span>
      ) : (
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 border border-dashed border-gray-300 hover:border-green-500 hover:text-green-700 transition-colors cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5" /> تسجيل صوتي
        </button>
      )}
    </div>
  );
}