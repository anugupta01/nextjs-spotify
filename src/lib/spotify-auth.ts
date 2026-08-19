import { SpotifyTokenResponse } from '@/types/spotify';

const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
// Use your own Spotify Client ID below
const CLIENT_ID = 'd06c09470bb646ebb33f27616fb151fb';
const SCOPES = [
  'user-read-recently-played',
  'user-top-read',
  'user-read-playback-position',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-modify',
  'user-library-read',
  'user-read-email',
  'user-read-private',
];

const LOCALSTORAGE_KEYS = {
  CODE_VERIFIER: 'code_verifier',
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
  PATH: 'path',
} as const;

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(input))))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function createAuthorizeURL(): Promise<{ url: URL; codeVerifier: string }> {
  const codeVerifier = generateRandomString(128);
  const hash = await sha256(codeVerifier);
  const codeChallenge = base64encode(hash);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: `${window.location.origin}/`,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  const authUrl = new URL(SPOTIFY_AUTHORIZE_URL);
  authUrl.search = params.toString();
  return { url: authUrl, codeVerifier };
}

export async function redirectToAuthorize(): Promise<void> {
  const { url, codeVerifier } = await createAuthorizeURL();
  localStorage.setItem(LOCALSTORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  localStorage.setItem(LOCALSTORAGE_KEYS.PATH, window.location.pathname);
  window.location.href = url.toString();
}

export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
  const codeVerifier = localStorage.getItem(LOCALSTORAGE_KEYS.CODE_VERIFIER);
  if (!codeVerifier) throw new Error('Code verifier not found');

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${window.location.origin}/`,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Token exchange failed');
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Token refresh failed');
  return res.json();
}

export function saveTokensToStorage(tokenResponse: SpotifyTokenResponse, expiresAt: number): void {
  localStorage.setItem(LOCALSTORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
  localStorage.setItem(LOCALSTORAGE_KEYS.TOKEN_TYPE, tokenResponse.token_type);
  localStorage.setItem(LOCALSTORAGE_KEYS.EXPIRES_AT, String(expiresAt));
  if (tokenResponse.refresh_token) {
    localStorage.setItem(LOCALSTORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
  }
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(LOCALSTORAGE_KEYS.ACCESS_TOKEN),
    tokenType: localStorage.getItem(LOCALSTORAGE_KEYS.TOKEN_TYPE),
    refreshToken: localStorage.getItem(LOCALSTORAGE_KEYS.REFRESH_TOKEN),
    expiresAt: Number(localStorage.getItem(LOCALSTORAGE_KEYS.EXPIRES_AT)) || null,
    savedPath: localStorage.getItem(LOCALSTORAGE_KEYS.PATH),
  };
}

export function clearStoredTokens(): void {
  localStorage.removeItem(LOCALSTORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(LOCALSTORAGE_KEYS.TOKEN_TYPE);
  localStorage.removeItem(LOCALSTORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(LOCALSTORAGE_KEYS.EXPIRES_AT);
}

export function isTokenExpired(expiresAt: number | null): boolean {
  return !expiresAt || Date.now() >= expiresAt;
}
