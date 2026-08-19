'use client';
import React, { useRef, useEffect } from 'react';
import { usePlaybackStore } from '@/store/playback-store';

export function VisualizerPiP() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const analysis = usePlaybackStore((s) => s.analysis);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameData: Uint8Array | null = null;
    let animFrameId: number;

    const draw = () => {
      animFrameId = requestAnimationFrame(draw);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      if (analyzerRef.current) {
        if (!frameData) {
          frameData = new Uint8Array(analyzerRef.current.frequencyBinCount);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        analyzerRef.current.getByteFrequencyData(frameData as any);

        const barWidth = (w / frameData.length) * 2.5;
        let x = 0;

        for (let i = 0; i < frameData.length; i++) {
          const barH = (frameData[i] / 255) * h;
          const hue = (i / frameData.length) * 120 + 140; // Green hues
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          ctx.fillRect(x, h - barH, barWidth, barH);
          x += barWidth + 1;
        }
        return;
      }

      // Fallback: static animated bars using analysis data
      if (analysis?.segments && isPlaying) {
        const now = Date.now() % 2000;
        const numBars = 32;
        const barW = w / numBars;

        for (let i = 0; i < numBars; i++) {
          const t = now / 2000;
          const barH = (Math.sin((i / numBars) * Math.PI * 2 + t * Math.PI * 4) * 0.5 + 0.5) * h * 0.8;
          const hue = (i / numBars) * 120 + 140;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          ctx.fillRect(i * barW, h - barH, barW - 2, barH);
        }
      } else {
        // Idle animation
        const numBars = 32;
        const barW = w / numBars;
        for (let i = 0; i < numBars; i++) {
          const barH = Math.random() * 10 + 5;
          ctx.fillStyle = 'rgba(29, 185, 84, 0.3)';
          ctx.fillRect(i * barW, h - barH, barW - 2, barH);
        }
      }
    };

    draw();
    return () => cancelAnimationFrame(animFrameId);
  }, [analysis, isPlaying]);

  return (
    <div
      className="fixed bottom-24 right-4 w-64 h-32 rounded-lg overflow-hidden bg-black/90 border border-white/10 z-40"
      id="pip-visualizer"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
