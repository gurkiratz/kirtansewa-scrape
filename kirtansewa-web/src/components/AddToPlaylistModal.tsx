import { useState, useRef, useEffect } from 'react';
import { X, Trash2, Plus, Check } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';

export function AddToPlaylistModal() {
  const open = useLibraryStore((s) => s.playlistModalOpen);
  const tracks = useLibraryStore((s) => s.playlistModalTracks);
  const playlists = useLibraryStore((s) => s.playlists);
  const closeModal = useLibraryStore((s) => s.closePlaylistModal);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const addTracksToPlaylist = useLibraryStore((s) => s.addTracksToPlaylist);

  const [newName, setNewName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [addedTo, setAddedTo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showNewInput) {
      inputRef.current?.focus();
    }
  }, [showNewInput]);

  useEffect(() => {
    if (!open) {
      setNewName('');
      setShowNewInput(false);
      setAddedTo(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeModal]);

  if (!open) return null;

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = createPlaylist(trimmed);
    addTracksToPlaylist(id, tracks);
    setNewName('');
    setShowNewInput(false);
    flashAdded(id);
  };

  const handleAddToExisting = (playlistId: string) => {
    addTracksToPlaylist(playlistId, tracks);
    flashAdded(playlistId);
  };

  const flashAdded = (id: string) => {
    setAddedTo(id);
    setTimeout(() => {
      setAddedTo(null);
      closeModal();
    }, 600);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) closeModal();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl animate-in">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-primary text-lg font-semibold">Add to Playlist</h2>
            <button
              onClick={closeModal}
              className="text-text-muted hover:text-text-secondary transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Create new */}
          {showNewInput ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setShowNewInput(false);
                    setNewName('');
                  }
                }}
                placeholder="Playlist name"
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/60 transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-3 py-2 rounded-lg bg-gold text-surface text-sm font-medium hover:bg-gold/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="w-full flex items-center gap-2 text-text-primary text-sm font-medium py-2.5 px-1 hover:text-gold transition-colors"
            >
              <Plus size={16} />
              Create New Playlist
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-border my-2" />

          {/* Existing playlists */}
          <div className="max-h-56 overflow-y-auto -mx-1 px-1">
            {playlists.length === 0 ? (
              <p className="text-text-muted text-sm py-3 text-center">No playlists yet</p>
            ) : (
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="flex items-center gap-2 group"
                >
                  <button
                    onClick={() => handleAddToExisting(pl.id)}
                    className="flex-1 text-left flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors min-w-0"
                  >
                    <span className="text-text-secondary text-sm truncate flex-1">{pl.name}</span>
                    <span className="text-text-muted text-xs shrink-0">{pl.tracks.length} tracks</span>
                    {addedTo === pl.id && (
                      <Check size={14} className="text-gold shrink-0 animate-in" />
                    )}
                  </button>
                  <button
                    onClick={() => deletePlaylist(pl.id)}
                    className="text-text-muted hover:text-red-400 transition-colors p-1.5 opacity-0 group-hover:opacity-100 shrink-0"
                    title="Delete playlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex justify-end">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-full bg-white/10 text-text-secondary text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
