import { GripVertical, Music2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlayerStore } from "../store/playerStore";
import type { Track } from "../types";

interface TrackRowProps {
  track: Track;
  index: number;
  globalIndex: number;
  isActive: boolean;
  isPlaying: boolean;
  showDragHandle?: boolean;
  showRemove?: boolean;
}

export function TrackRow({
  track,
  index: _index,
  globalIndex,
  isActive: _isActive,
  isPlaying: _isPlaying,
  showDragHandle,
  showRemove = true,
}: TrackRowProps) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
        flex items-center gap-2.5 md:gap-3 px-4 py-2.5 border-b border-border/50 transition-colors duration-100 group touch-manipulation
        hover:bg-white/5
        ${isDragging ? "z-50" : ""}
      `}
    >
      {/* Remove from queue — left side */}
      {showRemove && (
        <button
          onClick={() => removeFromQueue(globalIndex)}
          className="shrink-0 w-5 h-5 rounded-full bg-red-400/70 hover:bg-red-400 transition-colors flex items-center justify-center"
          title="Remove from queue"
        >
          <span className="block w-2.5 h-0.5 bg-white rounded-full" />
        </button>
      )}

      {/* Thumbnail */}
      <button
        onClick={() => playTrack(globalIndex)}
        className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-sm overflow-hidden"
      >
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-card flex items-center justify-center text-text-muted">
            <Music2 size={14} />
          </div>
        )}
      </button>

      {/* Title + Artist */}
      <button
        onClick={() => playTrack(globalIndex)}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-xs md:text-[13px] font-medium truncate leading-tight text-text-primary">
          {track.displayName}
        </p>
        {track.artistLabel && (
          <p className="text-[11px] md:text-xs text-text-secondary truncate leading-tight mt-0.5">
            {track.artistLabel}
          </p>
        )}
      </button>

      {/* Drag handle — right side */}
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -m-1"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      )}
    </div>
  );
}
