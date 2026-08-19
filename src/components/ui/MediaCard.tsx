'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { MediaCover } from './MediaCover';
import { PlayButton } from './PlayButton';
import { usePlaybackStore } from '@/store/playback-store';
import { getIdFromUri } from '@/lib/utils';

interface MediaCardProps {
  title: string;
  description?: string | null;
  imageUrl?: string;
  routerUrl: string;
  uri: string;
  roundedImage?: boolean;
  onTogglePlay?: (isPlaying: boolean) => void;
}

export function MediaCard({
  title,
  description,
  imageUrl,
  routerUrl,
  uri,
  roundedImage = false,
  onTogglePlay,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const playbackState = usePlaybackStore((s) => s.playbackState);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const contextUri = playbackState?.context?.uri ?? '';
  const isMediaPlaying = isPlaying && (contextUri === uri || getIdFromUri(contextUri) === getIdFromUri(uri));

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePlay?.(!isMediaPlaying);
  };

  return (
    <Link
      href={routerUrl}
      className="group block bg-spotify-highlight hover:bg-spotify-light-highlight rounded-lg p-4 transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-4">
        <MediaCover
          imageUrl={imageUrl}
          alt={title}
          rounded={roundedImage}
          size={160}
          className="w-full h-auto aspect-square"
        />
        {(isHovered || isMediaPlaying) && (
          <div
            className="absolute bottom-2 right-2"
            onClick={handleTogglePlay}
          >
            <PlayButton
              isPlaying={isMediaPlaying}
              onToggle={() => onTogglePlay?.(!isMediaPlaying)}
              large
              primary
            />
          </div>
        )}
      </div>
      <h3 className="font-bold text-white truncate text-sm">{title}</h3>
      {description && (
        <p className="text-white/50 text-xs mt-1 line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
