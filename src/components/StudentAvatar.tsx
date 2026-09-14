"use client";

import { useState } from 'react';

export default function StudentAvatar({
  name,
  photoUrl,
  className = 'w-9 h-9',
  textClass = 'text-sm',
}: {
  name: string;
  photoUrl?: string;
  className?: string;
  textClass?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showPhoto = !!photoUrl && !broken;
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 text-white select-none ${className}`}>
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          draggable={false}
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className={`w-full h-full flex items-center justify-center font-black ${textClass}`}>
          {name.trim().charAt(0) || '؟'}
        </span>
      )}
    </span>
  );
}