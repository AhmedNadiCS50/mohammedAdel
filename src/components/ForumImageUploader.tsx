"use client";

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, X, AlertCircle } from 'lucide-react';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_BYTES = 4 * 1024 * 1024;

export default function ForumImageUploader({
  urls,
  onChange,
  max = 3,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    setError('');
    if (!files || files.length === 0) return;
    const toUpload = Array.from(files).slice(0, max - urls.length);
    if (toUpload.length === 0) return;

    for (const file of toUpload) {
      if (!ALLOWED.includes(file.type)) {
        setError('صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WebP أو GIF.');
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError('حجم الصورة أكبر من 4MB.');
        continue;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/uploads/image', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'فشل رفع الصورة.');
          continue;
        }
        onChange([...urls, data.url].slice(0, max));
      } catch {
        setError('تعذّر رفع الصورة. تحقق من الاتصال.');
      } finally {
        setUploading(false);
      }
    }
  };

  const remove = (url: string) => {
    onChange(urls.filter((u) => u !== url));
    setError('');
  };

  return (
    <div>
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {urls.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="مرفق"
                className="w-20 h-20 rounded-xl object-cover border border-gray-300"
                onError={(e) => { e.currentTarget.src = ''; e.currentTarget.classList.add('hidden'); }}
              />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
                aria-label="إزالة الصورة"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-600 mb-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      {urls.length < max && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 border border-dashed border-gray-300 hover:border-green-500 hover:text-green-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {uploading ? 'جاري الرفع…' : 'إضافة صورة'}
        </button>
      )}
    </div>
  );
}