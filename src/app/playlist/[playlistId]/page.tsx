import { PlaylistPage } from '@/components/features/playlist/PlaylistPage';

interface Props {
  params: { playlistId: string };
}

export default function PlaylistRoute({ params }: Props) {
  return <PlaylistPage playlistId={params.playlistId} />;
}
