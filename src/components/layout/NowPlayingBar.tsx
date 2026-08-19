'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlaybackStore } from '@/store/playback-store';
import { useLyricsStore } from '@/store/lyrics-store';
import { useVisualizerStore } from '@/store/visualizer-store';
import { useSavedTracksStore } from '@/store/saved-tracks-store';
import { SvgIcon } from '@/components/Icons';
import { PlayButton } from '@/components/ui/PlayButton';
import { LikeButton } from '@/components/ui/LikeButton';
import { formatDuration } from '@/lib/utils';
import { seek as apiSeek, setVolume as apiSetVolume } from '@/lib/spotify-api';

export function NowPlayingBar() {
  const { playbackState, isPlaying, currentTrack, volume, togglePlay, next, prev } = usePlaybackStore();
  const setVolume = usePlaybackStore((s) => s.setVolume);
  const { setVisibility: setLyricsVisibility, isVisible: lyricsVisible } = useLyricsStore();
  const { showPiPVisualizer, setShowPiP } = useVisualizerStore();

  const [localVolume, setLocalVolume] = useState(volume);
  const [isMuted, setIsMuted] = useState(false);
  const [beforeMutedVolume, setBeforeMutedVolume] = useState(0.5);
  const [localProgress, setLocalProgress] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const duration = playbackState?.duration ?? 0;
  const position = playbackState?.position ?? 0;

  // Sync volume
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Progress interpolation
  useEffect(() => {
    if (!playbackState) return;
    setLocalProgress(position);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!playbackState.paused && !isDraggingProgress) {
      const startTime = Date.now();
      const startPos = position;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setLocalProgress(Math.min(startPos + elapsed, duration));
      }, 200);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [playbackState, isDraggingProgress, position, duration]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalProgress(val);
    setIsDraggingProgress(true);
  };

  const handleProgressMouseUp = async (e: React.MouseEvent<HTMLInputElement>) => {
    const val = Number((e.target as HTMLInputElement).value);
    setIsDraggingProgress(false);
    await apiSeek(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) / 100;
    setLocalVolume(val);
    setVolume(val);
    setIsMuted(val === 0);

    if (volumeDebounceRef.current) clearTimeout(volumeDebounceRef.current);
    volumeDebounceRef.current = setTimeout(() => {
      apiSetVolume(Math.floor(val * 100));
    }, 50);
  };

  const toggleMute = async () => {
    if (localVolume > 0) {
      setBeforeMutedVolume(localVolume);
      setLocalVolume(0);
      setVolume(0);
      setIsMuted(true);
      await apiSetVolume(0);
    } else {
      setLocalVolume(beforeMutedVolume);
      setVolume(beforeMutedVolume);
      setIsMuted(false);
      await apiSetVolume(Math.floor(beforeMutedVolume * 100));
    }
  };

  const getVolumeIcon = () => {
    if (localVolume === 0 || isMuted) return 'volume-mute';
    if (localVolume >= 0.7) return 'volume-high';
    return 'volume-medium';
  };

  if (!currentTrack) {
    return (
      <footer className="h-[90px] border-t border-white/10 bg-spotify-dark flex items-center px-4">
        <div className="text-white/30 text-sm">No track playing</div>
      </footer>
    );
  }

  return (
    <footer className="h-[90px] border-t border-white/5 bg-spotify-dark flex items-center px-4 gap-4 z-50">
      {/* Left: Track info */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        {currentTrack.album.images[0]?.url && (
          <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={currentTrack.album.images[0].url}
              alt={currentTrack.album.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="min-w-0">
          <Link
            href={currentTrack.albumUrl}
            className="text-sm font-medium text-white hover:underline truncate block"
          >
            {currentTrack.name}
          </Link>
          <div className="flex gap-1 flex-wrap">
            {currentTrack.artists.map((artist, i) => (
              <React.Fragment key={artist.uri}>
                {i > 0 && <span className="text-xs text-white/50">,</span>}
                <Link
                  href={artist.artistUrl}
                  className="text-xs text-white/50 hover:text-white hover:underline"
                >
                  {artist.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
        {currentTrack.id && (
          <LikeButton trackId={currentTrack.id} />
        )}
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Previous"
          >
            <SvgIcon name="step-backward" size={20} />
          </button>
          <PlayButton
            isPlaying={isPlaying}
            onToggle={() => togglePlay()}
            large
            primary
          />
          <button
            onClick={next}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Next"
          >
            <SvgIcon name="step-forward" size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-xs text-white/50 w-10 text-right tabular-nums">
            {formatDuration(localProgress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={localProgress}
            onChange={handleProgressChange}
            onMouseUp={handleProgressMouseUp}
            className="flex-1 accent-spotify-green h-1 cursor-pointer"
            aria-label="Playback progress"
          />
          <span className="text-xs text-white/50 w-10 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right: Lyrics, Visualizer, Volume */}
      <div className="flex items-center gap-3 w-[30%] justify-end">
        <button
          onClick={() => setLyricsVisibility({ isVisible: !lyricsVisible })}
          className={`transition-colors ${lyricsVisible ? 'text-spotify-green' : 'text-white/50 hover:text-white'}`}
          title="Lyrics"
          aria-label="Toggle lyrics"
        >
          <SvgIcon name="mic" size={18} />
        </button>

        <button
          onClick={() => setShowPiP(!showPiPVisualizer)}
          className={`transition-colors ${showPiPVisualizer ? 'text-spotify-green' : 'text-white/50 hover:text-white'}`}
          title="Visualizer"
          aria-label="Toggle visualizer"
        >
          <SvgIcon name="audio-animated" size={18} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Toggle mute"
          >
            <SvgIcon name={getVolumeIcon()} size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(localVolume * 100)}
            onChange={handleVolumeChange}
            className="w-24 accent-spotify-green h-1 cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  );
}
