import { GripVertical, Music2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types';

interface TrackRowProps {
  track: Track;
  index: number;
  globalIndex: number;
  isActive: boolean;
  isPlaying: boolean;
  showDragHandle?: boolean;
}

export function TrackRow({ track, index, globalIndex, isActive, isPlaying, showDragHandle }: TrackRowProps) {
  const playTrack = usePlayerStore((s) => s.playTrack);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `track-${globalIndex}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 px-4 h-13 border-b border-border/50 transition-colors duration-100
        ${isActive ? 'bg-gold/10' : 'hover:bg-white/5'}
        ${isDragging ? 'z-50' : ''}
      `}
    >
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={14} />
        </button>
      )}

      <span className={`text-xs w-5 text-right shrink-0 ${isActive ? 'text-gold' : 'text-text-muted'}`}>
        {isActive && isPlaying ? (
          <Music2 size={12} className="text-gold" />
        ) : (
          index + 1
        )}
      </span>

      <button
        onClick={() => playTrack(globalIndex)}
        className={`flex-1 text-left text-[13px] leading-snug truncate transition-colors
          ${isActive ? 'text-gold' : 'text-text-secondary hover:text-text-primary'}
        `}
      >
        {track.displayName}
      </button>
    </div>
  );
}
