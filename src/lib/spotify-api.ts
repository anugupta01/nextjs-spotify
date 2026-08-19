import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyCategory,
  SpotifyPaginatedResponse,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifyRecentTrack,
  SpotifySearchResponse,
  SpotifyTrack,
  SpotifyUser,
  PlayRequest,
} from '@/types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';
const DEFAULT_LIMIT = 20;

let _getToken: (() => string | null) | null = null;

export function setTokenGetter(fn: () => string | null) {
  _getToken = fn;
}

async function spotifyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = _getToken?.();
  if (!token) throw new Error('No access token');

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (res.status === 204 || res.status === 202) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err?.error?.message || 'Spotify API error'), { status: res.status });
  }

  return res.json();
}

// User
export const getMe = (): Promise<SpotifyUser> => spotifyFetch('/me');

// Playlists
export const getUserPlaylists = (params: Record<string, string | number> = { limit: DEFAULT_LIMIT }) =>
  spotifyFetch<SpotifyPaginatedResponse<SpotifyPlaylist>>(
    `/me/playlists?${new URLSearchParams(params as Record<string, string>)}`
  );

export const getPlaylist = (playlistId: string): Promise<SpotifyPlaylist> =>
  spotifyFetch(`/playlists/${playlistId}`);

export const getPlaylistTracks = (
  playlistId: string,
  params: Record<string, string | number> = { limit: DEFAULT_LIMIT }
): Promise<SpotifyPaginatedResponse<SpotifyPlaylistTrack>> =>
  spotifyFetch(`/playlists/${playlistId}/tracks?${new URLSearchParams(params as Record<string, string>)}`);

// Albums
export const getAlbum = (albumId: string): Promise<SpotifyAlbum> =>
  spotifyFetch(`/albums/${albumId}`);

export const getUserSavedAlbums = (params: Record<string, string | number> = { limit: DEFAULT_LIMIT }) =>
  spotifyFetch<SpotifyPaginatedResponse<{ album: SpotifyAlbum; added_at: string }>>(
    `/me/albums?${new URLSearchParams(params as Record<string, string>)}`
  );

// Artists
export const getArtist = (artistId: string): Promise<SpotifyArtist> =>
  spotifyFetch(`/artists/${artistId}`);

export const getArtistTopTracks = (artistId: string, market: string): Promise<{ tracks: SpotifyTrack[] }> =>
  spotifyFetch(`/artists/${artistId}/top-tracks?market=${market}`);

// Browse
export const getFeaturedPlaylists = (params: Record<string, string | number> = { limit: DEFAULT_LIMIT }) =>
  spotifyFetch<{ playlists: SpotifyPaginatedResponse<SpotifyPlaylist>; message?: string }>(
    `/browse/featured-playlists?${new URLSearchParams(params as Record<string, string>)}`
  );

export const getAllCategories = (params: Record<string, string | number> = { limit: DEFAULT_LIMIT }) =>
  spotifyFetch<{ categories: SpotifyPaginatedResponse<SpotifyCategory> }>(
    `/browse/categories?${new URLSearchParams(params as Record<string, string>)}`
  );

export const getCategoryPlaylists = (
  categoryId: string,
  params: Record<string, string | number> = { limit: DEFAULT_LIMIT }
) =>
  spotifyFetch<{ playlists: SpotifyPaginatedResponse<SpotifyPlaylist> }>(
    `/browse/categories/${categoryId}/playlists?${new URLSearchParams(params as Record<string, string>)}`
  );

// Search
export const search = (
  term: string,
  params: Record<string, string | number> = { limit: DEFAULT_LIMIT }
): Promise<SpotifySearchResponse> => {
  const p = new URLSearchParams({ ...params as Record<string, string>, q: term, type: 'track,artist,album,playlist' });
  return spotifyFetch(`/search?${p}`);
};

// Tracks
export const getUserSavedTracks = (params: Record<string, string | number> = { limit: DEFAULT_LIMIT }) =>
  spotifyFetch<SpotifyPaginatedResponse<{ track: SpotifyTrack; added_at: string }>>(
    `/me/tracks?${new URLSearchParams(params as Record<string, string>)}`
  );

export const checkSavedTracks = (ids: string[]): Promise<boolean[]> =>
  spotifyFetch(`/me/tracks/contains?ids=${ids.join(',')}`);

export const saveTracks = (ids: string[]): Promise<void> =>
  spotifyFetch(`/me/tracks`, { method: 'PUT', body: JSON.stringify({ ids }) });

export const removeTracks = (ids: string[]): Promise<void> =>
  spotifyFetch(`/me/tracks`, { method: 'DELETE', body: JSON.stringify({ ids }) });

export const getAudioAnalysis = (trackId: string) =>
  spotifyFetch<unknown>(`/audio-analysis/${trackId}`);

// Player
export const getRecentlyPlayed = (params: Record<string, string | number> = { limit: DEFAULT_LIMIT }) =>
  spotifyFetch<{ items: SpotifyRecentTrack[]; next: string | null }>(
    `/me/player/recently-played?${new URLSearchParams(params as Record<string, string>)}`
  );

export const transferPlayback = (deviceId: string): Promise<void> =>
  spotifyFetch(`/me/player`, {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId] }),
  });

export const play = (request: PlayRequest): Promise<void> =>
  spotifyFetch(`/me/player/play`, { method: 'PUT', body: JSON.stringify(request) });

export const pause = (): Promise<void> =>
  spotifyFetch(`/me/player/pause`, { method: 'PUT', body: '{}' });

export const togglePlay = (isPlaying: boolean, request: PlayRequest): Promise<void> =>
  isPlaying ? pause() : play(request);

export const seek = (positionMs: number): Promise<void> =>
  spotifyFetch(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT', body: '{}' });

export const setVolume = (volumePercent: number): Promise<void> =>
  spotifyFetch(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT', body: '{}' });
