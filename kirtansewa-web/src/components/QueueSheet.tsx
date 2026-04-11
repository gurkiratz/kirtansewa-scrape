import { X, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { TrackList } from './TrackList';

export function QueueSheet() {
  const isOpen = usePlayerStore((s) => s.isQueueSheetOpen);
  const toggleQueueSheet = usePlayerStore((s) => s.toggleQueueSheet);
  const queue = usePlayerStore((s) => s.queue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={toggleQueueSheet}
        />
      )}

      {/* Sheet */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 bg-panel border-t border-border rounded-t-xl
          transition-transform duration-300 ease-out md:hidden
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '70vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-[11px] text-text-muted uppercase tracking-widest font-medium">
            Queue · {queue.length}
          </span>
          <div className="flex items-center gap-3">
            {queue.length > 0 && (
              <button
                onClick={() => { clearQueue(); toggleQueueSheet(); }}
                className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-xs transition-colors"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
            <button
              onClick={toggleQueueSheet}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Track list */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 88px)' }}>
          {queue.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-10">Queue is empty</p>
          ) : (
            <TrackList />
          )}
        </div>
      </div>
    </>
  );
}
