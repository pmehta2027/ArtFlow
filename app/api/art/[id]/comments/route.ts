import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessArtwork } from "@/lib/artwork-access";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id: artworkId } = await params;
  const access = await canAccessArtwork(artworkId, user.id);
  if (!access.exists || !access.allowed) return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  const { body } = await request.json() as { body?: string };
  if (!body?.trim() || body.trim().length > 500) return NextResponse.json({ error: "Comments must be 1–500 characters." }, { status: 400 });
  const comment = await prisma.comment.create({ data: { body: body.trim(), artworkId, userId: user.id }, include: { user: { select: { displayName: true } } } });
  return NextResponse.json(comment, { status: 201 });
}
