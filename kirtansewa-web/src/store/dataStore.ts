import { create } from 'zustand';
import type { Artist } from '../types';

interface ManifestEntry {
  slug: string;
  image_url: string | null;
  track_count: number;
}

interface DataStore {
  artists: Artist[];
  scrapedSlugs: Set<string>;
  imageUrls: Map<string, string | null>;
  trackCounts: Map<string, number>;
  loading: boolean;
  fetchAll: () => Promise<void>;
}

export const useDataStore = create<DataStore>((set) => ({
  artists: [],
  scrapedSlugs: new Set(),
  imageUrls: new Map(),
  trackCounts: new Map(),
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [artistsRes, manifestRes] = await Promise.all([
        fetch('/artists.json'),
        fetch('/artists/manifest.json'),
      ]);
      const artists: Artist[] = await artistsRes.json();
      const manifest: ManifestEntry[] = await manifestRes.json();
      const scrapedSlugs = new Set(manifest.map((e) => e.slug));
      const imageUrls = new Map(manifest.map((e) => [e.slug, e.image_url]));
      const trackCounts = new Map(manifest.map((e) => [e.slug, e.track_count]));
      set({ artists, scrapedSlugs, imageUrls, trackCounts, loading: false });
    } catch (err) {
      console.error('Failed to load data:', err);
      set({ loading: false });
    }
  },
}));
