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

  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUser.id, followingId: profile.id } } });
  if (existing) await prisma.follow.delete({ where: { followerId_followingId: { followerId: currentUser.id, followingId: profile.id } } });
  else await prisma.follow.create({ data: { followerId: currentUser.id, followingId: profile.id } });

  const followers = await prisma.follow.count({ where: { followingId: profile.id } });
  return NextResponse.json({ following: !existing, followers });
}
