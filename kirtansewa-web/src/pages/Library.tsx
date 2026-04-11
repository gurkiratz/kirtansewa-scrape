import { Library as LibraryIcon } from 'lucide-react';

export function LibraryPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
      <LibraryIcon size={36} className="text-text-muted" />
      <p className="text-text-secondary text-sm text-center max-w-xs">
        Your personal library is coming soon. Saved playlists, liked tracks, and
        recent listens will appear here.
      </p>
    </div>
  );
}
