import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Howl } from 'howler';
import type { Track } from '../types';

export type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  seek: number;
  seekSeconds: number;
  duration: number;
  isMuted: boolean;
  isQueueSheetOpen: boolean;
}

interface PlayerActions {
  addToQueue: (tracks: Track[]) => void;
  clearQueue: () => void;
  trimQueueToCurrent: () => void;
  removeFromQueue: (index: number) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (ratio: number) => void;
  skip: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  reorderQueue: (from: number, to: number) => void;
  toggleQueueSheet: () => void;
  initFromPersistedState: () => void;
  _tick: () => void;
}

type PlayerStore = PlayerState & PlayerActions;

let _howl: Howl | null = null;
let _rafId: number | null = null;
let _soundId: number | null = null;

function cancelRaf() {
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
}

function startRaf(tick: () => void) {
  cancelRaf();
  const loop = () => {
    tick();
    _rafId = requestAnimationFrame(loop);
  };
  _rafId = requestAnimationFrame(loop);
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      isShuffle: false,
      repeatMode: 'none',
      volume: 1,
      seek: 0,
      seekSeconds: 0,
      duration: 0,
      isMuted: false,
      isQueueSheetOpen: false,

      addToQueue: (tracks) => {
        const { queue } = get();
        set({ queue: [...queue, ...tracks] });
      },

      clearQueue: () => {
        cancelRaf();
        if (_howl) {
          _howl.unload();
          _howl = null;
        }
        _soundId = null;
        set({ queue: [], currentIndex: -1, isPlaying: false, seek: 0, seekSeconds: 0, duration: 0 });
      },

      trimQueueToCurrent: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < 0 || queue.length === 0) {
          get().clearQueue();
          return;
        }
        set({ queue: [queue[currentIndex]], currentIndex: 0 });
      },

      removeFromQueue: (index) => {
        const { queue, currentIndex } = get();
        if (index < 0 || index >= queue.length) return;

        if (queue.length === 1) {
          get().clearQueue();
          return;
        }

        const next = [...queue];
        next.splice(index, 1);

        if (index === currentIndex) {
          const newIndex = Math.min(index, next.length - 1);
          set({ queue: next, currentIndex: -1 });
          get().playTrack(newIndex);
          return;
        }

        set({
          queue: next,
          currentIndex: index < currentIndex ? currentIndex - 1 : currentIndex,
        });
      },

      playTrack: (index) => {
        const { queue, volume, isMuted } = get();
        if (index < 0 || index >= queue.length) return;

        cancelRaf();
        if (_howl) {
          _howl.unload();
          _howl = null;
          _soundId = null;
        }

        const track = queue[index];
        _howl = new Howl({
          src: [track.url],
          html5: true,
          volume: isMuted ? 0 : volume,
          onload: () => {
            set({ duration: _howl?.duration() ?? 0 });
          },
          onplay: () => {
            set({ isPlaying: true });
            startRaf(get()._tick);
          },
          onpause: () => {
            cancelRaf();
            set({ isPlaying: false });
          },
          onstop: () => {
            cancelRaf();
            set({ isPlaying: false });
          },
          onend: () => {
            cancelRaf();
            if (_howl) {
              _howl.unload();
              _howl = null;
              _soundId = null;
            }
            set({ isPlaying: false });
            get().next();
          },
          onloaderror: (_id, err) => {
            console.error('Load error:', err);
          },
        });

        _soundId = _howl.play();
        set({ currentIndex: index, seek: 0, seekSeconds: 0 });
      },

      togglePlay: () => {
        const { isPlaying, currentIndex, queue } = get();
        if (!_howl) {
          if (queue.length > 0) get().playTrack(currentIndex >= 0 ? currentIndex : 0);
          return;
        }
        if (isPlaying) {
          _howl.pause(_soundId ?? undefined);
        } else {
          _soundId = _howl.play(_soundId ?? undefined);
        }
      },

      next: () => {
        const { queue, currentIndex, isShuffle, repeatMode } = get();
        if (queue.length === 0) return;

        if (repeatMode === 'one') {
          get().playTrack(currentIndex);
          return;
        }

        let nextIndex: number;
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = currentIndex + 1;
        }

        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            cancelRaf();
            set({ isPlaying: false, seek: 0, seekSeconds: 0 });
            return;
          }
        }

        get().playTrack(nextIndex);
      },

      prev: () => {
        const { currentIndex, queue } = get();
        if (queue.length === 0) return;
        const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
        get().playTrack(prevIndex);
      },

      seekTo: (ratio) => {
        if (!_howl) return;
        const duration = _howl.duration();
        const clamped = Math.max(0, Math.min(1, ratio));
        _howl.seek(duration * clamped, _soundId ?? undefined);
        set({ seek: clamped, seekSeconds: duration * clamped });
      },

      skip: (seconds) => {
        if (!_howl) return;
        const current = _howl.seek(_soundId ?? undefined) as number;
        const duration = _howl.duration();
        const next = Math.max(0, Math.min(current + seconds, duration));
        _howl.seek(next, _soundId ?? undefined);
      },

      setVolume: (vol) => {
        const clamped = Math.max(0, Math.min(1, vol));
        if (_howl) _howl.volume(clamped);
        set({ volume: clamped, isMuted: false });
      },

      toggleMute: () => {
        const { isMuted, volume } = get();
        if (_howl) _howl.volume(isMuted ? volume : 0);
        set({ isMuted: !isMuted });
      },

      toggleShuffle: () => {
        set((s) => ({ isShuffle: !s.isShuffle }));
      },

      cycleRepeat: () => {
        const order: RepeatMode[] = ['none', 'all', 'one'];
        const { repeatMode } = get();
        const next = order[(order.indexOf(repeatMode) + 1) % order.length];
        set({ repeatMode: next });
      },

      toggleQueueSheet: () => {
        set((s) => ({ isQueueSheetOpen: !s.isQueueSheetOpen }));
      },

      reorderQueue: (from, to) => {
        const { queue, currentIndex } = get();
        const next = [...queue];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);

        let nextCurrent = currentIndex;
        if (currentIndex === from) {
          nextCurrent = to;
        } else if (from < currentIndex && to >= currentIndex) {
          nextCurrent = currentIndex - 1;
        } else if (from > currentIndex && to <= currentIndex) {
          nextCurrent = currentIndex + 1;
        }

        set({ queue: next, currentIndex: nextCurrent });
      },

      initFromPersistedState: () => {
        const { queue, currentIndex, seekSeconds, volume } = get();
        if (currentIndex < 0 || queue.length === 0 || _howl) return;

        const track = queue[currentIndex];
        _howl = new Howl({
          src: [track.url],
          html5: true,
          volume,
          onload: () => {
            const dur = _howl?.duration() ?? 0;
            set({ duration: dur });
            if (seekSeconds > 0 && _howl) {
              _howl.seek(seekSeconds);
              set({ seek: dur > 0 ? seekSeconds / dur : 0 });
            }
          },
          onplay: () => {
            set({ isPlaying: true });
            startRaf(get()._tick);
          },
          onpause: () => {
            cancelRaf();
            set({ isPlaying: false });
          },
          onstop: () => {
            cancelRaf();
            set({ isPlaying: false });
          },
          onend: () => {
            cancelRaf();
            if (_howl) {
              _howl.unload();
              _howl = null;
              _soundId = null;
            }
            set({ isPlaying: false });
            get().next();
          },
          onloaderror: (_id, err) => {
            console.error('Load error:', err);
          },
        });
        // Do not call .play() — stay paused, just preload
      },

      _tick: () => {
        if (!_howl || !_howl.playing(_soundId ?? undefined)) return;
        const currentSecs = _howl.seek(_soundId ?? undefined) as number;
        const duration = _howl.duration();
        if (duration > 0) {
          set({ seek: currentSecs / duration, seekSeconds: currentSecs });
        }
      },
    }),
    {
      name: 'kirtansewa-player',
      version: 1,
      migrate: (persistedState) => persistedState,
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        seekSeconds: state.seekSeconds,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        volume: state.volume,
      }),
    }
  )
);
