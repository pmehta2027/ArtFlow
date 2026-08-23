import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id: conversationId } = await params;
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, OR: [{ participantOneId: user.id }, { participantTwoId: user.id }] } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const { body } = await request.json() as { body?: string };
  if (!body?.trim() || body.trim().length > 1000) return NextResponse.json({ error: "Messages must be 1–1000 characters." }, { status: 400 });
  const message = await prisma.message.create({ data: { body: body.trim(), conversationId, authorId: user.id }, include: { author: { select: { displayName: true } } } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  return NextResponse.json(message, { status: 201 });
}
