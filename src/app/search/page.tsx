import { Suspense } from 'react';
import { SearchPage } from '@/components/features/search/SearchPage';

export default function SearchRoute() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
