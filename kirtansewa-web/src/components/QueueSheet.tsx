import { X, Trash2 } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import { TrackList } from "./TrackList";

export function QueueSheet() {
  const isOpen = usePlayerStore((s) => s.isQueueSheetOpen);
  const toggleQueueSheet = usePlayerStore((s) => s.toggleQueueSheet);
  const queue = usePlayerStore((s) => s.queue);
  const trimQueueToCurrent = usePlayerStore((s) => s.trimQueueToCurrent);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={toggleQueueSheet}
        />
      )}

      {/* Sheet — slides from right */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 bg-gray-600/10 backdrop-blur-xl border-l border-border
          flex flex-col
          w-full md:w-[min(420px,35vw)]
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-text-primary text-sm md:text-base font-semibold">
            Queue
          </span>
          <div className="flex items-center gap-3">
            {queue.length > 1 && (
              <button
                onClick={trimQueueToCurrent}
                className="text-text-muted hover:text-text-secondary transition-colors"
                title="Clear queue (keep current)"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={toggleQueueSheet}
              className="text-text-muted hover:text-text-primary transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <p className="text-center text-text-muted text-xs md:text-sm py-10">
              Queue is empty
            </p>
          ) : (
            <TrackList shouldScroll={isOpen} />
          )}
        </div>
      </div>
    </>
  );
}
