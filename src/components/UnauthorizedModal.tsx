'use client';
import React from 'react';
import { redirectToAuthorize } from '@/lib/spotify-auth';

export function UnauthorizedModal({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-spotify-dark rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Your access token has expired!</h2>
        <p className="text-white/70 mb-6">
          Please re-authorize to continue using Angular Spotify.
        </p>
        <button
          onClick={() => redirectToAuthorize()}
          className="w-full py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-green-400 transition-colors"
        >
          Re-authorize
        </button>
      </div>
    </div>
  );
}
