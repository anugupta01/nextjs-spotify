'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpotifyPlaylist, SpotifyRecentTrack } from '@/types/spotify';
import { getFeaturedPlaylists, getRecentlyPlayed } from '@/lib/spotify-api';
import { togglePlay } from '@/lib/spotify-api';
import { Spinner } from '@/components/ui/Spinner';
import { MediaCard } from '@/components/ui/MediaCard';
import { useAuthStore } from '@/store/auth-store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [recentTracks, setRecentTracks] = useState<SpotifyRecentTrack[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    getRecentlyPlayed({ limit: 6 })
      .then((res) => {
        // Deduplicate by track id
        const seen = new Set<string>();
        const unique = res.items.filter((item) => {
          if (!item.track?.id || seen.has(item.track.id)) return false;
          seen.add(item.track.id);
          return true;
        });
        setRecentTracks(unique.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setIsLoadingRecent(false));

    getFeaturedPlaylists({ limit: 12 })
      .then((res) => setFeaturedPlaylists(res.playlists.items))
      .catch(console.error)
      .finally(() => setIsLoadingFeatured(false));
  }, []);

  return (
    <div className="px-8 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        {getGreeting()}{user?.display_name ? `, ${user.display_name}` : ''}
      </h1>

      {/* Recent Tracks grid */}
      {!isLoadingRecent && recentTracks.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {recentTracks.map((item) => (
              <Link
                key={item.track.id}
                href={`/albums/${item.track.album.id}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded group transition-colors overflow-hidden"
              >
                <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.track.album.images[0]?.url ?? ''}
                    alt={item.track.album.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-sm font-bold text-white truncate pr-2">{item.track.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Playlists */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Featured Playlists</h2>
          <Link href="/browse" className="text-sm text-white/50 hover:text-white transition-colors">
            Show all
          </Link>
        </div>
        {isLoadingFeatured ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {featuredPlaylists.map((playlist) => (
              <MediaCard
                key={playlist.id}
                title={playlist.name}
                description={playlist.description}
                imageUrl={playlist.images[0]?.url}
                routerUrl={`/playlist/${playlist.id}`}
                uri={playlist.uri}
                onTogglePlay={(isPlaying) =>
                  togglePlay(isPlaying, { context_uri: playlist.uri }).catch(console.error)
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
