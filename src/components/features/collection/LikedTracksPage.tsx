'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserSavedTracks, play as apiPlay, pause as apiPause } from '@/lib/spotify-api';
import { usePlaybackStore } from '@/store/playback-store';
import { useSavedTracksStore } from '@/store/saved-tracks-store';
import { Spinner } from '@/components/ui/Spinner';
import { PlayButton } from '@/components/ui/PlayButton';
import { LikeButton } from '@/components/ui/LikeButton';
import { SvgIcon } from '@/components/Icons';
import { formatDuration } from '@/lib/utils';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface SavedTrackItem {
  added_at: string;
  track: {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    album: { id: string; name: string; images: { url: string }[] };
    artists: { id: string; name: string }[];
  };
}

const LIMIT = 50;
const COLLECTION_URI = 'spotify:user:liked';

export function LikedTracksPage() {
  const [tracks, setTracks] = useState<SavedTrackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const playbackState = usePlaybackStore((s) => s.playbackState);
  const checkSaved = useSavedTracksStore((s) => s.checkSaved);

  const isCollectionPlaying =
    isPlaying &&
    (playbackState?.context?.uri?.includes('liked') ||
      playbackState?.context?.uri?.includes('tracks'));

  useEffect(() => {
    getUserSavedTracks({ limit: LIMIT, offset: 0 })
      .then((res) => {
        const items = res.items as unknown as SavedTrackItem[];
        setTracks(items);
        setTotal(res.total);
        setHasMore(res.next !== null);
        setOffset(LIMIT);
        const ids = items.map((i) => i.track.id).filter(Boolean);
        if (ids.length) checkSaved(ids);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [checkSaved]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getUserSavedTracks({ limit: LIMIT, offset });
      const newItems = res.items as unknown as SavedTrackItem[];
      setTracks((prev) => [...prev, ...newItems]);
      setHasMore(res.next !== null);
      setOffset((o) => o + LIMIT);
      const ids = newItems.map((i) => i.track.id).filter(Boolean);
      if (ids.length) checkSaved(ids);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, offset, checkSaved]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isLoadingMore);

  const toggleCollection = async () => {
    if (isCollectionPlaying) await apiPause();
    else await apiPlay({ context_uri: 'spotify:user::collection' });
  };

  const playTrack = async (index: number) => {
    await apiPlay({
      context_uri: 'spotify:user::collection',
      offset: { position: index },
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      {/* Liked Songs Header */}
      <div className="flex gap-6 items-end py-8 px-8 bg-gradient-to-b from-indigo-900/60 to-transparent">
        <div className="w-48 h-48 flex-shrink-0 rounded shadow-xl overflow-hidden bg-gradient-to-br from-indigo-700 to-white/10 flex items-center justify-center">
          <SvgIcon name="heart-fill" size={80} className="text-white" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-white">Playlist</span>
          <h1 className="text-5xl font-black text-white mt-1 mb-2">Liked Songs</h1>
          <p className="text-white/60 text-sm">{total.toLocaleString()} songs</p>
        </div>
      </div>

      <div className="px-8 py-4">
        <PlayButton
          isPlaying={isCollectionPlaying}
          onToggle={toggleCollection}
          large
          primary
        />
      </div>

      <div className="px-8">
        {/* Table Header */}
        <div
          className="grid gap-4 px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
          style={{ gridTemplateColumns: '16px 4fr 2fr 1fr 50px' }}
        >
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Date added</div>
          <div className="flex justify-end"><SvgIcon name="clock" size={14} /></div>
        </div>

        {tracks.map((item, idx) => {
          const track = item.track;
          const isTrackPlaying =
            isPlaying && playbackState?.track_window?.current_track?.id === track.id;

          return (
            <div
              key={`${track.id}-${idx}`}
              className="grid gap-4 px-4 py-2 rounded hover:bg-white/5 group cursor-default items-center"
              style={{ gridTemplateColumns: '16px 4fr 2fr 1fr 50px' }}
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

              <div className="flex items-center gap-3 min-w-0">
                {track.album.images?.[0]?.url && (
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
                  <div className="flex gap-1 flex-wrap">
                    {track.artists.map((a, i) => (
                      <React.Fragment key={a.id}>
                        {i > 0 && <span className="text-xs text-white/50">,</span>}
                        <Link
                          href={`/artist/${a.id}`}
                          className="text-xs text-white/50 hover:text-white hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {a.name}
                        </Link>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={`/albums/${track.album.id}`}
                className="text-sm text-white/50 hover:text-white hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {track.album.name}
              </Link>

              <div className="text-sm text-white/50">
                {item.added_at
                  ? new Date(item.added_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                  : ''}
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <LikeButton trackId={track.id} />
                </div>
                <span className="text-sm text-white/50 tabular-nums">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={sentinelRef} className="h-4" />
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
