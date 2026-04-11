import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Heart,
  ListPlus,
  Cast,
  Music2,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

function TrackArt({ src, label, size }: { src?: string | null; label?: string; size: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={label ?? ''}
        className="w-full h-full object-cover rounded-sm"
      />
    );
  }
  return (
    <div className="w-full h-full bg-card rounded-sm flex items-center justify-center text-text-muted">
      <Music2 size={size} />
    </div>
  );
}

export function PlayerDock() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleQueueSheet = usePlayerStore((s) => s.toggleQueueSheet);
  const seek = usePlayerStore((s) => s.seek);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const noTrack = !currentTrack;

  return (
    <div className="border-t border-border bg-panel shrink-0">
      {/* ── MOBILE PLAYER ── */}
      <div className="md:hidden flex flex-col px-4 pt-3 pb-4 gap-2.5">
        {/* Top: art + meta + utility icons */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0">
            <TrackArt src={currentTrack?.coverUrl} label={currentTrack?.artistLabel} size={16} />
          </div>
          <div className="flex-1 min-w-0">
            {currentTrack ? (
              <>
                <p className="text-text-primary text-sm font-medium truncate leading-tight">
                  {currentTrack.displayName}
                </p>
                {currentTrack.artistLabel && (
                  <p className="text-text-secondary text-xs truncate leading-tight">
                    {currentTrack.artistLabel}
                  </p>
                )}
              </>
            ) : (
              <p className="text-text-muted text-sm">No track selected</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Favorite (not available yet)"
              title="Favorite"
            >
              <Heart size={16} />
            </button>
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Add to playlist (not available yet)"
              title="Add to playlist"
            >
              <ListPlus size={16} />
            </button>
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Cast (not available yet)"
              title="Cast"
            >
              <Cast size={16} />
            </button>
            <button
              onClick={toggleQueueSheet}
              className={`transition-colors shrink-0 ${queue.length > 0 ? 'text-text-secondary hover:text-text-primary' : 'text-text-muted opacity-50 cursor-not-allowed'}`}
              disabled={queue.length === 0}
              title="Queue"
            >
              <ListMusic size={16} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar variant="stacked" />

        {/* Transport row */}
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${isShuffle ? 'text-gold' : 'text-text-muted hover:text-text-secondary'}`}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={prev}
            disabled={noTrack}
            className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            disabled={queue.length === 0}
            className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-surface hover:bg-gold/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Play/Pause"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
          </button>

          <button
            onClick={next}
            disabled={noTrack}
            className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={cycleRepeat}
            className={`transition-colors ${repeatMode !== 'none' ? 'text-gold' : 'text-text-muted hover:text-text-secondary'}`}
            title={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>
      </div>

      {/* ── DESKTOP PLAYER ── */}
      <div className="hidden md:grid grid-cols-[minmax(200px,1fr)_2fr_minmax(200px,1fr)] items-center gap-4 px-6 h-[88px]">
        {/* Left: art + track info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0">
            <TrackArt src={currentTrack?.coverUrl} label={currentTrack?.artistLabel} size={20} />
          </div>
          <div className="min-w-0">
            {currentTrack ? (
              <>
                <p className="text-text-primary text-[13px] font-medium truncate leading-tight">
                  {currentTrack.displayName}
                </p>
                {currentTrack.artistLabel && (
                  <p className="text-text-secondary text-[11px] truncate leading-tight mt-0.5">
                    {currentTrack.artistLabel}
                  </p>
                )}
              </>
            ) : (
              <p className="text-text-muted text-[13px]">No track selected</p>
            )}
          </div>
        </div>

        {/* Center: scrubber + transport */}
        <div className="flex flex-col items-center gap-1 max-w-xl mx-auto w-full">
          <ProgressBar variant="inline" />

          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? 'text-gold' : 'text-text-muted hover:text-text-secondary'}`}
              title="Shuffle"
            >
              <Shuffle size={15} />
            </button>

            <button
              onClick={prev}
              disabled={noTrack}
              className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous (Shift+P)"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              disabled={queue.length === 0}
              className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-surface hover:bg-gold/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Play/Pause (Space)"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>

            <button
              onClick={next}
              disabled={noTrack}
              className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next (Shift+N)"
            >
              <SkipForward size={18} />
            </button>

            <button
              onClick={cycleRepeat}
              className={`transition-colors ${repeatMode !== 'none' ? 'text-gold' : 'text-text-muted hover:text-text-secondary'}`}
              title={`Repeat: ${repeatMode}`}
            >
              <RepeatIcon size={15} />
            </button>
          </div>
        </div>

        {/* Right: utility icons + volume */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Favorite (not available yet)"
              title="Favorite"
            >
              <Heart size={16} />
            </button>
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Add to playlist (not available yet)"
              title="Add to playlist"
            >
              <ListPlus size={16} />
            </button>
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Cast (not available yet)"
              title="Cast"
            >
              <Cast size={16} />
            </button>
            <button
              onClick={toggleQueueSheet}
              className={`transition-colors ${queue.length > 0 ? 'text-text-secondary hover:text-text-primary' : 'text-text-muted opacity-50 cursor-not-allowed'}`}
              disabled={queue.length === 0}
              title="Queue"
            >
              <ListMusic size={16} />
            </button>
          </div>
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
