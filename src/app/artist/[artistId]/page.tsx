import { ArtistPage } from '@/components/features/artist/ArtistPage';

interface Props {
  params: { artistId: string };
}

export default function ArtistRoute({ params }: Props) {
  return <ArtistPage artistId={params.artistId} />;
}
