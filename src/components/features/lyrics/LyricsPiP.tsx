'use client';
import React, { useRef } from 'react';
import { LyricLine } from '@/types/spotify';
import { SvgIcon } from '@/components/Icons';
import { formatDuration } from '@/lib/utils';

interface LyricsPiPProps {
  lyrics: LyricLine[];
  activeLine: number;
  isSynced: boolean;
  onExpand: () => void;
  onClose: () => void;
}

export function LyricsPiP({ lyrics, activeLine, isSynced, onExpand, onClose }: LyricsPiPProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  const visibleLines = isSynced
    ? lyrics.slice(Math.max(0, activeLine - 1), activeLine + 3)
    : lyrics.slice(0, 5);

  return (
    <div className="fixed bottom-24 right-4 w-80 bg-black/90 backdrop-blur rounded-lg p-4 shadow-2xl z-40 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Lyrics</span>
        <div className="flex gap-2">
          <button
            onClick={onExpand}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Expand lyrics"
          >
            <SvgIcon name="expand" size={14} />
          </button>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close lyrics"
          >
            <SvgIcon name="times" size={14} />
          </button>
        </div>
      </div>
      <div className="space-y-1 min-h-[80px]">
        {visibleLines.map((line, i) => {
          const globalIdx = isSynced ? Math.max(0, activeLine - 1) + i : i;
          const isActive = globalIdx === activeLine;
          return (
            <div
              key={i}
              ref={isActive ? activeRef : null}
              className={`text-sm transition-all ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-white/40'
              }`}
            >
              {line.text || <span className="opacity-0">·</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
