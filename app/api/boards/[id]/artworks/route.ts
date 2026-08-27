import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessArtwork } from "@/lib/artwork-access";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { artworkId } = await request.json() as { artworkId?: string };
  const board = await prisma.board.findFirst({ where: { id, ownerId: user.id } });
  if (!board || !artworkId) return NextResponse.json({ error: "Board or artwork not found." }, { status: 404 });
  const access = await canAccessArtwork(artworkId, user.id);
  if (!access.exists || !access.allowed) return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  await prisma.boardArtwork.upsert({ where: { boardId_artworkId: { boardId: id, artworkId } }, create: { boardId: id, artworkId }, update: {} });
  return NextResponse.json({ ok: true });
}
