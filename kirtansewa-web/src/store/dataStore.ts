import { create } from 'zustand';
import type { Artist } from '../types';

interface DataStore {
  artists: Artist[];
  scrapedSlugs: Set<string>;
  loading: boolean;
  fetchAll: () => Promise<void>;
}

export const useDataStore = create<DataStore>((set) => ({
  artists: [],
  scrapedSlugs: new Set(),
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [artistsRes, manifestRes] = await Promise.all([
        fetch('/artists.json'),
        fetch('/artists/manifest.json'),
      ]);
      const artists: Artist[] = await artistsRes.json();
      const manifest: string[] = await manifestRes.json();
      set({
        artists,
        scrapedSlugs: new Set(manifest),
        loading: false,
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      set({ loading: false });
    }
  },
}));
