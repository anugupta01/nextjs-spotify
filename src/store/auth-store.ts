'use client';
import { create } from 'zustand';
import { SpotifyUser } from '@/types/spotify';
import {
  redirectToAuthorize,
  exchangeCodeForToken,
  refreshAccessToken,
  saveTokensToStorage,
  getStoredTokens,
  clearStoredTokens,
  isTokenExpired,
} from '@/lib/spotify-auth';
import { getMe, setTokenGetter } from '@/lib/spotify-api';

interface AuthState {
  user: SpotifyUser | null;
  accessToken: string | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isReady: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    set({ isLoading: true, error: null });

    // Register token getter with API client
    setTokenGetter(() => get().accessToken);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        // Handle first login (PKCE callback)
        const tokenResponse = await exchangeCodeForToken(code);
        const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
        saveTokensToStorage(tokenResponse, expiresAt);
        set({ accessToken: tokenResponse.access_token });

        // Clean URL
        const savedPath = localStorage.getItem('path') || '/';
        window.history.replaceState({}, '', savedPath);

        const user = await getMe();
        set({ user, isReady: true, isLoading: false });
        return;
      }

      // Check existing tokens
      const { accessToken, refreshToken, expiresAt, savedPath } = getStoredTokens();

      if (!accessToken || !refreshToken) {
        await redirectToAuthorize();
        return;
      }

      if (isTokenExpired(expiresAt)) {
        // Refresh token
        try {
          const tokenResponse = await refreshAccessToken(refreshToken);
          const newExpiresAt = Date.now() + tokenResponse.expires_in * 1000;
          saveTokensToStorage(tokenResponse, newExpiresAt);
          set({ accessToken: tokenResponse.access_token });
          const user = await getMe();
          set({ user, isReady: true, isLoading: false });
        } catch {
          clearStoredTokens();
          await redirectToAuthorize();
        }
        return;
      }

      // Valid token
      set({ accessToken });
      const user = await getMe();
      set({ user, isReady: true, isLoading: false });
      void savedPath; // referenced for future redirect logic
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auth error';
      if (message === 'UNAUTHORIZED') {
        clearStoredTokens();
        await redirectToAuthorize();
      } else {
        set({ error: message, isLoading: false });
      }
    }
  },

  logout: () => {
    clearStoredTokens();
    set({ user: null, accessToken: null, isReady: false });
    window.location.href = '/';
  },
}));


