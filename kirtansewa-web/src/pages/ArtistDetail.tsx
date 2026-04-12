import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Shuffle,
  Plus,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import type { ArtistDetail as ArtistDetailType } from "../types";
import { toTrack, type TrackMeta } from "../types";
import { ArtistImage } from "../components/ArtistImage";
import { usePlayerStore } from "../store/playerStore";
import { useDataStore } from "../store/dataStore";
import { useLibraryStore } from "../store/libraryStore";

export function ArtistDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const artists = useDataStore((s) => s.artists);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const favoriteArtists = useLibraryStore((s) => s.favoriteArtists);
  const toggleFavoriteArtist = useLibraryStore((s) => s.toggleFavoriteArtist);
  const openPlaylistModal = useLibraryStore((s) => s.openPlaylistModal);

  const [detail, setDetail] = useState<ArtistDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [glowVisible, setGlowVisible] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (detail?.image_url) {
      const img = new Image();
      img.src = detail.image_url;
      img.onload = () => {
        glowTimerRef.current = setTimeout(() => setGlowVisible(true), 50);
      };
    } else {
      setGlowVisible(false);
    }
    return () => clearTimeout(glowTimerRef.current);
  }, [detail?.image_url]);

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

    const filename = `${String(artistIndex + 1).padStart(2, "0")}-${slug}.json`;
    fetch(`/artists/${filename}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
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

  const meta: TrackMeta | undefined = detail
    ? { artistLabel: detail.name, coverUrl: detail.image_url }
    : undefined;

  const handleAddAll = () => {
    if (!detail) return;
    addToQueue(detail.tracks.map((r) => toTrack(r, meta)));
  };

  const handleAddAllToPlaylist = () => {
    if (!detail) return;
    openPlaylistModal(detail.tracks.map((r) => toTrack(r, meta)));
  };

  const isFavorite = slug ? favoriteArtists.includes(slug) : false;

  const handlePlayAll = () => {
    if (!detail) return;
    clearQueue();
    addToQueue(detail.tracks.map((r) => toTrack(r, meta)));
    playTrack(0);
  };

  const handleShuffleAll = () => {
    if (!detail) return;
    clearQueue();
    const tracks = detail.tracks.map((r) => toTrack(r, meta));
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    addToQueue(shuffled);
    toggleShuffle();
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
        <button
          onClick={() => navigate("/")}
          className="text-gold text-sm hover:underline"
        >
          ← Back to artists
        </button>
      </div>
    );
  }

  const hasBio = detail.body.length > 0;

  return (
    // Mobile: vertical scroll. Desktop: horizontal flex with independent panel scrolls.
    <div className="relative flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
      {/* Blurred album art background glow — spans entire page */}
      {detail.image_url && (
        <div
          className={`absolute inset-x-0 top-0 h-[40%] overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 ease-out ${
            glowVisible ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <div
            className="absolute -inset-1/2 w-[200%] h-[200%] opacity-35 blur-[120px] saturate-150 scale-125"
            style={{
              backgroundImage: `url(${detail.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-surface" />
        </div>
      )}

      {/* ── LEFT / INFO PANEL ── */}
      <div className="relative z-10 w-full md:w-96 md:shrink-0 md:border-r border-border md:overflow-y-auto">
        <div className="p-5 md:p-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-text-primary/70 hover:text-text-primary text-sm transition-colors mb-5 p-1.5"
          >
            <ArrowLeft size={14} />
            All artists
          </button>

          {/* Thumbnail on mobile, full-width square on desktop */}
          <div className="flex items-start gap-4 mb-4 md:block">
            <div className="w-24 h-24 md:w-full md:h-auto md:aspect-square shrink-0 rounded-sm overflow-hidden">
              <ArtistImage
                src={detail.image_url}
                name={detail.name}
                className="w-full h-full text-xl md:text-5xl font-bold"
              />
            </div>
            {/* Name + track count beside thumbnail on mobile */}
            <div className="md:hidden">
              <h1 className="text-text-primary text-lg font-bold leading-snug">
                {detail.name}
              </h1>
              <p className="text-text-primary/80 text-xs mt-0.5">
                {detail.tracks.length} tracks
              </p>
            </div>
          </div>

          {/* Name + track count below image on desktop */}
          <h1 className="hidden md:block text-text-primary text-xl font-semibold mb-1">
            {detail.name}
          </h1>
          <p className="hidden md:block text-text-primary/80 text-xs mb-4">
            {detail.tracks.length} tracks
          </p>

          <div className="flex items-center gap-3 mb-5 mt-4 md:mt-0">
            <button
              onClick={handlePlayAll}
              className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-surface hover:bg-gold/85 transition-colors"
              title="Play all"
            >
              <Play size={18} className="mx-0.5" />
            </button>

            <button
              onClick={handleShuffleAll}
              className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-surface hover:bg-gold/85 transition-colors"
              title="Shuffle all"
            >
              <Shuffle size={17} />
            </button>
            <button
              onClick={handleAddAllToPlaylist}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
              title="Add all to playlist"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => slug && toggleFavoriteArtist(slug)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                isFavorite
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border text-text-secondary hover:text-text-primary hover:border-text-secondary"
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={16} className={isFavorite ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleAddAll}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
              title="Add all to queue"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Bio: clamped on mobile, full on desktop */}
          {hasBio && (
            <div>
              {/* Mobile: 3-line clamp + toggle */}
              <div className="md:hidden">
                <div
                  className={`text-text-secondary text-[13px] leading-relaxed space-y-2 ${
                    bioExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {detail.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <button
                  onClick={() => setBioExpanded((v) => !v)}
                  className="text-gold text-xs mt-2 hover:underline"
                >
                  {bioExpanded ? "Read less" : "Read more"}
                </button>
              </div>

              {/* Desktop: full text */}
              <div className="hidden md:block text-text-secondary text-[13px] leading-relaxed space-y-2">
                {detail.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* On mobile, render tracks inline below the info */}
        <div className="md:hidden border-t border-border">
          <TrackSection detail={detail} meta={meta} />
        </div>
      </div>

      {/* ── MIDDLE: TRACKS (desktop only) ── */}
      <div className="relative z-10 hidden md:flex flex-1 flex-col overflow-hidden">
        <TrackSection detail={detail} meta={meta} />
      </div>
    </div>
  );
}

function TrackSection({
  detail,
  meta,
}: {
  detail: ArtistDetailType;
  meta?: TrackMeta;
}) {
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);

  const allTracks = detail.tracks.map((r) => toTrack(r, meta));

  const isThisArtistQueue =
    queue.length === allTracks.length &&
    allTracks.every((t, i) => queue[i]?.url === t.url);

  const handleTrackClick = (index: number) => {
    if (isThisArtistQueue) {
      playTrack(index);
    } else {
      clearQueue();
      addToQueue(allTracks);
      playTrack(index);
    }
  };

  const activeIndex = isThisArtistQueue ? currentIndex : -1;

  return (
    <>
      {/* Column header */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border text-[11px] text-text-primary uppercase tracking-wider">
        <span className="w-8 text-center shrink-0">#</span>
        <span className="flex-1">Title</span>
      </div>

      <div className="md:flex-1 md:overflow-y-auto">
        {allTracks.map((track, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              onClick={() => handleTrackClick(i)}
              className={`
                w-full flex items-center gap-3 px-5 h-14 transition-colors group text-left cursor-pointer
                ${
                  isActive
                    ? "bg-gold/15 border-l-4 border-l-gold"
                    : "border-b border-border/50 hover:bg-white/5 active:bg-white/5"
                }
              `}
            >
              <span
                className={`text-sm w-8 text-center shrink-0 ${
                  isActive ? "text-gold" : "text-text-primary/50"
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-medium truncate leading-tight ${
                    isActive ? "text-gold" : "text-text-primary"
                  }`}
                >
                  {track.displayName}
                </p>
                {track.artistLabel && (
                  <p className="text-[11px] text-text-secondary truncate leading-tight mt-0.5">
                    {track.artistLabel}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
