'use client';
import React from 'react';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizeMap[size]} border-2 border-white/20 border-t-spotify-green rounded-full animate-spin`} />
  );
}
