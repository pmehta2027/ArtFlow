import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ requesterId: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { requesterId } = await params;

  const followRequest = await prisma.followRequest.findUnique({ where: { requesterId_recipientId: { requesterId, recipientId: currentUser.id } } });
  if (!followRequest) return NextResponse.json({ error: "Follow request not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.follow.upsert({ where: { followerId_followingId: { followerId: requesterId, followingId: currentUser.id } }, create: { followerId: requesterId, followingId: currentUser.id }, update: {} }),
    prisma.followRequest.delete({ where: { requesterId_recipientId: { requesterId, recipientId: currentUser.id } } }),
  ]);
  return NextResponse.json({ accepted: true });
}
