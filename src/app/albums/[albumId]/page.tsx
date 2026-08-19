import { AlbumPage } from '@/components/features/album/AlbumPage';

interface Props {
  params: { albumId: string };
}

export default function AlbumRoute({ params }: Props) {
  return <AlbumPage albumId={params.albumId} />;
}
