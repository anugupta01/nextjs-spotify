'use client';
import React from 'react';
import Image from 'next/image';

interface MediaSummaryProps {
  type?: 'Album' | 'Playlist' | 'Artist';
  title?: string;
  description?: string | null;
  artist?: string;
  trackCount?: number;
  likesCount?: number;
  followerCount?: number;
  imageUrl?: string;
  releaseDate?: string;
}

export function MediaSummary({
  type,
  title,
  description,
  artist,
  trackCount,
  likesCount,
  followerCount,
  imageUrl,
  releaseDate,
}: MediaSummaryProps) {
  return (
    <div className="flex gap-6 items-end py-8 px-8">
      <div className="flex-shrink-0 w-48 h-48 shadow-xl rounded overflow-hidden bg-spotify-highlight">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title ?? ''}
            width={192}
            height={192}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        {type && <span className="text-xs uppercase font-bold text-white">{type}</span>}
        <h1 className="text-4xl font-black text-white truncate">{title}</h1>
        {description && (
          <div
            className="text-sm text-white/60 mt-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <div className="flex items-center gap-2 mt-2 text-sm text-white/60 flex-wrap">
          {artist && <span className="font-bold text-white">{artist}</span>}
          {likesCount !== undefined && (
            <span className="before:content-['·'] before:mr-2">{likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}</span>
          )}
          {releaseDate && (
            <span className="before:content-['·'] before:mr-2">{new Date(releaseDate).getFullYear()}</span>
          )}
          {trackCount !== undefined && (
            <span className="before:content-['·'] before:mr-2">{trackCount.toLocaleString()} {trackCount === 1 ? 'song' : 'songs'}</span>
          )}
          {followerCount !== undefined && (
            <span className="before:content-['·'] before:mr-2">{followerCount.toLocaleString()} {followerCount === 1 ? 'follower' : 'followers'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
