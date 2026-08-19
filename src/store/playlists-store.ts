'use client';
import { create } from 'zustand';
import { SpotifyPlaylist } from '@/types/spotify';
import { getUserPlaylists } from '@/lib/spotify-api';

interface PlaylistsState {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  hasMore: boolean;
  offset: number;
  loadPlaylists: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const LIMIT = 20;

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  isLoading: false,
  hasMore: false,
  offset: 0,

  loadPlaylists: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, playlists: [], offset: 0 });
    try {
      const res = await getUserPlaylists({ limit: LIMIT, offset: 0 });
      set({
        playlists: res.items,
        hasMore: res.next !== null,
        offset: LIMIT,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { isLoading, hasMore, offset, playlists } = get();
    if (isLoading || !hasMore) return;
    set({ isLoading: true });
    try {
      const res = await getUserPlaylists({ limit: LIMIT, offset });
      set({
        playlists: [...playlists, ...res.items],
        hasMore: res.next !== null,
        offset: offset + LIMIT,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
