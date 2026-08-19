'use client';
import { create } from 'zustand';
import {
  transferPlayback,
  play as apiPlay,
  pause as apiPause,
  seek as apiSeek,
  setVolume as apiSetVolume,
  getAudioAnalysis,
} from '@/lib/spotify-api';
import { getIdFromUri, getAlbumRouteUrl, getArtistRouteUrl, getPlaylistRouteUrl } from '@/lib/utils';

export interface TrackExtended extends Spotify.Track {
  albumUrl: string;
  playlistUrl: string;
  artists: (Spotify.Track['artists'][0] & { artistUrl: string })[];
}

interface AudioAnalysis {
  segments: { start: number; duration: number; [key: string]: unknown }[];
  beats?: { start: number; duration: number; [key: string]: unknown }[];
  track?: { tempo: number };
}

export interface PlaybackState {
  playbackState: Spotify.PlaybackState | null;
  player: Spotify.Player | null;
  deviceId: string | null;
  volume: number;
  analysis: AudioAnalysis | null;
  trackAnalysisId: string | null;
  isAnalysisLoading: boolean;
  stateTimestamp: number;

  // Derived
  currentTrack: TrackExtended | null;
  isPlaying: boolean;

  // Actions
  setPlayer: (player: Spotify.Player) => void;
  setDeviceId: (id: string) => void;
  setVolume: (vol: number) => void;
  setPlaybackState: (state: Spotify.PlaybackState) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (posMs: number) => void;
  updateVolume: (volume: number) => Promise<void>;
  loadAudioAnalysis: (trackId: string) => Promise<void>;
  initPlaybackSDK: (token: string, volume: number) => Promise<void>;
}

