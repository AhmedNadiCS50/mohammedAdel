"use client";

import React, { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { upload } from '@vercel/blob/client';
import { ShieldCheck, Upload, Loader2, FileVideo, CheckCircle2, AlertCircle, Wand2 } from 'lucide-react';

interface LessonVideoUploaderProps {
  lessonId: string;
  onReady: (result: { hlsPath: string; durationMinutes?: number }) => void;
}

type Stage = 'idle' | 'preparing' | 'encoding' | 'uploading' | 'done' | 'error';

const MAX_FILE_BYTES = 900 * 1024 * 1024;

export default function LessonVideoUploader({ lessonId, onReady }: LessonVideoUploaderProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [encodePct, setEncodePct] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [donePath, setDonePath] = useState<string | null>(null);
  const [ffmpegNote, setFfmpegNote] = useState('');
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLogRef = useRef('');

  const loadFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) return ffmpegRef.current;
    const baseURL = '/ffmpeg';
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    ffmpeg.on('progress', ({ progress }) => {
      setEncodePct(Math.round((progress || 0) * 100));
    });
    ffmpeg.on('log', ({ message }) => {
      ffmpegLogRef.current = `${ffmpegLogRef.current}\n${message}`.slice(-12000);
      if (message.includes('frame=')) {
        setFfmpegNote(message.split('frame=')[1]?.trim().slice(0, 60) || '');
      }
    });
    setStage('preparing');
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setStage('idle');
    return ffmpeg;
  }, []);

  const pickFile = (f: File) => {
    setErrorMsg(null);
    setDonePath(null);
    setStage('idle');
    if (!f.type.startsWith('video/')) {
      setErrorMsg('يرجى اختيار ملف فيديو صالح (MP4 / MOV / MKV...).');
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setErrorMsg('حجم الملف كبير جداً للتشفير داخل المتصفح (الحد ~900MB). يرجى تقسيم المحاضرة أو تقليل الدقة قليلاً.');
      setFile(null);
      return;
    }
    if (f.size < 1024 * 1024) {
      setErrorMsg('الملف صغير جداً ليكون محاضرة حقيقية.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const readVideoDuration = (file: File): Promise<number | undefined> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = document.createElement('video');
      media.preload = 'metadata';
      media.onloadedmetadata = () => {
        const d = media.duration;
        URL.revokeObjectURL(url);
        resolve(isFinite(d) && d > 0 ? Math.round(d / 60) : undefined);
      };
      media.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(undefined);
      };
      media.src = url;
    });
  };

  const handleStart = async () => {
    if (!file || !lessonId) return;
    setErrorMsg(null);
    setDonePath(null);
    setUploadPct(0);
    setUploadedFiles(0);
    setTotalFiles(0);
    setEncodePct(0);

    try {
      setStage('preparing');
      const ffmpeg = await loadFFmpeg();

      // 1) Generate AES-128 key (16 random bytes)
      const keyBytes = crypto.getRandomValues(new Uint8Array(16));
      await ffmpeg.writeFile('lesson.key', keyBytes);

      // 2) key info file: line1 = key URI, line2 = local key file, line3 = (empty => IV auto)
      const keyInfo = `/api/hls/key/${lessonId}\nlesson.key\n\n`;
      await ffmpeg.writeFile('keyinfo.txt', new TextEncoder().encode(keyInfo));

      // 3) Input video
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      const durationMinutes = await readVideoDuration(file);

      setStage('encoding');
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '27',
        '-profile:v', 'main',
        '-vf', 'scale=-2:720',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-ac', '2',
        '-hls_time', '10',
        '-hls_playlist_type', 'vod',
        '-hls_key_info_file', 'keyinfo.txt',
        '-hls_segment_filename', 'seg%03d.ts',
        'index.m3u8',
      ]);

      // 4) Read outputs
      const m3u8Raw = (await ffmpeg.readFile('index.m3u8')) as any;
      const m3u8 = typeof m3u8Raw === 'string' ? m3u8Raw : new TextDecoder().decode(m3u8Raw);
      const hasAes = m3u8.includes('EXT-X-KEY:METHOD=AES-128');
      const hasSegments = /#EXTINF/.test(m3u8);
      if (!hasAes || !hasSegments) {
        console.error('m3u8 output:', m3u8.slice(0, 500), m3u8Raw);
        throw new Error('الناتج لا يحتوي على تشفير AES — تأكد من أن الفيديو قابل للمعالجة.');
      }

      const segNames = m3u8
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && l.endsWith('.ts') && !l.includes('/'));

      const segments: { name: string; data: Uint8Array }[] = [];
      const missing: string[] = [];
      for (const name of segNames) {
        try {
          const raw = (await ffmpeg.readFile(name)) as any;
          const data = typeof raw === 'string' ? new TextEncoder().encode(raw) : (raw as Uint8Array);
          segments.push({ name, data });
        } catch {
          missing.push(name);
        }
      }
      if (segments.length === 0) {
        let dirList = '—';
        try {
          dirList = ((await ffmpeg.listDir('/')) as { name?: string }[])
            .map((e) => e.name)
            .filter(Boolean)
            .join('، ');
        } catch {}
        const tail = ffmpegLogRef.current.split('\n').filter(Boolean).slice(-8).join('\n');
        throw new Error(
          `لم يتم إنتاج مقاطع فيديو من الملف. ${missing.length ? `المفقودة: ${missing.slice(0, 5).join('، ')}. ` : ''}الموجودة في الذاكرة: ${dirList}.${tail ? `\nأحدث لوجات ffmpeg:\n${tail}` : ''}`
        );
      }
      const keyRaw = (await ffmpeg.readFile('lesson.key')) as any;
      const keyBin = typeof keyRaw === 'string' ? new TextEncoder().encode(keyRaw) : (keyRaw as Uint8Array);

      // 5) Upload everything to Vercel Blob (public store = encrypted chunks + manifest)
      setStage('uploading');
      const base = `lessons/${lessonId}/hls`;
      const allFiles: { name: string; data: Uint8Array; contentType: string }[] = [
        ...segments.map((s) => ({ name: s.name, data: s.data, contentType: 'video/mp2t' })),
        { name: 'key.bin', data: keyBin, contentType: 'application/octet-stream' },
        { name: 'index.m3u8', data: new TextEncoder().encode(m3u8), contentType: 'application/vnd.apple.mpegurl' },
      ];
      setTotalFiles(allFiles.length);

      const totalBytes = allFiles.reduce((acc, f) => acc + f.data.length, 0);
      let uploadedBytes = 0;

      for (let i = 0; i < allFiles.length; i++) {
        const f = allFiles[i];
        const ab = new ArrayBuffer(f.data.byteLength);
        new Uint8Array(ab).set(f.data);
        const blobFile = new Blob([ab], { type: f.contentType });
        await upload(`${base}/${f.name}`, blobFile, {
          access: 'public',
          handleUploadUrl: '/api/hls/upload',
        });
        uploadedBytes += f.data.length;
        setUploadPct(Math.round((uploadedBytes / totalBytes) * 100));
        setUploadedFiles(i + 1);
      }

      const hlsPath = `${base}/index.m3u8`;
      setDonePath(hlsPath);
      setUploadPct(100);
      setStage('done');
      onReady({ hlsPath, durationMinutes });
    } catch (err: any) {
      console.error('Encode/upload error:', err);
      setStage('error');
      const raw = String(err?.message || err || '');
      const isTokenIssue =
        raw.includes('BLOB_READ_WRITE_TOKEN') || raw.includes('token') || raw.includes('ENV VAR');
      if (isTokenIssue) {
        let d: { rw?: boolean; rwLooksMasked?: boolean; oidc?: boolean; vercelEnv?: string } | null = null;
        try {
          d = await (await fetch('/api/hls/upload')).json();
        } catch {}
        if (!d?.rw && !d?.oidc) {
          setErrorMsg(
            `خادم النشر لا يمتلك بيانات اعتماد التخزين — المتغير لم يصِل للنسخة المنشورة. تأكد من:\n1) BLOB_READ_WRITE_TOKEN موجود في Settings ← Environment Variables مع تفعيل Production.\n2) نفّذت Redeploy من تبويب Deployments آخر مرة.\n(البيئة الحالية: ${d?.vercelEnv ?? 'غير معروفة'})`
          );
        } else if (d?.rwLooksMasked) {
          setErrorMsg(
            'قيمة BLOB_READ_WRITE_TOKEN محفوظة بشكل مقنّع (****) — هذه ليست قيمة حقيقية. امسح المتغير وأعد إضافته بقيمة منسوخة من صفحة المخزن (Storage)، ثم نفّذ Redeploy.'
          );
        } else {
          setErrorMsg(
            `التخزين متصل جزئياً لكن الرفع فشل. أرسل تفاصيل الخطأ كاملة إن أمكن: ${raw}\nالتشخيص: ${JSON.stringify(d ?? {})}`
          );
        }
      } else if (raw.includes('abort') && raw.includes('overload')) {
        setErrorMsg('الملف أكبر من سعة معالجة المتصفح. قلّل حجم الملف أو الدقة ثم أعد المحاولة.');
      } else {
        setErrorMsg(raw || 'خطأ غير متوقع أثناء التشفير أو الرفع.');
      }
    }
  };

  const ContentTypeIcon = stage === 'done' ? CheckCircle2 : FileVideo;
  const isBusy = stage === 'preparing' || stage === 'encoding' || stage === 'uploading';

  return (
    <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-black text-emerald-950">
            رفع فيديو مباشر (تشفير تلقائي وحماية كاملة)
          </p>
          <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
            اختار ملف المحاضرة من جهازك، والنظام يغيره ويشفّره ويأمّنه تلقائياً للطلاب. لا يُترك أي ملف خام قابل للتحميل.
          </p>
        </div>
      </div>

      {stage === 'idle' && !file && (
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
              e.target.value = '';
            }}
          />
          <div className="flex items-center justify-center gap-2 py-6 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors">
            <Upload className="w-5 h-5" />
            <span className="text-xs font-bold">اضغط لاختيار ملف الفيديو من جهازك</span>
          </div>
        </label>
      )}

      {stage === 'idle' && file && (
        <div className="py-6 text-center space-y-3">
          <ContentTypeIcon className="w-10 h-10 mx-auto text-emerald-700" />
          <p className="text-sm font-bold text-emerald-950 break-all px-2">{file.name}</p>
          <p className="text-[11px] text-emerald-800/70 font-medium">
            {Math.round(file.size / 1024 / 1024)} MB • جاهز للتشفير الآمن
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            <button
              type="button"
              onClick={handleStart}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4" />
              <span>بدء التشفير والرفع</span>
            </button>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="px-4 py-2.5 bg-white border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-all"
            >
              اختيار ملف آخر
            </button>
          </div>
        </div>
      )}

      {isBusy && (
        <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-emerald-800 animate-spin shrink-0" />
            <div className="text-xs font-bold text-emerald-950">
              {stage === 'preparing' && 'تحميل محرك التشفير (مرة واحدة)...'}
              {stage === 'encoding' && `جاري تشفير المحاضرة وحمايتها... ${encodePct}%`}
              {stage === 'uploading' && `جاري رفع المقاطع المشفّرة... ${uploadPct}% (الملف ${Math.min(uploadedFiles + 1, totalFiles)} من ${totalFiles})`}
            </div>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-800 to-emerald-500 transition-all duration-300"
              style={{ width: `${stage === 'uploading' ? uploadPct : stage === 'encoding' ? encodePct : 15}%` }}
            />
          </div>
          {stage === 'encoding' && ffmpegNote && (
            <p className="text-[10px] text-emerald-800/60 font-mono text-left" dir="ltr">
              {ffmpegNote}
            </p>
          )}
          <p className="text-[10px] text-emerald-800/60">
            لا تغلق الصفحة أثناء التشفير. كل ما في الفيديو بيتشفّر ولا يتبقى ملف خام.
          </p>
        </div>
      )}

      {stage === 'done' && donePath && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-center space-y-1.5">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-700" />
          <p className="text-sm font-black text-emerald-950">تم تشفير المحاضرة ورفعها بنجاح ✓</p>
          <p className="text-[11px] text-emerald-800/80 font-mono break-all" dir="ltr">{donePath}</p>
        </div>
      )}

      {stage === 'error' && errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertCircle className="w-7 h-7 mx-auto text-red-600 mb-1" />
          <p className="text-xs font-bold text-red-800 whitespace-pre-line">{errorMsg}</p>
          <button
            type="button"
            onClick={() => { setStage('idle'); setErrorMsg(null); }}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold rounded-lg transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
}