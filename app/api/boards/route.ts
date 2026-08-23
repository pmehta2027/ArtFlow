import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const boards = await prisma.board.findMany({ where: { ownerId: user.id }, include: { _count: { select: { artworks: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(boards);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { name } = await request.json() as { name?: string };
  if (!name?.trim() || name.trim().length > 48) return NextResponse.json({ error: "Board names must be 1–48 characters." }, { status: 400 });
  try {
    const board = await prisma.board.create({ data: { name: name.trim(), ownerId: user.id } });
    return NextResponse.json(board, { status: 201 });
  } catch { return NextResponse.json({ error: "You already have a board with that name." }, { status: 409 }); }
}
