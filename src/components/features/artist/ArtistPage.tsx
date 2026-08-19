'use client';
import React, { useEffect, useState } from 'react';
import { SpotifyArtist, SpotifyTrack } from '@/types/spotify';
import { getArtist, getArtistTopTracks, play as apiPlay, pause as apiPause } from '@/lib/spotify-api';
import { useAuthStore } from '@/store/auth-store';
import { usePlaybackStore } from '@/store/playback-store';
import { useSavedTracksStore } from '@/store/saved-tracks-store';
import { MediaSummary } from '@/components/ui/MediaSummary';
import { PlayButton } from '@/components/ui/PlayButton';
import { LikeButton } from '@/components/ui/LikeButton';
import { Spinner } from '@/components/ui/Spinner';
import { SvgIcon } from '@/components/Icons';
import { formatDuration } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export function ArtistPage({ artistId }: { artistId: string }) {
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const checkSaved = useSavedTracksStore((s) => s.checkSaved);
  const savedMap = useSavedTracksStore((s) => s.savedMap);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const playbackState = usePlaybackStore((s) => s.playbackState);

  const artistUri = artist ? `spotify:artist:${artistId}` : '';
  const isArtistPlaying = isPlaying && playbackState?.context?.uri === artistUri;

  useEffect(() => {
    if (!user?.country) return;
    setIsLoading(true);
    Promise.all([
      getArtist(artistId),
      getArtistTopTracks(artistId, user.country),
    ])
      .then(([art, tracksRes]) => {
        setArtist(art);
        setTopTracks(tracksRes.tracks);
        const ids = tracksRes.tracks.map((t) => t.id).filter(Boolean);
        if (ids.length) checkSaved(ids);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [artistId, user?.country, checkSaved]);

  const toggleArtist = async () => {
    if (isArtistPlaying) {
      await apiPause();
    } else {
      await apiPlay({ context_uri: artistUri });
    }
  };

  const playTrack = async (track: SpotifyTrack) => {
    await apiPlay({ context_uri: artistUri, offset: { uri: track.uri } });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }
  if (!artist) return null;

  return (
    <div>
      <MediaSummary
        type="Artist"
        title={artist.name}
        imageUrl={artist.images?.[0]?.url}
        followerCount={artist.followers?.total}
      />

      <div className="px-8 pt-4 pb-6">
        <PlayButton isPlaying={isArtistPlaying} onToggle={toggleArtist} large primary />
      </div>

      <div className="px-8">
        <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>

        {topTracks.map((track, idx) => {
          const isTrackPlaying = isPlaying && playbackState?.track_window?.current_track?.id === track.id;

          return (
            <div
              key={track.id}
              className="flex items-center gap-4 px-4 py-3 rounded hover:bg-white/5 group cursor-default"
              onDoubleClick={() => playTrack(track)}
            >
              <div className="w-5 text-sm text-white/50 text-center group-hover:hidden">
                {isTrackPlaying
                  ? <SvgIcon name="audio-animated" size={14} className="text-spotify-green" />
                  : idx + 1}
              </div>
              <div className="w-5 hidden group-hover:flex justify-center">
                <PlayButton
                  isPlaying={isTrackPlaying}
                  onToggle={() => playTrack(track)}
                  className="w-4 h-4 text-white"
                />
              </div>

              {track.album?.images?.[0]?.url && (
                <Link href={`/albums/${track.album.id}`} onClick={(e) => e.stopPropagation()}>
                  <Image
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded flex-shrink-0"
                    unoptimized
                  />
                </Link>
              )}

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isTrackPlaying ? 'text-spotify-green' : 'text-white'}`}>
                  {track.name}
                </div>
              </div>

              <div className="flex items-center gap-4">
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
