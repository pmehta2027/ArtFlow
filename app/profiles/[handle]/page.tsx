import Link from "next/link";
import { notFound } from "next/navigation";
import MasonryGrid from "@/components/MasonryGrid";
import FollowRequests from "@/components/FollowRequests";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProfileHeader from "@/components/ProfileHeader";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const currentUser = await getCurrentUser();
  const profile = await prisma.user.findUnique({ where: { handle }, include: { _count: { select: { artworks: true, followers: true, following: true } } } });
  if (!profile) notFound();

  const isOwnProfile = profile.id === currentUser?.id;
  const follow = currentUser && !isOwnProfile ? await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUser.id, followingId: profile.id } } }) : null;
  const pendingRequest = currentUser && !isOwnProfile ? await prisma.followRequest.findUnique({ where: { requesterId_recipientId: { requesterId: currentUser.id, recipientId: profile.id } } }) : null;
  const canViewProfile = !profile.isPrivate || isOwnProfile || Boolean(follow);

  const [artworks, followerProfiles, followingProfiles, receivedRequests] = await Promise.all([
    canViewProfile ? prisma.artwork.findMany({ where: { authorId: profile.id }, include: { author: { select: { handle: true, displayName: true } } }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
    canViewProfile ? prisma.follow.findMany({ where: { followingId: profile.id }, include: { follower: { select: { handle: true, displayName: true, avatarUrl: true } } } }).then(follows => follows.map(item => item.follower)) : Promise.resolve([]),
    canViewProfile ? prisma.follow.findMany({ where: { followerId: profile.id }, include: { following: { select: { handle: true, displayName: true, avatarUrl: true } } } }).then(follows => follows.map(item => item.following)) : Promise.resolve([]),
    isOwnProfile ? prisma.followRequest.findMany({ where: { recipientId: profile.id }, include: { requester: { select: { id: true, handle: true, displayName: true } } }, orderBy: { createdAt: "asc" } }).then(requests => requests.map(request => request.requester)) : Promise.resolve([]),
  ]);

  return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
    <Link href="/" className="text-sm font-medium text-stone-600 transition hover:text-stone-900">← Back to explore</Link>
    <div className="mt-7"><ProfileHeader displayName={profile.displayName} handle={profile.handle} avatarUrl={profile.avatarUrl} postCount={profile._count.artworks} followers={profile._count.followers} followingCount={profile._count.following} followerProfiles={followerProfiles} followingProfiles={followingProfiles} signedIn={Boolean(currentUser)} isOwnProfile={isOwnProfile} initialFollowing={Boolean(follow)} initialRequested={Boolean(pendingRequest)} isPrivate={profile.isPrivate} canViewProfile={canViewProfile} /></div>
    {isOwnProfile && <FollowRequests initialRequests={receivedRequests} />}
    <section className="mt-8"><h2 className="mb-5 text-lg font-semibold text-stone-900">Artwork</h2>{canViewProfile ? artworks.length ? <MasonryGrid artworks={artworks} /> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center text-sm text-stone-600">No artwork published yet.</div> : <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center text-sm text-stone-600">This profile is private. Send a follow request to see artwork, followers, following, and messaging.</div>}</section>
  </main>;
}
