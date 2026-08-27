import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ requesterId: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { requesterId } = await params;
  const result = await prisma.followRequest.deleteMany({ where: { requesterId, recipientId: currentUser.id } });
  if (!result.count) return NextResponse.json({ error: "Follow request not found." }, { status: 404 });
  return NextResponse.json({ declined: true });
}
