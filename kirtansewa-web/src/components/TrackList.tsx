import { useRef, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePlayerStore } from '../store/playerStore';
import { TrackRow } from './TrackRow';

interface TrackListProps {
  shouldScroll?: boolean;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-2">
      <span className="text-[11px] md:text-xs text-text-muted font-semibold uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

export function TrackList({ shouldScroll }: TrackListProps) {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const currentRef = useRef<HTMLDivElement>(null);

  const scrollToCurrent = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    if (shouldScroll) {
      requestAnimationFrame(scrollToCurrent);
    }
  }, [shouldScroll, scrollToCurrent]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = queue.findIndex((_, i) => `track-${i}` === active.id);
    const toIndex = queue.findIndex((_, i) => `track-${i}` === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderQueue(fromIndex, toIndex);
    }
  };

  if (queue.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Queue is empty
      </div>
    );
  }

  const ids = queue.map((_, i) => `track-${i}`);

  const historyTracks = currentIndex > 0 ? queue.slice(0, currentIndex) : [];
  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  const upNextTracks = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto">
          {/* History */}
          {historyTracks.length > 0 && (
            <>
              <SectionHeader>History</SectionHeader>
              {historyTracks.map((track, i) => (
                <TrackRow
                  key={`track-${i}`}
                  track={track}
                  index={i}
                  globalIndex={i}
                  isActive={false}
                  isPlaying={false}
                  showDragHandle={queue.length > 1}
                />
              ))}
            </>
          )}

          {/* Currently playing */}
          {currentTrack && (
            <>
              <div ref={currentRef}>
                <SectionHeader>Currently playing</SectionHeader>
              </div>
              <TrackRow
                key={`track-${currentIndex}`}
                track={currentTrack}
                index={currentIndex}
                globalIndex={currentIndex}
                isActive={true}
                isPlaying={isPlaying}
                showDragHandle={false}
                showRemove={false}
              />
            </>
          )}

          {/* Playing next */}
          {upNextTracks.length > 0 && (
            <>
              <SectionHeader>Playing next</SectionHeader>
              {upNextTracks.map((track, i) => {
                const globalIdx = currentIndex + 1 + i;
                return (
                  <TrackRow
                    key={`track-${globalIdx}`}
                    track={track}
                    index={globalIdx}
                    globalIndex={globalIdx}
                    isActive={false}
                    isPlaying={false}
                    showDragHandle={upNextTracks.length > 1}
                  />
                );
              })}
            </>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
