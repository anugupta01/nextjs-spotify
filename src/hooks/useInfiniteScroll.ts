'use client';
import { useEffect, useRef } from 'react';

export function useInfiniteScroll(
  onScrolledToBottom: () => void,
  enabled: boolean
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && enabled) {
          onScrolledToBottom();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, onScrolledToBottom]);

  return ref;
}
