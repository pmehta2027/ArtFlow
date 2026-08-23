import { NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { serializeTags } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { storeArtworkImage } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(artworks);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in before publishing artwork." }, { status: 401 });
    }
    const formData = await request.formData();
    const image = formData.get("image");
    const title = formData.get("title");
    const description = formData.get("description");
    const tagsInput = formData.get("tags");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image is required." }, { status: 400 });
    }
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(image.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed." }, { status: 400 });
    }
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be 10 MB or smaller." }, { status: 400 });
    }

    const extension = image.type === "image/jpeg" ? "jpg" : image.type === "image/png" ? "png" : "webp";
    const buffer = Buffer.from(await image.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const storedImage = await storeArtworkImage(image, `${crypto.randomUUID()}.${extension}`);
    const tags = typeof tagsInput === "string" ? tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

    const artwork = await prisma.artwork.create({
      data: {
        title: title.trim(),
        artistName: user.displayName,
        authorId: user.id,
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        imageUrl: storedImage.imageUrl,
        tags: serializeTags(tags),
        width: metadata.width ?? null,
        height: metadata.height ?? null,
      },
    });

    return NextResponse.json(artwork, { status: 201 });
  } catch (error) {
    console.error("Failed to upload artwork:", error);
    return NextResponse.json(
      { error: "Failed to upload artwork." },
      { status: 500 },
    );
  }
}
