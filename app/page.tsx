import Link from "next/link";
import MasonryGrid from "@/components/MasonryGrid";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string }> }) {
  const { q, tag } = await searchParams;
  const searchQuery = (q ?? tag)?.trim().toLowerCase() ?? "";
  const currentUser = await getCurrentUser();
  const followedProfiles = currentUser ? await prisma.follow.findMany({ where: { followerId: currentUser.id }, select: { followingId: true } }) : [];
  const visibleAuthorIds = currentUser ? [currentUser.id, ...followedProfiles.map(follow => follow.followingId)] : [];
  const artworks = await prisma.artwork.findMany({
    where: {
      OR: [
        { author: null },
        { author: { is: { isPrivate: false } } },
        ...(visibleAuthorIds.length ? [{ authorId: { in: visibleAuthorIds } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { handle: true, displayName: true } } },
  });
  const visibleArtworks = searchQuery
    ? artworks.filter((artwork) => artwork.title.toLowerCase().includes(searchQuery) || parseTags(artwork.tags).some((artworkTag) => artworkTag.includes(searchQuery)))
    : artworks;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Discover art
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white">
          {searchQuery ? `Results for “${searchQuery}”.` : "Browse a living gallery of artwork from creators around the world."}
        </p>
        {searchQuery && <Link href="/" className="mt-3 inline-flex text-sm font-medium text-white underline underline-offset-4 hover:text-sky-100">Clear search</Link>}
      </section>

      <MasonryGrid
        artworks={visibleArtworks}
        emptyMessage={searchQuery ? `No artwork matches “${searchQuery}”.` : undefined}
      />

      {artworks.length === 0 && (
        <div className="mt-6 text-center">
          <Link
            href="/upload"
            className="inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Upload the first piece
          </Link>
        </div>
      )}
    </main>
  );
}
