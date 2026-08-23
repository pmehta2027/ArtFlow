import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storeArtworkImage } from "@/lib/storage";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File)) return NextResponse.json({ error: "Profile image is required." }, { status: 400 });
  if (!ALLOWED_TYPES.has(image.type)) return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
  if (image.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Profile images must be 5 MB or smaller." }, { status: 400 });

  const extension = image.type === "image/jpeg" ? "jpg" : image.type === "image/png" ? "png" : "webp";
  const storedImage = await storeArtworkImage(image, `avatar-${crypto.randomUUID()}.${extension}`);
  const profile = await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: storedImage.imageUrl } });
  return NextResponse.json({ avatarUrl: profile.avatarUrl });
}
