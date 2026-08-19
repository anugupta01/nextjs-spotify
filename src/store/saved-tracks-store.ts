'use client';
import { create } from 'zustand';
import { checkSavedTracks, saveTracks, removeTracks } from '@/lib/spotify-api';

const BATCH_SIZE = 50;

interface SavedTracksState {
  savedMap: Record<string, boolean>;
  checkSaved: (ids: string[]) => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
}

export const useSavedTracksStore = create<SavedTracksState>((set, get) => ({
  savedMap: {},

  checkSaved: async (ids: string[]) => {
    const { savedMap } = get();
    const unchecked = ids.filter((id) => !(id in savedMap));
    if (unchecked.length === 0) return;

    // Batch into chunks of BATCH_SIZE
    const chunks: string[][] = [];
    for (let i = 0; i < unchecked.length; i += BATCH_SIZE) {
      chunks.push(unchecked.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      try {
        const results = await checkSavedTracks(chunk);
        const updates: Record<string, boolean> = {};
        chunk.forEach((id, i) => (updates[id] = !!results[i]));
        set((s) => ({ savedMap: { ...s.savedMap, ...updates } }));
      } catch {
        /* silent */
      }
    }
  },

  toggleSave: async (id: string) => {
    const { savedMap } = get();
    const currentlySaved = !!savedMap[id];
    const nextSaved = !currentlySaved;

    // Optimistic update
    set((s) => ({ savedMap: { ...s.savedMap, [id]: nextSaved } }));

    try {
      if (nextSaved) {
        await saveTracks([id]);
      } else {
        await removeTracks([id]);
      }
    } catch {
      // Revert on error
      set((s) => ({ savedMap: { ...s.savedMap, [id]: currentlySaved } }));
    }
  },
}));
