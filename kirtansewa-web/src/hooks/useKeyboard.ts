import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function useKeyboard() {
  const { togglePlay, skip, toggleMute, next, prev } = usePlayerStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'N':
          if (e.shiftKey) next();
          break;
        case 'P':
          if (e.shiftKey) prev();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, skip, toggleMute, next, prev]);
}
