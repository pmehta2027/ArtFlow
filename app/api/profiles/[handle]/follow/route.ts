import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { handle } = await params;
  const profile = await prisma.user.findUnique({ where: { handle } });
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  if (profile.id === currentUser.id) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });

  const followKey = { followerId: currentUser.id, followingId: profile.id };
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: followKey } });
  if (existing) {
    await prisma.follow.delete({ where: { followerId_followingId: followKey } });
  } else if (profile.isPrivate) {
    const requestKey = { requesterId: currentUser.id, recipientId: profile.id };
    const pending = await prisma.followRequest.findUnique({ where: { requesterId_recipientId: requestKey } });
    if (pending) {
      await prisma.followRequest.delete({ where: { requesterId_recipientId: requestKey } });
      const followers = await prisma.follow.count({ where: { followingId: profile.id } });
      return NextResponse.json({ following: false, requested: false, followers });
    }
    await prisma.followRequest.create({ data: requestKey });
    const followers = await prisma.follow.count({ where: { followingId: profile.id } });
    return NextResponse.json({ following: false, requested: true, followers });
  } else {
    await prisma.follow.create({ data: followKey });
  }

  const followers = await prisma.follow.count({ where: { followingId: profile.id } });
  return NextResponse.json({ following: !existing, requested: false, followers });
}
