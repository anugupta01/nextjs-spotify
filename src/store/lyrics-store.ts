'use client';
import { create } from 'zustand';
import { LyricLine } from '@/types/spotify';

interface LyricsState {
  lyrics: LyricLine[] | null;
  isSynced: boolean;
  isVisible: boolean;
  isShownAsPiP: boolean;
  isFirstTime: boolean;
  status: 'idle' | 'loading' | 'loaded' | 'error';
  currentTrackId: string | null;
  activeLine: number;

  fetchLyrics: (trackName: string, artistName: string, trackId: string) => Promise<void>;
  setVisibility: (opts: { isVisible: boolean }) => void;
  setActiveLine: (idx: number) => void;
  setShownAsPiP: (pip: boolean) => void;
  setFirstTime: (v: boolean) => void;
}

// Parse LRC format from lrclib.net
function parseLrc(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(/^\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      result.push({ time: (minutes * 60 + seconds) * 1000, text });
    }
  }

  return result.length > 0 ? result : [];
}

function parsePlain(plain: string): LyricLine[] {
  return plain
    .split('\n')
    .map((text) => ({ time: null, text: text.trim() }))
    .filter((l) => l.text);
}

async function fetchFromLrclib(
  trackName: string,
  artistName: string
): Promise<{ lyrics: LyricLine[]; isSynced: boolean }> {
  const params = new URLSearchParams({ track_name: trackName, artist_name: artistName });
  const res = await fetch(`https://lrclib.net/api/get?${params}`);
  if (!res.ok) return { lyrics: [], isSynced: false };

  const data = await res.json();

  if (data.syncedLyrics) {
    return { lyrics: parseLrc(data.syncedLyrics), isSynced: true };
  }
  if (data.plainLyrics) {
    return { lyrics: parsePlain(data.plainLyrics), isSynced: false };
  }
  return { lyrics: [], isSynced: false };
}

export const useLyricsStore = create<LyricsState>((set) => ({
  lyrics: null,
  isSynced: false,
  isVisible: false,
  isShownAsPiP: false,
  isFirstTime: true,
  status: 'idle',
  currentTrackId: null,
  activeLine: -1,

  fetchLyrics: async (trackName, artistName, trackId) => {
    set({ status: 'loading' });
    try {
      const { lyrics, isSynced } = await fetchFromLrclib(trackName, artistName);
      set({
        lyrics: lyrics.length > 0 ? lyrics : null,
        isSynced,
        status: lyrics.length > 0 ? 'loaded' : 'error',
        currentTrackId: trackId,
        activeLine: -1,
      });
    } catch {
      set({ lyrics: null, isSynced: false, status: 'error', currentTrackId: trackId });
    }
  },

  setVisibility: ({ isVisible }) => {
    set((s) => ({
      isVisible,
      isShownAsPiP: false,
      isFirstTime: !isVisible,
      ...(isVisible ? {} : { activeLine: -1 }),
    }));
  },

  setActiveLine: (idx) => set({ activeLine: idx }),

  setShownAsPiP: (pip) => set({ isShownAsPiP: pip }),

  setFirstTime: (v) => set({ isFirstTime: v }),
}));
