'use client';
import React from 'react';
import Image from 'next/image';

interface MediaCoverProps {
  imageUrl?: string;
  alt?: string;
  rounded?: boolean;
  className?: string;
  size?: number;
}

export function MediaCover({ imageUrl, alt = '', rounded = false, className = '', size = 200 }: MediaCoverProps) {
  if (!imageUrl) {
    return (
      <div
        className={`bg-spotify-highlight flex items-center justify-center ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 text-white/30">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        unoptimized
      />
    </div>
  );
}
