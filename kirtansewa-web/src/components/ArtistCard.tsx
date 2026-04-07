import { useNavigate } from 'react-router-dom';
import type { Artist } from '../types';
import { ArtistImage } from './ArtistImage';

interface ArtistCardProps {
  artist: Artist;
  trackCount?: number;
  enabled: boolean;
}

export function ArtistCard({ artist, trackCount, enabled }: ArtistCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (enabled) navigate(`/artist/${artist.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group rounded-sm border border-border bg-card overflow-hidden transition-all duration-150
        ${enabled
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg hover:shadow-black/40'
          : 'opacity-35 cursor-not-allowed'
        }
      `}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <ArtistImage
          src={enabled ? null : null}
          name={artist.name}
          className="w-full h-full text-2xl"
        />
      </div>
      <div className="p-3">
        <p className="text-text-primary text-sm font-medium leading-snug line-clamp-2">
          {artist.name}
        </p>
        {trackCount !== undefined && (
          <p className="text-text-muted text-xs mt-1">{trackCount} tracks</p>
        )}
        {!enabled && (
          <p className="text-text-muted text-xs mt-1">Not yet available</p>
        )}
      </div>
    </div>
  );
}
