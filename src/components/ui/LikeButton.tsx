'use client';
import React from 'react';
import { SvgIcon } from '@/components/Icons';
import { useSavedTracksStore } from '@/store/saved-tracks-store';

export function LikeButton({ trackId }: { trackId: string }) {
  const savedMap = useSavedTracksStore((s) => s.savedMap);
  const toggleSave = useSavedTracksStore((s) => s.toggleSave);
  const isSaved = !!savedMap[trackId];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleSave(trackId);
      }}
      className={`transition-colors ${isSaved ? 'text-spotify-green' : 'text-white/50 hover:text-white'}`}
      aria-label={isSaved ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
    >
      <SvgIcon name={isSaved ? 'heart-fill' : 'heart'} size={18} />
    </button>
  );
}
