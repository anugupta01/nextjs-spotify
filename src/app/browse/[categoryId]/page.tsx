import { CategoryPage } from '@/components/features/browse/CategoryPage';

interface Props {
  params: { categoryId: string };
}

export default function CategoryRoute({ params }: Props) {
  return <CategoryPage categoryId={params.categoryId} />;
}
