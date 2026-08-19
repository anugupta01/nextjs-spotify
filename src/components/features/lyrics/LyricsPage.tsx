'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { useLyricsStore } from '@/store/lyrics-store';
import { usePlaybackStore } from '@/store/playback-store';
import { seek as apiSeek } from '@/lib/spotify-api';
import { Spinner } from '@/components/ui/Spinner';
import { LyricLine } from '@/types/spotify';

interface LyricsViewProps {
  lyrics: LyricLine[];
  activeLine: number;
  isSynced: boolean;
  onSeekTo: (ms: number) => void;
}

function LyricsView({ lyrics, activeLine, isSynced, onSeekTo }: LyricsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLine < 0 || !activeRef.current || !containerRef.current) return;
    activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLine]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-8 py-6 space-y-1"
      style={{ scrollbarWidth: 'thin' }}
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeLine;
        const isPast = idx < activeLine;

        return (
          <div
            key={idx}
            ref={isActive ? activeRef : null}
            onClick={() => {
              if (isSynced && line.time !== null) onSeekTo(line.time);
            }}
            className={[
              'py-1 px-2 rounded transition-all duration-300 leading-relaxed',
              isSynced && line.time !== null ? 'cursor-pointer' : '',
              isActive
                ? 'text-white font-bold text-2xl'
                : isPast
                ? 'text-white/30 text-xl'
                : 'text-white/50 text-xl',
              isSynced && line.time !== null ? 'hover:text-white/80' : '',
            ].join(' ')}
          >
            {line.text || <span className="select-none">♪</span>}
          </div>
        );
      })}
    </div>
  );
}

export function LyricsPage() {
  const {
    lyrics,
    activeLine,
    isSynced,
    status,
    setShownAsPiP,
    setFirstTime,
    setVisibility,
  } = useLyricsStore();
  const currentTrack = usePlaybackStore((s) => s.currentTrack);

  // Mark as full-page (not PiP) on mount
  useEffect(() => {
    setFirstTime(false);
    setShownAsPiP(false);
    setVisibility({ isVisible: true });
  }, [setFirstTime, setShownAsPiP, setVisibility]);

  const handleSeekTo = useCallback((ms: number) => {
    apiSeek(ms).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Lyrics</h1>
          {currentTrack && (
            <p className="text-white/50 text-sm mt-1">
              {currentTrack.name}
              {currentTrack.artists[0] && ` · ${currentTrack.artists[0].name}`}
            </p>
          )}
        </div>
        {isSynced && (
          <span className="text-xs text-spotify-green font-medium px-2 py-1 border border-spotify-green rounded-full">
            Synced
          </span>
        )}
      </div>

      {/* Content */}
      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 text-lg">No lyrics found</p>
            {currentTrack && (
              <p className="text-white/30 text-sm mt-2">
                We couldn&apos;t find lyrics for &ldquo;{currentTrack.name}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {status === 'idle' && !currentTrack && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-lg">Play a track to see lyrics</p>
        </div>
      )}

      {status === 'loaded' && lyrics && lyrics.length > 0 && (
        <LyricsView
          lyrics={lyrics}
          activeLine={activeLine}
          isSynced={isSynced}
          onSeekTo={handleSeekTo}
        />
      )}
    </div>
  );
}
