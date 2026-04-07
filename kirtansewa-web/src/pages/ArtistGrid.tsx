import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { ArtistCard } from '../components/ArtistCard';

type SortKey = 'name' | 'tracks';

export function ArtistGrid() {
  const artists = useDataStore((s) => s.artists);
  const scrapedSlugs = useDataStore((s) => s.scrapedSlugs);
  const loading = useDataStore((s) => s.loading);

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return artists
      .filter((a) => a.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // sort scraped (enabled) first for tracks sort
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
      <div className="sticky top-0 z-10 bg-surface border-b border-border px-5 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-sm pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-text-muted uppercase tracking-widest">
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

        <span className="text-text-muted text-xs ml-auto">
          {filtered.length} artists
        </span>
      </div>

      {/* Grid */}
      <div className="p-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {filtered.map((artist) => (
          <ArtistCard
            key={artist.slug}
            artist={artist}
            enabled={scrapedSlugs.has(artist.slug)}
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
