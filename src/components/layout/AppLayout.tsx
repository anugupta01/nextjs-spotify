'use client';
import React from 'react';
import { NavBar } from './NavBar';
import { NowPlayingBar } from './NowPlayingBar';
import { UnauthorizedModal } from '@/components/UnauthorizedModal';
import { useUIStore } from '@/store/ui-store';
import { LyricsPiP } from '@/components/features/lyrics/LyricsPiP';
import { useLyricsStore } from '@/store/lyrics-store';
import { useVisualizerStore } from '@/store/visualizer-store';
import { VisualizerPiP } from '@/components/features/visualizer/VisualizerPiP';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const showUnauthorizedModal = useUIStore((s) => s.showUnauthorizedModal);
  const setShowUnauthorizedModal = useUIStore((s) => s.setShowUnauthorizedModal);
  const { showPiPLyrics, lyrics, activeLine, isSynced } = {
    showPiPLyrics: useLyricsStore((s) => s.isVisible && s.isShownAsPiP && s.lyrics !== null && (s.lyrics?.length ?? 0) > 0),
    lyrics: useLyricsStore((s) => s.lyrics),
    activeLine: useLyricsStore((s) => s.activeLine),
    isSynced: useLyricsStore((s) => s.isSynced),
  };
  const showPiPVisualizer = useVisualizerStore((s) => s.showPiPVisualizer);
  const { setVisibility: setLyricsVisibility } = useLyricsStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-spotify-black text-white">
      <div className="flex flex-1 overflow-hidden">
        <NavBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-highlight/30 to-spotify-black">
            {children}
          </main>
        </div>
      </div>
      <NowPlayingBar />

      {/* PiP Visualizer */}
      {showPiPVisualizer && <VisualizerPiP />}

      {/* PiP Lyrics */}
      {showPiPLyrics && lyrics && (
        <LyricsPiP
          lyrics={lyrics}
          activeLine={activeLine}
          isSynced={isSynced}
          onExpand={() => setLyricsVisibility({ isVisible: true })}
          onClose={() => setLyricsVisibility({ isVisible: false })}
        />
      )}

      {/* Unauthorized Modal */}
      {showUnauthorizedModal && (
        <UnauthorizedModal onClose={() => setShowUnauthorizedModal(false)} />
      )}
    </div>
  );
}
