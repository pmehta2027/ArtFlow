import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { handle } = await params;
  const recipient = await prisma.user.findUnique({ where: { handle } });
  if (!recipient) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  if (recipient.id === currentUser.id) return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
  if (recipient.isPrivate) {
    const followsRecipient = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUser.id, followingId: recipient.id } } });
    if (!followsRecipient) return NextResponse.json({ error: "This private profile must approve your follow request before you can message them." }, { status: 403 });
  }

  const [participantOneId, participantTwoId] = [currentUser.id, recipient.id].sort();
  const conversation = await prisma.conversation.upsert({
    where: { participantOneId_participantTwoId: { participantOneId, participantTwoId } },
    create: { participantOneId, participantTwoId },
    update: {},
  });
  return NextResponse.json({ id: conversation.id });
}
