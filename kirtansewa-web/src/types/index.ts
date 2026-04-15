export interface Artist {
  name: string;
  url: string;
  slug: string;
}

export interface RawTrack {
  name: string;
  url: string;
}

export interface ArtistDetail {
  name: string;
  url: string;
  image_url: string | null;
  body: string[];
  tracks: RawTrack[];
}

export interface Track {
  name: string;
  displayName: string;
  url: string;
  artistLabel?: string;
  coverUrl?: string | null;
  artistSlug?: string;
}

export function stripArtistPrefix(name: string): string {
  if (name.includes(' \u2013 ')) {
    return name.split(' \u2013 ').slice(1).join(' \u2013 ');
  }
  return name;
}

export interface TrackMeta {
  artistLabel?: string;
  coverUrl?: string | null;
  artistSlug?: string;
}

export function toTrack(raw: RawTrack, meta?: TrackMeta): Track {
  return {
    name: raw.name,
    displayName: stripArtistPrefix(raw.name),
    url: raw.url,
    artistLabel: meta?.artistLabel,
    coverUrl: meta?.coverUrl,
    artistSlug: meta?.artistSlug,
  };
}
