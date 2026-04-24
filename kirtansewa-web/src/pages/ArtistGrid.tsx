import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Bookmark } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useLibraryStore } from '../store/libraryStore';
import { ArtistCard } from '../components/ArtistCard';
import type { Artist } from '../types';

type SortKey = 'name' | 'favorites';

const PAGE_SIZE = 20;

export function ArtistGrid() {
  const artists = useDataStore((s) => s.artists);
  const scrapedSlugs = useDataStore((s) => s.scrapedSlugs);
  const imageUrls = useDataStore((s) => s.imageUrls);
  const trackCounts = useDataStore((s) => s.trackCounts);
  const loading = useDataStore((s) => s.loading);
  const favoriteArtists = useLibraryStore((s) => s.favoriteArtists);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [sortBy, setSortBy] = useState<SortKey>(
    () => (localStorage.getItem('artist-sort') as SortKey) || 'name',
  );

  const toggleSort = () =>
    setSortBy((prev) => {
      const next = prev === 'name' ? 'favorites' : 'name';
      localStorage.setItem('artist-sort', next);
      return next;
    });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const favSet = new Set(favoriteArtists);
    return artists
      .filter((a) => a.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'favorites') {
          const aFav = favSet.has(a.slug) ? 1 : 0;
          const bFav = favSet.has(b.slug) ? 1 : 0;
          if (aFav !== bFav) return bFav - aFav;
        }
        return a.name.localeCompare(b.name);
      });
  }, [artists, favoriteArtists, query, sortBy]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, sortBy]);

  useEffect(() => {
    const el = sentinelRef.current;
    const root = scrollRef.current;
    if (!el || !root || visibleCount >= filtered.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
        }
      },
      { root, rootMargin: '400px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visibleCount, filtered.length]);

  const visible = filtered.slice(0, visibleCount);
  const favoriteSet = useMemo(() => new Set(favoriteArtists), [favoriteArtists]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Loading artists...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 md:px-5 py-2.5 flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleSort}
          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors"
        >
          <ArrowUpDown size={14} />
          <span>{sortBy === 'name' ? 'A\u2013Z' : 'Favorites'}</span>
        </button>

        <span className="text-text-muted text-xs ml-auto shrink-0">
          {filtered.length} artists
        </span>
      </div>

      {/* Mobile: flat name list */}
      <div className="md:hidden">
        <MobileArtistList
          artists={visible}
          totalCount={filtered.length}
          scrapedSlugs={scrapedSlugs}
          favoriteSet={favoriteSet}
        />
      </div>

      {/* Desktop: card grid */}
      <div className="hidden md:grid p-5 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {visible.map((artist) => (
          <ArtistCard
            key={artist.slug}
            artist={artist}
            enabled={scrapedSlugs.has(artist.slug)}
            imageUrl={imageUrls.get(artist.slug)}
            trackCount={trackCounts.get(artist.slug)}
            isFavorite={favoriteSet.has(artist.slug)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-text-muted text-sm py-16">
            No artists found
          </div>
        )}
      </div>

      {visibleCount < filtered.length && (
        <div ref={sentinelRef} className="h-8" aria-hidden />
      )}
    </div>
  );
}

function MobileArtistList({
  artists,
  totalCount,
  scrapedSlugs,
  favoriteSet,
}: {
  artists: Artist[];
  totalCount: number;
  scrapedSlugs: Set<string>;
  favoriteSet: Set<string>;
}) {
  const navigate = useNavigate();

  if (totalCount === 0) {
    return (
      <p className="text-center text-text-muted text-sm py-16">No artists found</p>
    );
  }

  return (
    <ul>
      {artists.map((artist) => {
        const enabled = scrapedSlugs.has(artist.slug);
        const isFavorite = favoriteSet.has(artist.slug);
        return (
          <li key={artist.slug}>
            <button
              onClick={() => enabled && navigate(`/artist/${artist.slug}`)}
              disabled={!enabled}
              className={`w-full flex items-center gap-2 text-left px-4 py-3.5 border-b border-border/60 text-sm transition-colors
                ${enabled
                  ? 'text-text-primary active:bg-white/5'
                  : 'text-text-muted cursor-not-allowed'
                }
              `}
            >
              <span className="flex-1 truncate">{artist.name}</span>
              {isFavorite && (
                <Bookmark size={11} className="text-text-muted fill-current shrink-0" aria-label="Favorite" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
