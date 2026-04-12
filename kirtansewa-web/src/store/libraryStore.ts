import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '../types';

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

interface LibraryState {
  favoriteArtists: string[];
  likedTracks: Track[];
  playlists: Playlist[];
  playlistModalOpen: boolean;
  playlistModalTracks: Track[];
}

interface LibraryActions {
  toggleFavoriteArtist: (slug: string) => void;
  isFavoriteArtist: (slug: string) => boolean;
  toggleLikedTrack: (track: Track) => void;
  isTrackLiked: (url: string) => boolean;
  createPlaylist: (name: string) => string;
  deletePlaylist: (id: string) => void;
  addTracksToPlaylist: (playlistId: string, tracks: Track[]) => void;
  removeTrackFromPlaylist: (playlistId: string, trackIndex: number) => void;
  openPlaylistModal: (tracks: Track[]) => void;
  closePlaylistModal: () => void;
}

type LibraryStore = LibraryState & LibraryActions;

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      favoriteArtists: [],
      likedTracks: [],
      playlists: [],
      playlistModalOpen: false,
      playlistModalTracks: [],

      toggleFavoriteArtist: (slug) => {
        const { favoriteArtists } = get();
        if (favoriteArtists.includes(slug)) {
          set({ favoriteArtists: favoriteArtists.filter((s) => s !== slug) });
        } else {
          set({ favoriteArtists: [...favoriteArtists, slug] });
        }
      },

      isFavoriteArtist: (slug) => get().favoriteArtists.includes(slug),

      toggleLikedTrack: (track) => {
        const { likedTracks } = get();
        const exists = likedTracks.some((t) => t.url === track.url);
        if (exists) {
          set({ likedTracks: likedTracks.filter((t) => t.url !== track.url) });
        } else {
          set({ likedTracks: [...likedTracks, track] });
        }
      },

      isTrackLiked: (url) => get().likedTracks.some((t) => t.url === url),

      createPlaylist: (name) => {
        const id = crypto.randomUUID();
        const playlist: Playlist = { id, name, tracks: [], createdAt: Date.now() };
        set({ playlists: [...get().playlists, playlist] });
        return id;
      },

      deletePlaylist: (id) => {
        set({ playlists: get().playlists.filter((p) => p.id !== id) });
      },

      addTracksToPlaylist: (playlistId, tracks) => {
        const { playlists } = get();
        set({
          playlists: playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const existingUrls = new Set(p.tracks.map((t) => t.url));
            const newTracks = tracks.filter((t) => !existingUrls.has(t.url));
            return { ...p, tracks: [...p.tracks, ...newTracks] };
          }),
        });
      },

      removeTrackFromPlaylist: (playlistId, trackIndex) => {
        const { playlists } = get();
        set({
          playlists: playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const next = [...p.tracks];
            next.splice(trackIndex, 1);
            return { ...p, tracks: next };
          }),
        });
      },

      openPlaylistModal: (tracks) => {
        set({ playlistModalOpen: true, playlistModalTracks: tracks });
      },

      closePlaylistModal: () => {
        set({ playlistModalOpen: false, playlistModalTracks: [] });
      },
    }),
    {
      name: 'kirtansewa-library',
      version: 1,
      partialize: (state) => ({
        favoriteArtists: state.favoriteArtists,
        likedTracks: state.likedTracks,
        playlists: state.playlists,
      }),
    },
  ),
);
