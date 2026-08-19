'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getUserPlaylists, togglePlay } from '@/lib/spotify-api';
import { MediaCard } from '@/components/ui/MediaCard';
import { Spinner } from '@/components/ui/Spinner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const LIMIT = 30;

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    getUserPlaylists({ limit: LIMIT, offset: 0 })
      .then((res) => {
        setPlaylists(res.items);
        setHasMore(res.next !== null);
        setOffset(LIMIT);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const res = await getUserPlaylists({ limit: LIMIT, offset });
      setPlaylists((prev) => [...prev, ...res.items]);
      setHasMore(res.next !== null);
      setOffset((o) => o + LIMIT);
    } catch (e) {
      console.error(e);
    }
  }, [hasMore, offset]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isLoading);

  return (
    <div className="px-8 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">My Playlists</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <MediaCard
                key={playlist.id}
                title={playlist.name}
                description={playlist.description}
                imageUrl={playlist.images?.[0]?.url}
                routerUrl={`/playlist/${playlist.id}`}
                uri={playlist.uri}
                onTogglePlay={(playing) =>
                  togglePlay(playing, { context_uri: playlist.uri }).catch(console.error)
                }
              />
            ))}
          </div>
          <div ref={sentinelRef} className="h-4 mt-4" />
        </>
      )}
    </div>
  );
}
