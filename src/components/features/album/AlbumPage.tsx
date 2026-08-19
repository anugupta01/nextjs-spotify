'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SpotifyAlbum } from '@/types/spotify';
import { getAlbum, play as apiPlay, pause as apiPause } from '@/lib/spotify-api';
import { useSavedTracksStore } from '@/store/saved-tracks-store';
import { usePlaybackStore } from '@/store/playback-store';
import { MediaSummary } from '@/components/ui/MediaSummary';
import { PlayButton } from '@/components/ui/PlayButton';
import { LikeButton } from '@/components/ui/LikeButton';
import { Spinner } from '@/components/ui/Spinner';
import { SvgIcon } from '@/components/Icons';
import { formatDuration } from '@/lib/utils';

export function AlbumPage({ albumId }: { albumId: string }) {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSaved = useSavedTracksStore((s) => s.checkSaved);
  const savedMap = useSavedTracksStore((s) => s.savedMap);
  const playbackState = usePlaybackStore((s) => s.playbackState);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const isAlbumPlaying = isPlaying && playbackState?.context?.uri === album?.uri;

  useEffect(() => {
    setIsLoading(true);
    getAlbum(albumId)
      .then((al) => {
        setAlbum(al);
        const ids = al.tracks.items.map((t) => t.id).filter(Boolean);
        if (ids.length) checkSaved(ids);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [albumId, checkSaved]);

  const toggleAlbum = async () => {
    if (!album) return;
    if (isAlbumPlaying) {
      await apiPause();
    } else {
      await apiPlay({ context_uri: album.uri });
    }
  };

  const playTrack = async (index: number) => {
    if (!album) return;
    await apiPlay({ context_uri: album.uri, offset: { position: index } });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }
  if (!album) return null;

  return (
    <div>
      <MediaSummary
        type="Album"
        title={album.name}
        imageUrl={album.images[0]?.url}
        artist={album.artists[0]?.name}
        trackCount={album.tracks.total}
        releaseDate={album.release_date}
      />

      <div className="px-8 pt-4 pb-6">
        <PlayButton isPlaying={isAlbumPlaying} onToggle={toggleAlbum} large primary />
      </div>

      <div className="px-8">
        {/* Header */}
        <div className="grid gap-4 px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
          style={{ gridTemplateColumns: '16px 4fr 50px' }}>
          <div>#</div>
          <div>Title</div>
          <div className="flex justify-end"><SvgIcon name="clock" size={14} /></div>
        </div>

        {album.tracks.items.map((track, idx) => {
          const isTrackPlaying = isPlaying && playbackState?.track_window?.current_track?.id === track.id;
          return (
            <div
              key={track.id}
              className="grid gap-4 px-4 py-3 rounded hover:bg-white/5 group cursor-default items-center"
              style={{ gridTemplateColumns: '16px 4fr 50px' }}
              onDoubleClick={() => playTrack(idx)}
            >
              <div className="text-sm text-white/50 group-hover:hidden">
                {isTrackPlaying
                  ? <SvgIcon name="audio-animated" size={14} className="text-spotify-green" />
                  : idx + 1}
              </div>
              <div className="hidden group-hover:flex">
                <PlayButton
                  isPlaying={isTrackPlaying}
                  onToggle={() => playTrack(idx)}
                  className="w-4 h-4 text-white"
                />
              </div>

              <div className="min-w-0">
                <div className={`text-sm font-medium truncate ${isTrackPlaying ? 'text-spotify-green' : 'text-white'}`}>
                  {track.name}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {track.artists.map((artist, i) => (
                    <React.Fragment key={artist.id}>
                      {i > 0 && <span className="text-xs text-white/50">,</span>}
                      <Link
                        href={`/artist/${artist.id}`}
                        className="text-xs text-white/50 hover:text-white hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {artist.name}
                      </Link>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <LikeButton trackId={track.id} />
                </div>
                <span className="text-sm text-white/50 tabular-nums">{formatDuration(track.duration_ms)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
