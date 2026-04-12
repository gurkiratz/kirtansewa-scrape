import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { ArtistCard } from '../components/ArtistCard';
import type { Artist } from '../types';

type SortKey = 'name' | 'tracks';

export function ArtistGrid() {
  const artists = useDataStore((s) => s.artists);
  const scrapedSlugs = useDataStore((s) => s.scrapedSlugs);
  const imageUrls = useDataStore((s) => s.imageUrls);
  const trackCounts = useDataStore((s) => s.trackCounts);
  const loading = useDataStore((s) => s.loading);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return artists
      .filter((a) => a.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        const aEnabled = scrapedSlugs.has(a.slug) ? 1 : 0;
        const bEnabled = scrapedSlugs.has(b.slug) ? 1 : 0;
        return bEnabled - aEnabled;
      });
  }, [artists, scrapedSlugs, query, sortBy]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Loading artists...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 md:px-5 py-2.5 flex items-center gap-3 md:gap-4">
        <div className="hidden md:flex items-center gap-1 text-[11px] text-text-muted uppercase tracking-widest">
          <span>Sort:</span>
          {(['name', 'tracks'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-2 py-1 rounded-sm transition-colors ${
                sortBy === key ? 'text-gold' : 'hover:text-text-secondary'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <span className="text-text-muted text-xs ml-auto shrink-0">
          {filtered.length} artists
        </span>
      </div>

      {/* Mobile: flat name list */}
      <div className="md:hidden">
        <MobileArtistList artists={filtered} scrapedSlugs={scrapedSlugs} />
      </div>

      {/* Desktop: card grid */}
      <div className="hidden md:grid p-5 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {filtered.map((artist) => (
          <ArtistCard
            key={artist.slug}
            artist={artist}
            enabled={scrapedSlugs.has(artist.slug)}
            imageUrl={imageUrls.get(artist.slug)}
            trackCount={trackCounts.get(artist.slug)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-text-muted text-sm py-16">
            No artists found
          </div>
        )}
      </div>
    </div>
  );
}

function MobileArtistList({
  artists,
  scrapedSlugs,
}: {
  artists: Artist[];
  scrapedSlugs: Set<string>;
}) {
  const navigate = useNavigate();

  if (artists.length === 0) {
    return (
      <p className="text-center text-text-muted text-sm py-16">No artists found</p>
    );
  }

  return (
    <ul>
      {artists.map((artist) => {
        const enabled = scrapedSlugs.has(artist.slug);
        return (
          <li key={artist.slug}>
            <button
              onClick={() => enabled && navigate(`/artist/${artist.slug}`)}
              disabled={!enabled}
              className={`w-full text-left px-4 py-3.5 border-b border-border/60 text-sm transition-colors
                ${enabled
                  ? 'text-text-primary active:bg-white/5'
                  : 'text-text-muted cursor-not-allowed'
                }
              `}
            >
              {artist.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
