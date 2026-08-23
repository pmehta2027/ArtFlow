export type Artwork = {
  id: string;
  title: string;
  artistName: string;
  description: string | null;
  imageUrl: string;
  tags: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
  author?: {
    handle: string;
    displayName: string;
  } | null;
};

export function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((tag): tag is string => typeof tag === "string");
    }
  } catch {
    // fall through
  }

  return [];
}

export function serializeTags(tags: string[]): string {
  return JSON.stringify(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean));
}
