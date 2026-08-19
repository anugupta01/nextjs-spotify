'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarUrl = user?.images?.[0]?.url ?? 'https://avatars.githubusercontent.com/u/66833983?s=200&v=4';

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-transparent">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
        <button
          onClick={() => router.forward()}
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Go forward"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-black/50 hover:bg-black/70 rounded-full py-1 pl-1 pr-2 transition-colors"
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={user?.display_name ?? 'User'}
              width={28}
              height={28}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <span className="text-sm font-semibold text-white">{user?.display_name}</span>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-spotify-highlight rounded shadow-xl z-50 py-1">
            {user && (
              <div className="px-4 py-2 border-b border-white/10">
                <div className="text-sm font-semibold text-white">{user.display_name}</div>
                <div className="text-xs text-white/50">{user.email}</div>
              </div>
            )}
            <a
              href="https://www.spotify.com/account"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              Account
            </a>
            <a
              href="https://github.com/trungk18/angular-spotify"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              GitHub
            </a>
            <button
              onClick={() => { setShowDropdown(false); logout(); }}
              className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
