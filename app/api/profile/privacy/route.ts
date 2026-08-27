import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { isPrivate } = await request.json() as { isPrivate?: unknown };
  if (typeof isPrivate !== "boolean") return NextResponse.json({ error: "A profile visibility setting is required." }, { status: 400 });

  const profile = await prisma.user.update({
    where: { id: currentUser.id },
    data: { isPrivate },
    select: { isPrivate: true },
  });
  return NextResponse.json(profile);
}
