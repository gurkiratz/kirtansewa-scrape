import { useNavigate } from 'react-router-dom';
import type { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  enabled: boolean;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ArtistCard({ artist, enabled }: ArtistCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => enabled && navigate(`/artist/${artist.slug}`)}
      className={`
        group rounded-sm border border-border bg-card overflow-hidden transition-all duration-150
        ${enabled
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg hover:shadow-black/40'
          : 'opacity-35 cursor-not-allowed'
        }
      `}
    >
      <div className="aspect-4/3 w-full bg-card flex items-center justify-center text-gold text-2xl font-semibold select-none">
        {initials(artist.name)}
      </div>
      <div className="p-3">
        <p className="text-text-primary text-sm font-medium leading-snug line-clamp-2">
          {artist.name}
        </p>
        {!enabled && (
          <p className="text-text-muted text-xs mt-1">Not yet available</p>
        )}
      </div>
    </div>
  );
}
