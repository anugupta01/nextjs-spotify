// Spotify API Types
export interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  type: string;
  href: string;
  external_urls: { spotify: string };
  images?: SpotifyImage[];
  followers?: { total: number };
  genres?: string[];
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
  release_date: string;
  artists: SpotifyArtist[];
  tracks: { total: number; items: SpotifyTrack[] };
  type: string;
  album_type?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  track_number: number;
  disc_number: number;
  explicit: boolean;
  preview_url: string | null;
  type: 'track';
  linked_from?: { id: string; uri: string };
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  track: SpotifyTrack | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  uri: string;
  images: SpotifyImage[];
  owner: { display_name: string; id: string };
  tracks: { total: number; items?: SpotifyPlaylistTrack[] };
  followers?: { total: number };
  type: 'playlist';
}

export interface SpotifyCategory {
  id: string;
  name: string;
  icons: SpotifyImage[];
  href: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  country: string;
  product: string;
  images: SpotifyImage[];
  followers: { total: number };
  type: 'user';
}

export interface SpotifyRecentTrack {
  track: SpotifyTrack;
  played_at: string;
  context: { type: string; uri: string } | null;
}

export interface SpotifyPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

export interface SpotifySearchResponse {
  tracks?: { items: SpotifyTrack[]; total: number; next: string | null };
  artists?: { items: SpotifyArtist[]; total: number; next: string | null };
  albums?: { items: SpotifyAlbum[]; total: number; next: string | null };
  playlists?: { items: SpotifyPlaylist[]; total: number; next: string | null };
}

export interface SpotifyPlaybackState {
  context: { uri: string; type: string } | null;
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: SpotifyWebPlaybackTrack;
    previous_tracks: SpotifyWebPlaybackTrack[];
    next_tracks: SpotifyWebPlaybackTrack[];
  };
  shuffle: boolean;
  repeat_mode: number;
}

export interface SpotifyWebPlaybackTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  album: {
    uri: string;
    name: string;
    images: SpotifyImage[];
  };
  artists: { uri: string; name: string }[];
  type: string;
}

export interface PlayRequest {
  context_uri?: string;
  uris?: string[];
  offset?: { position: number } | { uri: string };
}

export interface LyricLine {
  time: number | null;
  text: string;
}

export interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
  icon: string;
  iconSelected?: string;
}

export type VolumeIconType = 'volume-high' | 'volume-medium' | 'volume-mute';
