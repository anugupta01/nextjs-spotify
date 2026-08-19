'use client';
import { create } from 'zustand';

type VisualizerType = 'waveform-bars' | 'circular-ring' | 'particles' | 'bubbles' | 'sound-lines' | 'radial-spikes' | 'lissajous';

interface VisualizerState {
  showPiPVisualizer: boolean;
  currentType: VisualizerType;
  setShowPiP: (show: boolean) => void;
  setType: (type: VisualizerType) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  showPiPVisualizer: false,
  currentType: 'waveform-bars',
  setShowPiP: (show) => set({ showPiPVisualizer: show }),
  setType: (type) => set({ currentType: type }),
}));
