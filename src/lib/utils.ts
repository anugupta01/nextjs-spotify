export function formatDuration(durationInMs: number): string {
  const minutes = Math.floor(durationInMs / 60000);
  const seconds = Math.floor((durationInMs % 60000) / 1000);
  if (seconds === 60) return `${minutes + 1}:00`;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getIdFromUri(uri: string): string {
  return uri?.split(':').pop() ?? '';
}

export function getPlaylistRouteUrl(playlistId: string): string {
  return `/playlist/${playlistId}`;
}

export function getAlbumRouteUrl(albumId: string): string {
  return `/albums/${albumId}`;
}

export function getArtistRouteUrl(artistId: string): string {
  return `/artist/${artistId}`;
}

export function getPlaylistContextUri(playlistId: string): string {
  return `spotify:playlist:${playlistId}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
