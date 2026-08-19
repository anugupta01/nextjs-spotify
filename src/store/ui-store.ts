'use client';
import { create } from 'zustand';
import { NavItem } from '@/types/spotify';

interface UIState {
  navItems: NavItem[];
  showUnauthorizedModal: boolean;
  setShowUnauthorizedModal: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  navItems: [
    { label: 'Home', path: '/', exact: true, icon: 'house-door', iconSelected: 'house-door-fill' },
    { label: 'Search', path: '/search', icon: 'search' },
    { label: 'Browse', path: '/browse', icon: 'compass', iconSelected: 'compass-fill' },
    { label: 'My Playlists', path: '/collection/playlists', icon: 'music-note-list', iconSelected: 'music-note-beamed' },
    { label: 'My Albums', path: '/albums', icon: 'journal' },
    { label: 'Liked songs', path: '/collection/tracks', icon: 'heart', iconSelected: 'heart-fill' },
  ],
  showUnauthorizedModal: false,
  setShowUnauthorizedModal: (show) => set({ showUnauthorizedModal: show }),
}));
