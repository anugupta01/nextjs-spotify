'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpotifyCategory } from '@/types/spotify';
import { getAllCategories } from '@/lib/spotify-api';
import { Spinner } from '@/components/ui/Spinner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const LIMIT = 30;

// Stable colour palette for categories without images
const CATEGORY_COLORS = [
  '#27856a', '#1e3264', '#8d67ab', '#e8115b', '#dc148c',
  '#e91429', '#bc5900', '#1e8a00', '#503750', '#477d95',
  '#148a08', '#e13300',
];

export function BrowsePage() {
  const [categories, setCategories] = useState<SpotifyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    getAllCategories({ limit: LIMIT, offset: 0 })
      .then((res) => {
        setCategories(res.categories.items);
        setHasMore(res.categories.next !== null);
        setOffset(LIMIT);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const res = await getAllCategories({ limit: LIMIT, offset });
      setCategories((prev) => [...prev, ...res.categories.items]);
      setHasMore(res.categories.next !== null);
      setOffset((o) => o + LIMIT);
    } catch (e) {
      console.error(e);
    }
  }, [hasMore, offset]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Browse Categories</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {categories.map((cat, idx) => {
          const bg = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          const icon = cat.icons?.[0];

          return (
            <Link
              key={cat.id}
              href={`/browse/${cat.id}`}
              className="relative overflow-hidden rounded-lg aspect-square flex items-end p-4 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: bg }}
            >
              {icon?.url && (
                <Image
                  src={icon.url}
                  alt=""
                  fill
                  className="object-cover opacity-50 rotate-[25deg] translate-x-[18%] translate-y-[-4%]"
                  sizes="200px"
                  unoptimized
                />
              )}
              <span className="relative z-10 text-white font-bold text-base leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div ref={sentinelRef} className="h-4 mt-4" />
    </div>
  );
}
