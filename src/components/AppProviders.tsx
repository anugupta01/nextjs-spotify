'use client';
import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePlaylistsStore } from '@/store/playlists-store';
import { usePlaybackStore } from '@/store/playback-store';
import { useLyricsStore } from '@/store/lyrics-store';
import { setTokenGetter } from '@/lib/spotify-api';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUIStore } from '@/store/ui-store';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { initAuth, isReady, accessToken } = useAuthStore();
  const { loadPlaylists } = usePlaylistsStore();
  const { initPlaybackSDK } = usePlaybackStore();
  const { setShowUnauthorizedModal } = useUIStore();
  const sdkInitialized = useRef(false);
  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const prevTrackId = useRef<string | null>(null);

  // Wire token getter on mount
  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().accessToken);
    initAuth();
  }, [initAuth]);

  // Once auth is ready, load playlists + init playback SDK
  useEffect(() => {
    if (!isReady || !accessToken) return;
    loadPlaylists();
    if (!sdkInitialized.current) {
      sdkInitialized.current = true;
      const storedVolume = Number(localStorage.getItem('volume') ?? '0.5');
      const vol = isNaN(storedVolume) ? 0.5 : storedVolume;
      initPlaybackSDK(accessToken, vol).catch(console.error);
    }
  }, [isReady, accessToken, loadPlaylists, initPlaybackSDK]);

  // Auto-fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack) return;
    const trackId = currentTrack.id;
    if (trackId === prevTrackId.current) return;
    prevTrackId.current = trackId;
    const { currentTrackId, fetchLyrics } = useLyricsStore.getState();
    if (trackId !== currentTrackId) {
      fetchLyrics(currentTrack.name, currentTrack.artists[0]?.name ?? '', trackId ?? '');
    }
  }, [currentTrack]);

  // Interpolated active-line tracking — ticks every 100 ms
  useEffect(() => {
    const interval = setInterval(() => {
      const { lyrics, isSynced, setActiveLine } = useLyricsStore.getState();
      if (!lyrics || !isSynced) return;

      const { playbackState, stateTimestamp, isPlaying } = usePlaybackStore.getState();
      if (!playbackState) return;

      const position = isPlaying
        ? (playbackState.position ?? 0) + (Date.now() - stateTimestamp)
        : playbackState.position ?? 0;

      let activeIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
        const time = lyrics[i].time;
        if (time !== null && time <= position) activeIndex = i;
      }
      setActiveLine(activeIndex);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Intercept 401s to show unauthorized modal
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (...args) => {
      const res = await original(...args);
      if (res.status === 401) setShowUnauthorizedModal(true);
      return res;
    };
    return () => { window.fetch = original; };
  }, [setShowUnauthorizedModal]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-spotify-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-spotify-green rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Connecting to Spotify…</p>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
