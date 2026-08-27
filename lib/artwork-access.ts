import { prisma } from "@/lib/prisma";

export async function canAccessArtwork(artworkId: string, viewerId: string | undefined) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    select: { authorId: true, author: { select: { isPrivate: true } } },
  });
  if (!artwork) return { exists: false, allowed: false };
  if (!artwork.author?.isPrivate || artwork.authorId === viewerId) return { exists: true, allowed: true };
  if (!viewerId || !artwork.authorId) return { exists: true, allowed: false };
  const followsAuthor = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: artwork.authorId } } });
  return { exists: true, allowed: Boolean(followsAuthor) };
}
