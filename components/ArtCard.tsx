import Image from "next/image";
import Link from "next/link";
import { type Artwork } from "@/lib/types";

type ArtCardProps = {
  artwork: Artwork;
};

export default function ArtCard({ artwork }: ArtCardProps) {
  return (
    <article className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-black/85 shadow-sm ring-1 ring-black/30 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/art/${artwork.id}`} className="block">
      <div className="relative w-full overflow-hidden">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          width={artwork.width ?? 600}
          height={artwork.height ?? 800}
          className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      </Link>
      <div className="px-4 py-3">
        <h2 className="truncate text-sm font-semibold text-white">
          {artwork.title}
        </h2>
        {artwork.author ? (
          <Link href={`/profiles/${artwork.author.handle}`} className="mt-0.5 block truncate text-xs text-white transition hover:text-sky-200">
            {artwork.artistName}
          </Link>
        ) : (
          <p className="truncate text-xs text-white">{artwork.artistName}</p>
        )}
      </div>
    </article>
  );
}
