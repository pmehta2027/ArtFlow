import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function toHandle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "artist";
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const displayName = clerkUser?.fullName?.trim() || clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress.split("@")[0] || "Artist";
  const baseHandle = toHandle(clerkUser?.username || displayName);
  const handle = `${baseHandle}-${userId.slice(-8).toLowerCase()}`;

  return prisma.user.create({ data: { clerkId: userId, displayName, handle } });
}
