'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyPlaylist, SpotifyPlaylistTrack } from '@/types/spotify';
import { getPlaylist, getPlaylistTracks, play as apiPlay, pause as apiPause } from '@/lib/spotify-api';
import { useSavedTracksStore } from '@/store/saved-tracks-store';
import { usePlaybackStore } from '@/store/playback-store';
import { MediaSummary } from '@/components/ui/MediaSummary';
import { PlayButton } from '@/components/ui/PlayButton';
import { LikeButton } from '@/components/ui/LikeButton';
import { Spinner } from '@/components/ui/Spinner';
import { SvgIcon } from '@/components/Icons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { formatDuration, getPlaylistContextUri } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const LIMIT = 50;

export function PlaylistPage({ playlistId }: { playlistId: string }) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyPlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracksLoading, setIsTracksLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const checkSaved = useSavedTracksStore((s) => s.checkSaved);
  const savedMap = useSavedTracksStore((s) => s.savedMap);
  const playbackState = usePlaybackStore((s) => s.playbackState);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const contextUri = getPlaylistContextUri(playlistId);
  const isPlaylistPlaying = isPlaying && playbackState?.context?.uri === contextUri;

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getPlaylist(playlistId),
      getPlaylistTracks(playlistId, { limit: LIMIT, offset: 0 }),
    ])
      .then(([pl, tracksRes]) => {
        setPlaylist(pl);
        setTracks(tracksRes.items);
        setHasMore(tracksRes.next !== null);
        setOffset(LIMIT);
        const ids = tracksRes.items
          .map((i) => i.track?.id)
          .filter((id): id is string => !!id);
        if (ids.length) checkSaved(ids);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [playlistId, checkSaved]);

  const loadMore = useCallback(async () => {
    if (isTracksLoading || !hasMore) return;
    setIsTracksLoading(true);
    try {
      const res = await getPlaylistTracks(playlistId, { limit: LIMIT, offset });
      const newTracks = [...tracks, ...res.items];
      setTracks(newTracks);
      setHasMore(res.next !== null);
      setOffset(offset + LIMIT);
      const ids = res.items.map((i) => i.track?.id).filter((id): id is string => !!id);
      if (ids.length) checkSaved(ids);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTracksLoading(false);
    }
  }, [isTracksLoading, hasMore, playlistId, offset, tracks, checkSaved]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isTracksLoading);

  const togglePlaylist = async (isCurrentlyPlaying: boolean) => {
    if (isCurrentlyPlaying) {
      await apiPause();
    } else {
      await apiPlay({ context_uri: contextUri });
    }
  };

  const playTrack = async (position: number) => {
    await apiPlay({ context_uri: contextUri, offset: { position } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div>
      <MediaSummary
        type="Playlist"
        title={playlist.name}
        imageUrl={playlist.images[0]?.url}
        description={playlist.description}
        artist={playlist.owner.display_name}
        trackCount={playlist.tracks.total}
        likesCount={playlist.followers?.total}
      />

      <div className="px-8 pt-4 pb-6">
        <PlayButton
          isPlaying={isPlaylistPlaying}
          onToggle={() => togglePlaylist(isPlaylistPlaying)}
          large
          primary
        />
      </div>

      <div className="px-8">
        {/* Table Header */}
        <div className="grid gap-4 px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
          style={{ gridTemplateColumns: '16px 4fr 2fr 1fr 50px' }}>
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Date added</div>
          <div className="flex justify-end"><SvgIcon name="clock" size={14} /></div>
        </div>

        {tracks.map((item, idx) => {
          if (!item.track) return null;
          const track = item.track;
          const isSaved = !!savedMap[track.id];
          const isTrackPlaying = isPlaying && playbackState?.track_window?.current_track?.id === track.id;

          return (
            <div
              key={`${track.id}-${idx}`}
              className="grid gap-4 px-4 py-2 rounded hover:bg-white/5 group cursor-default items-center"
              style={{ gridTemplateColumns: '16px 4fr 2fr 1fr 50px' }}
              onDoubleClick={() => playTrack(idx)}
            >
              <div className="text-sm text-white/50 group-hover:hidden">
                {isTrackPlaying ? <SvgIcon name="audio-animated" size={14} className="text-spotify-green" /> : idx + 1}
              </div>
              <div className="hidden group-hover:flex items-center">
                <PlayButton
                  isPlaying={isTrackPlaying}
                  onToggle={() => playTrack(idx)}
                  className="w-4 h-4 text-white"
                />
              </div>

              <div className="flex items-center gap-3 min-w-0">
                {track.album?.images?.[0]?.url && (
                  <Image
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded flex-shrink-0"
                    unoptimized
                  />
                )}
                <div className="min-w-0">
                  <div className={`text-sm font-medium truncate ${isTrackPlaying ? 'text-spotify-green' : 'text-white'}`}>
                    {track.name}
                  </div>
                  <div className="flex gap-1">
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
              </div>

              <Link
                href={`/albums/${track.album?.id}`}
                className="text-sm text-white/50 hover:text-white hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {track.album?.name}
              </Link>

              <div className="text-sm text-white/50">
                {item.added_at ? new Date(item.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <LikeButton trackId={track.id} />
                </div>
                <span className="text-sm text-white/50 tabular-nums">{formatDuration(track.duration_ms)}</span>
              </div>
            </div>
          );
        })}

        <div ref={sentinelRef} className="h-4" />
        {isTracksLoading && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
