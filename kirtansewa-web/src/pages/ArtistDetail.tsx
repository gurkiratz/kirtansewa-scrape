import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ListPlus, Trash2 } from 'lucide-react';
import type { ArtistDetail as ArtistDetailType } from '../types';
import { toTrack } from '../types';
import { ArtistImage } from '../components/ArtistImage';
import { TrackList } from '../components/TrackList';
import { usePlayerStore } from '../store/playerStore';
import { useDataStore } from '../store/dataStore';

export function ArtistDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const artists = useDataStore((s) => s.artists);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const queue = usePlayerStore((s) => s.queue);

  const [detail, setDetail] = useState<ArtistDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    setBioExpanded(false);

    const artistIndex = artists.findIndex((a) => a.slug === slug);
    if (artistIndex === -1) {
      setError(true);
      setLoading(false);
      return;
    }

    const filename = `${String(artistIndex + 1).padStart(2, '0')}-${slug}.json`;
    fetch(`/artists/${filename}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data: ArtistDetailType) => {
        setDetail(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug, artists]);

  const handleAddAll = () => {
    if (!detail) return;
    addToQueue(detail.tracks.map(toTrack));
  };

  const handlePlayAll = () => {
    if (!detail) return;
    clearQueue();
    addToQueue(detail.tracks.map(toTrack));
    playTrack(0);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Loading...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Artist not found or not yet scraped.</p>
        <button onClick={() => navigate('/')} className="text-gold text-sm hover:underline">
          ← Back to artists
        </button>
      </div>
    );
  }

  const hasBio = detail.body.length > 0;

  return (
    // Mobile: vertical scroll. Desktop: horizontal flex with independent panel scrolls.
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">

      {/* ── LEFT / INFO PANEL ── */}
      <div className="w-full md:w-96 md:shrink-0 md:border-r border-border md:overflow-y-auto">
        <div className="p-5 md:p-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            All artists
          </button>

          {/* Thumbnail on mobile, full-width square on desktop */}
          <div className="flex items-center gap-4 mb-4 md:block">
            <div className="w-16 h-16 md:w-full md:h-auto md:aspect-square shrink-0 rounded-sm overflow-hidden">
              <ArtistImage
                src={detail.image_url}
                name={detail.name}
                className="w-full h-full text-xl md:text-5xl font-bold"
              />
            </div>
            {/* Name + track count beside thumbnail on mobile */}
            <div className="md:hidden">
              <h1 className="text-text-primary text-lg font-semibold leading-snug">{detail.name}</h1>
              <p className="text-text-muted text-xs mt-0.5">{detail.tracks.length} tracks</p>
            </div>
          </div>

          {/* Name + track count below image on desktop */}
          <h1 className="hidden md:block text-text-primary text-xl font-semibold mb-1">{detail.name}</h1>
          <p className="hidden md:block text-text-muted text-xs mb-4">{detail.tracks.length} tracks</p>

          <div className="flex gap-2 mb-5 mt-4 md:mt-0">
            <button
              onClick={handlePlayAll}
              className="flex-1 bg-gold text-surface text-sm font-medium py-2 rounded-sm hover:bg-gold/85 transition-colors"
            >
              Play all
            </button>
            <button
              onClick={handleAddAll}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm text-text-secondary hover:text-text-primary hover:border-gold/40 text-sm transition-colors"
            >
              <ListPlus size={15} />
              Add to queue
            </button>
          </div>

          {/* Bio: clamped on mobile, full on desktop */}
          {hasBio && (
            <div>
              {/* Mobile: 3-line clamp + toggle */}
              <div className="md:hidden">
                <div className={`text-text-secondary text-[13px] leading-relaxed space-y-2 ${bioExpanded ? '' : 'line-clamp-3'}`}>
                  {detail.body.map((para, i) => <p key={i}>{para}</p>)}
                </div>
                <button
                  onClick={() => setBioExpanded((v) => !v)}
                  className="text-gold text-xs mt-2 hover:underline"
                >
                  {bioExpanded ? 'Read less' : 'Read more'}
                </button>
              </div>

              {/* Desktop: full text */}
              <div className="hidden md:block text-text-secondary text-[13px] leading-relaxed space-y-2">
                {detail.body.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>
          )}
        </div>

        {/* On mobile, render tracks inline below the info */}
        <div className="md:hidden border-t border-border">
          <TrackSection
            detail={detail}
            addToQueue={addToQueue}
          />
        </div>
      </div>

      {/* ── MIDDLE: TRACKS (desktop only) ── */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden border-r border-border">
        <TrackSection detail={detail} addToQueue={addToQueue} />
      </div>

      {/* ── RIGHT: QUEUE (desktop only, conditional) ── */}
      {queue.length > 0 && (
        <div className="hidden lg:flex flex-col w-72 shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <span className="text-[11px] text-text-muted uppercase tracking-widest font-medium">
              Queue · {queue.length}
            </span>
            <button
              onClick={clearQueue}
              className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-xs transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TrackList />
          </div>
        </div>
      )}
    </div>
  );
}

function TrackSection({
  detail,
  addToQueue,
}: {
  detail: ArtistDetailType;
  addToQueue: (tracks: ReturnType<typeof toTrack>[]) => void;
}) {
  return (
    <>
      <div className="flex items-center px-5 py-3 border-b border-border">
        <span className="text-[11px] text-text-muted uppercase tracking-widest font-medium">
          Tracks · {detail.tracks.length}
        </span>
      </div>
      <div className="md:flex-1 md:overflow-y-auto">
        {detail.tracks.map((raw, i) => {
          const track = toTrack(raw);
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 h-13 border-b border-border/50 hover:bg-white/5 active:bg-white/5 transition-colors group"
            >
              <span className="text-xs text-text-muted w-5 text-right shrink-0">{i + 1}</span>
              <span className="flex-1 text-[13px] text-text-secondary group-hover:text-text-primary truncate transition-colors">
                {track.displayName}
              </span>
              <button
                onClick={() => addToQueue([track])}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-gold transition-all"
                title="Add to queue"
              >
                <ListPlus size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
