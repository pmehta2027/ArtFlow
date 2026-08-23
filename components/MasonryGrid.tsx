"use client";

import Masonry from "react-masonry-css";
import ArtCard from "@/components/ArtCard";
import { type Artwork } from "@/lib/types";

type MasonryGridProps = {
  artworks: Artwork[];
  emptyMessage?: string;
};

const breakpointColumns = {
  default: 4,
  1280: 3,
  768: 2,
  640: 1,
};

export default function MasonryGrid({ artworks, emptyMessage = "Be the first to share something beautiful." }: MasonryGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/60 bg-black/20 px-6 py-16 text-center text-white">
        <h2 className="text-lg font-semibold">No artwork yet</h2>
        <p className="mt-2 text-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <Masonry breakpointCols={breakpointColumns} className="flex w-auto gap-4" columnClassName="bg-clip-padding">
    {artworks.map((artwork) => <ArtCard key={artwork.id} artwork={artwork} />)}
  </Masonry>;
}
