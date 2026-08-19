'use client';
import React from 'react';

interface IconProps {
  size?: number | string;
  className?: string;
  title?: string;
}

// All icons from the original Angular app
const icons: Record<string, (props: IconProps) => JSX.Element> = {
  'house-door': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-label={title}>
      {title && <title>{title}</title>}
      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z"/>
    </svg>
  ),
  'house-door-fill': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/>
    </svg>
  ),
  search: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
    </svg>
  ),
  compass: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016zm6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
      <path d="m6.94 7.44 4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z"/>
    </svg>
  ),
  'compass-fill': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016zM6.94 7.44l4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z"/>
    </svg>
  ),
  'music-note-list': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>
      <path fillRule="evenodd" d="M12 3v10h-1V3h1z"/>
      <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z"/>
      <path fillRule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z"/>
    </svg>
  ),
  'music-note-beamed': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
      <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/>
    </svg>
  ),
  journal: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
      <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
    </svg>
  ),
  heart: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
    </svg>
  ),
  'heart-fill': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
    </svg>
  ),
  play: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
    </svg>
  ),
  pause: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
    </svg>
  ),
  'step-backward': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.52-.302 1.233.043 1.233.696v7.384c0 .653-.713.998-1.233.696L5 8.752V12a.5.5 0 0 1-1 0V4z"/>
    </svg>
  ),
  'step-forward': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.713 3.31 4 3.655 4 4.308v7.384c0 .653.713.998 1.233.696L11.5 8.752V12a.5.5 0 0 0 1 0V4z"/>
    </svg>
  ),
  'volume-high': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
      <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
      <path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4l-3 3H1v2h3l3 3V4z"/>
    </svg>
  ),
  'volume-medium': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M9 4l-3 3H3v2h3l3 3V4zm-.89 8.72l-.707-.707A3.488 3.488 0 0 0 8.5 8a3.487 3.487 0 0 0-.097-2.013l.707-.707A4.485 4.485 0 0 1 9.5 8a4.484 4.484 0 0 1-.39 1.72zm1.414 1.414l-.707-.707A5.484 5.484 0 0 0 10.5 8a5.483 5.483 0 0 0-1.183-3.427l.707-.707A6.483 6.483 0 0 1 11.5 8a6.48 6.48 0 0 1-1.976 4.134z"/>
    </svg>
  ),
  'volume-mute': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
    </svg>
  ),
  clock: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
    </svg>
  ),
  mic: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
      <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 0 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
    </svg>
  ),
  expand: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M1.5 1h5a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0V1.5A.5.5 0 0 1 1.5 1zm14 0a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2h-4a.5.5 0 0 1 0-1h5zM1 14.5v-5a.5.5 0 0 1 1 0V14h4a.5.5 0 0 1 0 1H1.5a.5.5 0 0 1-.5-.5zm15 0a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h4v-4a.5.5 0 0 1 1 0v5z"/>
    </svg>
  ),
  times: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  ),
  'caret-down-fill': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
    </svg>
  ),
  github: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  ),
  twitter: ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
    </svg>
  ),
  'audio-animated': ({ size = 16, className = '', title }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <rect x="1" y="6" width="2" height="4" rx="1">
        <animate attributeName="height" values="4;8;4" dur="0.8s" repeatCount="indefinite"/>
        <animate attributeName="y" values="6;4;6" dur="0.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="4" width="2" height="8" rx="1">
        <animate attributeName="height" values="8;12;8" dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="y" values="4;2;4" dur="0.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="9" y="5" width="2" height="6" rx="1">
        <animate attributeName="height" values="6;10;6" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="y" values="5;3;5" dur="1s" repeatCount="indefinite"/>
      </rect>
      <rect x="13" y="7" width="2" height="2" rx="1">
        <animate attributeName="height" values="2;6;2" dur="0.7s" repeatCount="indefinite"/>
        <animate attributeName="y" values="7;5;7" dur="0.7s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),
};

export function SvgIcon({
  name,
  size = 20,
  className = '',
  title,
}: {
  name: string;
  size?: number | string;
  className?: string;
  title?: string;
}) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} title={title} />;
}

export default SvgIcon;
