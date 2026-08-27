import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BoardsPage() {
  const user = await getCurrentUser();
  if (!user) return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 text-center"><h1 className="text-2xl font-semibold">Your boards</h1><p className="mt-2 text-sm text-stone-600">Sign in to collect artwork into boards.</p><Link href="/sign-in" className="mt-5 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white">Create a profile</Link></main>;
  const follows = await prisma.follow.findMany({ where: { followerId: user.id }, select: { followingId: true } });
  const visibleAuthorIds = new Set([user.id, ...follows.map(follow => follow.followingId)]);
  const boards = await prisma.board.findMany({ where: { ownerId: user.id }, include: { artworks: { include: { artwork: { include: { author: { select: { isPrivate: true } } } } }, take: 4 }, _count: { select: { artworks: true } } }, orderBy: { createdAt: "desc" } });
  return <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6"><h1 className="text-3xl font-semibold tracking-tight">Your boards</h1><p className="mt-2 text-sm text-stone-600">Save artwork into collections you can revisit.</p>{boards.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{boards.map(board => { const visibleArtworks = board.artworks.filter(({ artwork }) => !artwork.author?.isPrivate || (artwork.authorId && visibleAuthorIds.has(artwork.authorId))); return <section key={board.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200"><div className="grid h-32 grid-cols-2 bg-stone-100">{visibleArtworks.map(({ artwork }) => <Image key={artwork.id} src={artwork.imageUrl} alt="" width={200} height={160} className="h-full w-full object-cover" />)}</div><div className="p-4"><h2 className="font-semibold">{board.name}</h2><p className="mt-1 text-sm text-stone-500">{board._count.artworks} saved pieces</p></div></section>; })}</div> : <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-600">Open any artwork and use “Save to board” to start a collection.</div>}</main>;
}
