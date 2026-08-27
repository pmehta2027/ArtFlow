import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessArtwork } from "@/lib/artwork-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const currentUser = await getCurrentUser();
  const access = await canAccessArtwork(id, currentUser?.id);
  if (!access.exists || !access.allowed) return NextResponse.json({ error: "Artwork not found." }, { status: 404 });

  const artwork = await prisma.artwork.findUnique({
    where: { id },
  });

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }

  return NextResponse.json(artwork);
}
