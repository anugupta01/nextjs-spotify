'use client';
import React from 'react';
import { SvgIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

interface PlayButtonProps {
  isPlaying?: boolean | null;
  onToggle: (nextState: boolean) => void;
  large?: boolean;
  primary?: boolean;
  className?: string;
  disabled?: boolean;
}

export function PlayButton({
  isPlaying,
  onToggle,
  large = false,
  primary = false,
  className = '',
  disabled = false,
}: PlayButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled) onToggle(!isPlaying);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center rounded-full transition-all',
        primary
          ? 'bg-spotify-green text-black hover:scale-105 hover:bg-green-400'
          : 'text-white hover:scale-105',
        large ? 'w-14 h-14' : 'w-8 h-8',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      <SvgIcon name={isPlaying ? 'pause' : 'play'} size={large ? 24 : 16} />
    </button>
  );
}
