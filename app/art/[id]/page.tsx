import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import SaveToBoard from "@/components/SaveToBoard";
import SocialPanel from "@/components/SocialPanel";

type ArtDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArtDetailPage({ params }: ArtDetailPageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: {
      comments: { include: { user: { select: { displayName: true } } }, orderBy: { createdAt: "asc" } },
      author: { select: { id: true, handle: true, displayName: true, isPrivate: true } },
      _count: { select: { likes: true } },
      likes: user ? { where: { userId: user.id }, select: { userId: true } } : false,
    },
  });

  if (!artwork) {
    notFound();
  }

  if (artwork.author?.isPrivate && artwork.author.id !== user?.id) {
    const followsAuthor = user ? await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: user.id, followingId: artwork.author.id } } }) : null;
    if (!followsAuthor) notFound();
  }

  const tags = parseTags(artwork.tags);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex text-sm font-medium text-stone-600 transition hover:text-stone-900"
      >
        ← Back to explore
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            width={artwork.width ?? 1200}
            height={artwork.height ?? 1600}
            className="h-auto w-full object-contain"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        <aside className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              {artwork.title}
            </h1>
            {artwork.author ? (
              <Link href={`/profiles/${artwork.author.handle}`} className="mt-2 inline-flex text-base text-stone-600 transition hover:text-stone-900 hover:underline">
                by {artwork.artistName}
              </Link>
            ) : (
              <p className="mt-2 text-base text-stone-600">by {artwork.artistName}</p>
            )}
          </div>

          <SaveToBoard artworkId={artwork.id} signedIn={Boolean(user)} />

          {artwork.description && (
            <p className="text-sm leading-relaxed text-stone-700">
              {artwork.description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-stone-500">
            Published {artwork.createdAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <SocialPanel
            artworkId={artwork.id}
            signedIn={Boolean(user)}
            initialLikes={artwork._count.likes}
            initialLiked={Boolean(artwork.likes?.length)}
            initialComments={artwork.comments}
          />
        </aside>
      </div>
    </main>
  );
}
