import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Rewind,
  FastForward,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export function PlayerDock() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const skip = usePlayerStore((s) => s.skip);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="h-22 border-t border-border bg-panel flex flex-col justify-center px-6 gap-2 shrink-0">
      <div className="flex items-center gap-6">
        {/* Now playing */}
        <div className="w-48 shrink-0">
          {currentTrack ? (
            <>
              <p className="text-text-muted text-[10px] uppercase tracking-widest mb-0.5">Now Playing</p>
              <p className="text-text-primary text-[13px] font-medium truncate">{currentTrack.displayName}</p>
            </>
          ) : (
            <p className="text-text-muted text-[13px]">No track selected</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${isShuffle ? 'text-gold' : 'text-text-muted hover:text-text-secondary'}`}
            title="Shuffle"
          >
            <Shuffle size={15} />
          </button>

          <button
            onClick={prev}
            disabled={!currentTrack}
            className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous (Shift+P)"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => skip(-10)}
            disabled={!currentTrack}
            className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="-10s (←)"
          >
            <Rewind size={16} />
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
            onClick={() => skip(10)}
            disabled={!currentTrack}
            className="text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="+10s (→)"
          >
            <FastForward size={16} />
          </button>

          <button
            onClick={next}
            disabled={!currentTrack}
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

        {/* Volume */}
        <div className="w-48 flex justify-end shrink-0">
          <VolumeControl />
        </div>
      </div>

      <ProgressBar />
    </div>
  );
}
