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

export function TrackList() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);

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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto">
          {queue.map((track, i) => (
            <TrackRow
              key={`track-${i}`}
              track={track}
              index={i}
              globalIndex={i}
              isActive={i === currentIndex}
              isPlaying={isPlaying}
              showDragHandle={queue.length > 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
