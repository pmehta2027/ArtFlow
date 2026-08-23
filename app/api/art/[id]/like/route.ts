import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id: artworkId } = await params;
  const existing = await prisma.like.findUnique({ where: { userId_artworkId: { userId: user.id, artworkId } } });
  if (existing) await prisma.like.delete({ where: { userId_artworkId: { userId: user.id, artworkId } } });
  else await prisma.like.create({ data: { userId: user.id, artworkId } });
  const count = await prisma.like.count({ where: { artworkId } });
  return NextResponse.json({ liked: !existing, count });
}
