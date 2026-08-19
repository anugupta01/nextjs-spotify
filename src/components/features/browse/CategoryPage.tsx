'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getCategoryPlaylists } from '@/lib/spotify-api';
import { togglePlay } from '@/lib/spotify-api';
import { MediaCard } from '@/components/ui/MediaCard';
import { Spinner } from '@/components/ui/Spinner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import Link from 'next/link';
import { SvgIcon } from '@/components/Icons';

const LIMIT = 24;

export function CategoryPage({ categoryId }: { categoryId: string }) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getCategoryPlaylists(categoryId, { limit: LIMIT, offset: 0 })
      .then((res) => {
        setPlaylists(res.playlists.items);
        setHasMore(res.playlists.next !== null);
        setOffset(LIMIT);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const res = await getCategoryPlaylists(categoryId, { limit: LIMIT, offset });
      setPlaylists((prev) => [...prev, ...res.playlists.items]);
      setHasMore(res.playlists.next !== null);
      setOffset((o) => o + LIMIT);
    } catch (e) {
      console.error(e);
    }
  }, [categoryId, hasMore, offset]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isLoading);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/browse" className="text-white/50 hover:text-white transition-colors">
          <SvgIcon name="compass" size={20} />
        </Link>
        <span className="text-white/30">/</span>
        <h1 className="text-3xl font-bold text-white capitalize">
          {categoryId.replace(/-/g, ' ')}
        </h1>
      </div>

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
    </div>
  );
}