function buildTrackExtended(
  track: Spotify.Track,
  context: Spotify.PlaybackState['context'] | null
): TrackExtended {
  const albumId = getIdFromUri(track.album.uri);
  const albumUrl = getAlbumRouteUrl(albumId);
  const isPlaylist = context?.uri?.includes('playlist') ?? false;
  const playlistUrl = isPlaylist
    ? getPlaylistRouteUrl(getIdFromUri(context?.uri ?? ''))
    : '';

  return {
    ...track,
    albumUrl,
    playlistUrl,
    artists: track.artists.map((a) => ({
      ...a,
      artistUrl: getArtistRouteUrl(getIdFromUri(a.uri)),
    })),
  };
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  playbackState: null,
  player: null,
  deviceId: null,
  volume: 0.5,
  analysis: null,
  trackAnalysisId: null,
  isAnalysisLoading: false,
  stateTimestamp: Date.now(),
  currentTrack: null,
  isPlaying: false,

  setPlayer: (player) => set({ player }),
  setDeviceId: (id) => set({ deviceId: id }),
  setVolume: (vol) => set({ volume: vol }),

  setPlaybackState: (state) => {
    const track = state.track_window?.current_track as Spotify.Track | null | undefined;
    const currentTrack = track
      ? buildTrackExtended(track, state.context)
      : null;
    set({
      playbackState: state,
      currentTrack,
      isPlaying: !state.paused,
      stateTimestamp: Date.now(),
    });
  },

  togglePlay: () => { get().player?.togglePlay(); },
  next: () => { get().player?.nextTrack(); },
  prev: () => { get().player?.previousTrack(); },
  seekTo: (posMs) => { get().player?.seek(posMs); },

  updateVolume: async (volume: number) => {
    set({ volume });
    localStorage.setItem('volume', String(volume));
    await apiSetVolume(Math.floor(volume * 100));
  },

  loadAudioAnalysis: async (trackId: string) => {
    const { isAnalysisLoading, trackAnalysisId } = get();
    if (isAnalysisLoading || trackId === trackAnalysisId) return;

    set({ isAnalysisLoading: true });
    try {
      const analysis = (await getAudioAnalysis(trackId)) as AudioAnalysis;
      if (analysis.segments) {
        analysis.segments = analysis.segments.map((s) => ({
          ...s,
          start: s.start * 1000,
          duration: s.duration * 1000,
        }));
      }
      if (analysis.beats) {
        analysis.beats = analysis.beats.map((b) => ({
          ...b,
          start: b.start * 1000,
          duration: b.duration * 1000,
        }));
      }
      set({ analysis, trackAnalysisId: trackId, isAnalysisLoading: false });
    } catch {
      set({ isAnalysisLoading: false });
    }
  },

  initPlaybackSDK: async (token: string, volume: number) => {
    if (typeof window === 'undefined') return;

    // Wait for the SDK to signal it is ready via the promise we created
    // in the beforeInteractive stub in layout.tsx. This avoids the race
    // condition where the SDK fires onSpotifyWebPlaybackSDKReady before
    // React has mounted (which caused "onSpotifyWebPlaybackSDKReady is
    // not defined").
    await waitForSpotifySDK();

    const player = new window.Spotify.Player({
      name: 'Next.js Spotify Web Player',
      getOAuthToken: (cb) => cb(token),
      volume,
    });

    player.addListener('initialization_error', ({ message }) =>
      console.error('[Spotify] Init error:', message)
    );
    player.addListener('authentication_error', ({ message }) =>
      console.error('[Spotify] Auth error:', message)
    );
    player.addListener('account_error', ({ message }) => {
      console.error('[Spotify] Account error:', message);
      alert('Spotify Premium is required to use the web player.');
    });
    player.addListener('playback_error', ({ message }) =>
      console.error('[Spotify] Playback error:', message)
    );

    player.addListener('player_state_changed', async (state) => {
      if (!state) return;
      get().setPlaybackState(state);
      const vol = await player.getVolume();
      set({ volume: vol, stateTimestamp: Date.now() });

      // Update document title
      const track = state.track_window?.current_track;
      if (track) {
        const artist = track.artists[0]?.name ?? '';
        document.title = `Spotify — ${track.name}${artist ? ` · ${artist}` : ''}`;
      }

      // Load audio analysis for visualizer
      const trackId = state.track_window?.current_track?.id;
      if (!state.paused && trackId) {
        get().loadAudioAnalysis(trackId);
      }
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('[Spotify] Player ready, device:', device_id);
      set({ deviceId: device_id });
      transferPlayback(device_id).catch(console.error);
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.warn('[Spotify] Device went offline:', device_id);
    });

    const connected = await player.connect();
    if (!connected) {
      console.error('[Spotify] Failed to connect player');
      return;
    }

    set({ player });
  },
}));

/**
 * Returns a promise that resolves when the Spotify Web Playback SDK is ready.
 *
 * Uses window.__spotifySDKReady which is created by the beforeInteractive
 * inline script in layout.tsx BEFORE the SDK script loads. This guarantees
 * window.onSpotifyWebPlaybackSDKReady is always defined when the SDK fires it.
 *
 * Falls back to polling window.Spotify in case the SDK already loaded.
 */
function waitForSpotifySDK(): Promise<void> {
  // Already loaded (e.g. hot reload)
  if (typeof window !== 'undefined' && window.Spotify) {
    return Promise.resolve();
  }

  // Use the promise seeded by our beforeInteractive stub
  const w = window as typeof window & {
    __spotifySDKReady?: Promise<void>;
  };
  if (w.__spotifySDKReady) {
    return w.__spotifySDKReady;
  }

  // Final fallback: poll every 100ms (should never be needed)
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.Spotify) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

// --- Standalone player action helpers ---
export async function playContext(contextUri: string, offset?: { position: number }): Promise<void> {
  await apiPlay({ context_uri: contextUri, ...(offset ? { offset } : {}) });
}

export async function pausePlayback(): Promise<void> {
  await apiPause();
}

export async function seekPlayback(posMs: number): Promise<void> {
  await apiSeek(posMs);
}
