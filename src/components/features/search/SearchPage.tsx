'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpotifySearchResponse } from '@/types/spotify';
import { search as spotifySearch, togglePlay } from '@/lib/spotify-api';
import { MediaCard } from '@/components/ui/MediaCard';
import { Spinner } from '@/components/ui/Spinner';
import { SvgIcon } from '@/components/Icons';
import { formatDuration } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePlaybackStore } from '@/store/playback-store';
import { play as apiPlay } from '@/lib/spotify-api';
import { debounce } from '@/lib/utils';

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SpotifySearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const playbackState = usePlaybackStore((s) => s.playbackState);

  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) { setResults(null); return; }
      setIsLoading(true);
      try {
        const res = await spotifySearch(term, { limit: 20 });
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    doSearch(val);
    if (val) {
      router.replace(`/search?q=${encodeURIComponent(val)}`, { scroll: false });
    } else {
      router.replace('/search', { scroll: false });
    }
  };

  const playTrack = async (track: { uri: string; album: { uri: string } }) => {
    await apiPlay({ context_uri: track.album.uri, offset: { uri: track.uri } });
  };

  return (
    <div className="px-8 py-6">
      {/* Search Input */}
      <div className="relative max-w-sm mb-8">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
          <SvgIcon name="search" size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Artists, songs, albums, or playlists"
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-transparent focus:border-white/30 rounded-full text-white placeholder-white/40 outline-none text-sm"
          autoFocus
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); router.replace('/search'); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            <SvgIcon name="times" size={14} />
          </button>
        )}
      </div>

      {results && (
        <div className="space-y-8">
          {/* Tracks */}
          {(results.tracks?.items?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
              <div className="space-y-1">
                {results.tracks!.items.map((track, idx) => {
                  const isTrackPlaying = isPlaying && playbackState?.track_window?.current_track?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      className="flex items-center gap-4 px-4 py-2 rounded hover:bg-white/5 group cursor-default"
                      onDoubleClick={() => playTrack(track)}
                    >
                      <div className="w-5 text-sm text-white/50 group-hover:hidden text-center">{idx + 1}</div>
                      <div className="w-5 hidden group-hover:flex justify-center">
                        <button onClick={() => playTrack(track)}>
                          <SvgIcon name={isTrackPlaying ? 'pause' : 'play'} size={14} className="text-white" />
                        </button>
                      </div>
                      {track.album?.images?.[0]?.url && (
                        <Image src={track.album.images[0].url} alt="" width={40} height={40} className="w-10 h-10 object-cover rounded" unoptimized />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isTrackPlaying ? 'text-spotify-green' : 'text-white'}`}>{track.name}</div>
                        <div className="text-xs text-white/50 truncate">{track.artists.map((a) => a.name).join(', ')}</div>
                      </div>
                      <span className="text-xs text-white/50 tabular-nums">{formatDuration(track.duration_ms)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Artists */}
          {(results.artists?.items?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.artists!.items.map((artist) => (
                  <MediaCard
                    key={artist.id}
                    title={artist.name}
                    description={artist.type}
                    imageUrl={artist.images?.[0]?.url}
                    routerUrl={`/artist/${artist.id}`}
                    uri={artist.uri}
                    roundedImage
                    onTogglePlay={(playing) => togglePlay(playing, { context_uri: artist.uri }).catch(console.error)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(results.albums?.items?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.albums!.items.map((album) => (
                  <MediaCard
                    key={album.id}
                    title={album.name}
                    description={album.artists[0]?.name}
                    imageUrl={album.images?.[0]?.url}
                    routerUrl={`/albums/${album.id}`}
                    uri={album.uri}
                    onTogglePlay={(playing) => togglePlay(playing, { context_uri: album.uri }).catch(console.error)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(results.playlists?.items?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.playlists!.items.map((pl) => (
                  <MediaCard
                    key={pl.id}
                    title={pl.name}
                    description={pl.description}
                    imageUrl={pl.images?.[0]?.url}
                    routerUrl={`/playlist/${pl.id}`}
                    uri={pl.uri}
                    onTogglePlay={(playing) => togglePlay(playing, { context_uri: pl.uri }).catch(console.error)}
                  />
                ))}
              </div>
            </section>
          )}

          {!results.tracks?.items?.length && !results.artists?.items?.length && !results.albums?.items?.length && !results.playlists?.items?.length && (
            <div className="text-center py-16 text-white/40">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}

      {!query && !results && (
        <div className="text-center py-16 text-white/40">
          Search for your favorite music
        </div>
      )}
    </div>
  );
}
