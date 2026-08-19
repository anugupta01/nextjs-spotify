'use client';
import React, { useEffect, useRef, useState } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import { useVisualizerStore } from '@/store/visualizer-store';

type RendererType =
  | 'waveform-bars'
  | 'circular-ring'
  | 'particles'
  | 'bubbles'
  | 'sound-lines'
  | 'radial-spikes'
  | 'lissajous';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

function drawWaveformBars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  tempo: number
) {
  const bars = 64;
  const barW = w / bars;
  const speed = (tempo / 60) * 2;
  for (let i = 0; i < bars; i++) {
    const phase = (i / bars) * Math.PI * 2;
    const barH = (Math.sin(phase + t * speed) * 0.5 + 0.5) * h * 0.75 + 10;
    const hue = (i / bars) * 100 + 140;
    ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
    ctx.fillRect(i * barW + 1, h - barH, barW - 2, barH);
  }
}

function drawCircularRing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  tempo: number
) {
  const cx = w / 2, cy = h / 2;
  const baseR = Math.min(w, h) * 0.25;
  const bars = 80;
  const speed = (tempo / 60) * 2;
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const amp = (Math.sin(angle * 3 + t * speed) * 0.5 + 0.5) * 60 + 10;
    const x1 = Math.cos(angle) * baseR;
    const y1 = Math.sin(angle) * baseR;
    const x2 = Math.cos(angle) * (baseR + amp);
    const y2 = Math.sin(angle) * (baseR + amp);
    const hue = (i / bars) * 120 + 140;
    ctx.strokeStyle = `hsl(${hue}, 80%, 55%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSoundLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  tempo: number
) {
  const lines = 8;
  const speed = (tempo / 60) * 1.5;
  for (let l = 0; l < lines; l++) {
    const yBase = (l / lines) * h + h / lines / 2;
    const amp = (h / lines) * 0.4;
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${140 + l * 15}, 80%, 55%, ${0.6 - l * 0.05})`;
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 2) {
      const freq = 3 + l * 0.5;
      const y = yBase + Math.sin((x / w) * Math.PI * freq * 2 + t * speed + l) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawRadialSpikes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  tempo: number
) {
  const cx = w / 2, cy = h / 2;
  const spikes = 48;
  const baseR = Math.min(w, h) * 0.15;
  const speed = (tempo / 60) * 3;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.3);
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2;
    const spike = (Math.abs(Math.sin(i * 0.7 + t * speed)) * 0.7 + 0.1) * Math.min(w, h) * 0.25;
    const hue = (i / spikes) * 120 + 100;
    ctx.strokeStyle = `hsl(${hue}, 85%, 55%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * baseR, Math.sin(angle) * baseR);
    ctx.lineTo(Math.cos(angle) * (baseR + spike), Math.sin(angle) * (baseR + spike));
    ctx.stroke();
  }
  ctx.restore();
}

function drawLissajous(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  tempo: number
) {
  const cx = w / 2, cy = h / 2;
  const rx = w * 0.4, ry = h * 0.4;
  const a = 3, b = 2;
  const speed = (tempo / 60) * 0.5;
  ctx.beginPath();
  for (let i = 0; i <= 1000; i++) {
    const ang = (i / 1000) * Math.PI * 2;
    const x = cx + rx * Math.sin(a * ang + t * speed);
    const y = cy + ry * Math.sin(b * ang);
    const hue = (i / 1000) * 120 + 140;
    ctx.strokeStyle = `hsl(${hue}, 80%, 55%)`;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

const RENDERERS: Record<RendererType, typeof drawWaveformBars> = {
  'waveform-bars': drawWaveformBars,
  'circular-ring': drawCircularRing,
  'sound-lines': drawSoundLines,
  'radial-spikes': drawRadialSpikes,
  lissajous: drawLissajous,
  particles: drawWaveformBars, // fallback — particles handled separately
  bubbles: drawCircularRing,   // fallback
};

const RENDERER_LABELS: Record<RendererType, string> = {
  'waveform-bars': 'Waveform Bars',
  'circular-ring': 'Circular Ring',
  'particles': 'Particles',
  'bubbles': 'Bubbles',
  'sound-lines': 'Sound Lines',
  'radial-spikes': 'Radial Spikes',
  lissajous: 'Lissajous',
};

export function VisualizerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  const { currentType, setType } = useVisualizerStore();
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const analysis = usePlaybackStore((s) => s.analysis);
  const tempo = analysis?.track?.tempo ?? 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, w, h);

      if (!isPlaying) {
        // Idle pulse
        ctx.beginPath();
        const r = Math.min(w, h) * 0.05 + Math.sin(tRef.current) * 5;
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r * 4);
        grad.addColorStop(0, 'rgba(29,185,84,0.3)');
        grad.addColorStop(1, 'rgba(29,185,84,0)');
        ctx.fillStyle = grad;
        ctx.arc(w / 2, h / 2, r * 4, 0, Math.PI * 2);
        ctx.fill();
        tRef.current += 0.02;
        return;
      }

      tRef.current += 0.016;

      if (currentType === 'particles' || currentType === 'bubbles') {
        // Spawn new particles on beat
        if (Math.random() < 0.3) {
          const count = currentType === 'bubbles' ? 1 : 3;
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            particlesRef.current.push({
              x: w / 2 + (Math.random() - 0.5) * 100,
              y: h / 2 + (Math.random() - 0.5) * 100,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - (currentType === 'bubbles' ? 1 : 0),
              radius: currentType === 'bubbles' ? 4 + Math.random() * 20 : 2 + Math.random() * 4,
              color: `hsl(${140 + Math.random() * 60}, 80%, 55%)`,
              alpha: 1,
            });
          }
        }

        // Update + draw particles
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.01);
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.008;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          if (currentType === 'bubbles') {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = p.color;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      } else {
        const renderer = RENDERERS[currentType] ?? drawWaveformBars;
        renderer(ctx, w, h, tRef.current, tempo);
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentType, isPlaying, tempo]);

  // Clear particles when switching renderers
  useEffect(() => {
    particlesRef.current = [];
  }, [currentType]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">Visualizer</h1>
        {!isPlaying && (
          <span className="text-xs text-white/40">Play a track to see the visualizer</span>
        )}
      </div>

      {/* Renderer selector */}
      <div className="px-8 py-3 flex gap-2 flex-wrap flex-shrink-0">
        {(Object.keys(RENDERER_LABELS) as RendererType[]).map((type) => (
          <button
            key={type}
            onClick={() => setType(type)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              currentType === type
                ? 'bg-spotify-green text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white',
            ].join(' ')}
          >
            {RENDERER_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'black' }}
        />
      </div>
    </div>
  );
}
