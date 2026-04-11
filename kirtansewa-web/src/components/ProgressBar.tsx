import { useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ProgressBarProps {
  variant?: 'inline' | 'stacked';
}

export function ProgressBar({ variant = 'inline' }: ProgressBarProps) {
  const seek = usePlayerStore((s) => s.seek);
  const duration = usePlayerStore((s) => s.duration);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const barRef = useRef<HTMLDivElement>(null);

  const elapsed = seek * duration;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio);
  };

  const bar = (
    <div
      ref={barRef}
      onClick={handleClick}
      className="relative flex-1 h-1 bg-border rounded-full cursor-pointer group"
    >
      <div
        className="absolute inset-y-0 left-0 bg-gold rounded-full transition-none"
        style={{ width: `${seek * 100}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `calc(${seek * 100}% - 5px)` }}
      />
    </div>
  );

  if (variant === 'stacked') {
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[11px] tabular-nums shrink-0">
            {formatTime(elapsed)}
          </span>
          {bar}
          <span className="text-text-muted text-[11px] tabular-nums shrink-0">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-text-muted text-[11px] tabular-nums w-8 text-right shrink-0">
        {formatTime(elapsed)}
      </span>
      {bar}
      <span className="text-text-muted text-[11px] tabular-nums w-8 shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}
