import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AppProviders } from '@/components/AppProviders';

export const metadata: Metadata = {
  title: 'Next.js Spotify',
  description: 'A Spotify clone built with Next.js 14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/*
         * IMPORTANT: This inline script MUST run before the Spotify SDK loads.
         * The SDK calls window.onSpotifyWebPlaybackSDKReady the moment it finishes
         * loading. If that function is undefined at that moment it throws:
         *   "AnthemError: onSpotifyWebPlaybackSDKReady is not defined"
         *
         * We define a stub immediately that stores a resolver. Our React app
         * then calls window.__spotifySDKReady (a Promise) to wait for it.
         * This decouples SDK load timing from React hydration timing.
         */}
        <Script id="spotify-sdk-stub" strategy="beforeInteractive">
          {`
            window.__spotifySDKResolve = null;
            window.__spotifySDKReady = new Promise(function(resolve) {
              window.__spotifySDKResolve = resolve;
            });
            window.onSpotifyWebPlaybackSDKReady = function() {
              if (window.__spotifySDKResolve) {
                window.__spotifySDKResolve();
                window.__spotifySDKResolve = null;
              }
            };
          `}
        </Script>

        {/* Load the Spotify SDK after the stub is in place */}
        <Script
          src="https://sdk.scdn.co/spotify-player.js"
          strategy="afterInteractive"
        />

        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
