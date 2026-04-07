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

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);

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
    const tracks = detail.tracks.map(toTrack);
    addToQueue(tracks);
  };

  const handlePlayAll = () => {
    if (!detail) return;
    clearQueue();
    const tracks = detail.tracks.map(toTrack);
    addToQueue(tracks);
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

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel */}
      <div className="w-96 shrink-0 border-r border-border flex flex-col overflow-y-auto">
        <div className="p-7">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            All artists
          </button>

          <div className="aspect-square w-full rounded-sm overflow-hidden mb-5">
            <ArtistImage
              src={detail.image_url}
              name={detail.name}
              className="w-full h-full text-5xl font-bold"
            />
          </div>

          <h1 className="text-text-primary text-xl font-semibold mb-1">{detail.name}</h1>
          <p className="text-text-muted text-xs mb-5">{detail.tracks.length} tracks</p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={handlePlayAll}
              className="flex-1 bg-gold text-surface text-sm font-medium py-2 rounded-sm hover:bg-gold/85 transition-colors"
            >
              Play all
            </button>
            <button
              onClick={handleAddAll}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm text-text-secondary hover:text-text-primary hover:border-gold/40 text-sm transition-colors"
              title="Add all to queue"
            >
              <ListPlus size={15} />
              Add to queue
            </button>
          </div>

          {detail.body.length > 0 && (
            <div className="text-text-secondary text-[13px] leading-relaxed space-y-3 pr-1">
              {detail.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: queue */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <span className="text-[11px] text-text-muted uppercase tracking-widest font-medium">
            Tracks · {detail.tracks.length}
          </span>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-xs transition-colors"
              title="Clear queue"
            >
              <Trash2 size={12} />
              Clear queue
            </button>
          )}
        </div>

        {/* Artist tracks (non-sortable, add to queue) */}
        <div className="flex-1 overflow-y-auto">
          {detail.tracks.map((raw, i) => {
            const track = toTrack(raw);
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-5 h-13 border-b border-border/50 hover:bg-white/5 transition-colors group"
              >
                <span className="text-xs text-text-muted w-5 text-right shrink-0">{i + 1}</span>
                <span className="flex-1 text-[13px] text-text-secondary group-hover:text-text-primary truncate transition-colors">
                  {track.displayName}
                </span>
                <button
                  onClick={() => {
                    addToQueue([track]);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-gold transition-all"
                  title="Add to queue"
                >
                  <ListPlus size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Queue panel (if has items) */}
        {queue.length > 0 && (
          <div className="border-t border-border">
            <div className="px-5 py-2 flex items-center justify-between">
              <span className="text-[11px] text-text-muted uppercase tracking-widest font-medium">
                Queue · {queue.length}
              </span>
            </div>
            {/* Import TrackList inline here to avoid circular deps */}
            <QueuePanel />
          </div>
        )}
      </div>
    </div>
  );
}

function QueuePanel() {
  return (
    <div className="max-h-64 overflow-y-auto">
      <TrackList />
    </div>
  );
}
