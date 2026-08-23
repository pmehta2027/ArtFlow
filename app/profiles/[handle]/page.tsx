import Link from "next/link";
import { notFound } from "next/navigation";
import MasonryGrid from "@/components/MasonryGrid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProfileHeader from "@/components/ProfileHeader";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const currentUser = await getCurrentUser();
  const profile = await prisma.user.findUnique({
    where: { handle },
    include: {
      artworks: {
        include: { author: { select: { handle: true, displayName: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { followers: true, following: true } },
      followers: { include: { follower: { select: { handle: true, displayName: true, avatarUrl: true } } } },
      following: { include: { following: { select: { handle: true, displayName: true, avatarUrl: true } } } },
    },
  });

  if (!profile) notFound();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm font-medium text-stone-600 transition hover:text-stone-900">← Back to explore</Link>
      <div className="mt-7">
        <ProfileHeader
          displayName={profile.displayName}
          handle={profile.handle}
          avatarUrl={profile.avatarUrl}
          postCount={profile.artworks.length}
          followers={profile._count.followers}
          followerProfiles={profile.followers.map((follow) => follow.follower)}
          followingProfiles={profile.following.map((follow) => follow.following)}
          signedIn={Boolean(currentUser)}
          isOwnProfile={profile.id === currentUser?.id}
          initialFollowing={Boolean(currentUser && profile.followers.some((follow) => follow.followerId === currentUser.id))}
        />
      </div>
      <section className="mt-8">
        <h2 className="mb-5 text-lg font-semibold text-stone-900">Artwork</h2>
        {profile.artworks.length ? <MasonryGrid artworks={profile.artworks} /> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center text-sm text-stone-600">No artwork published yet.</div>}
      </section>
    </main>
  );
}
