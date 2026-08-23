import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

type StoredImage = { imageUrl: string; provider: "cloudinary" | "local" };

function cloudinaryIsConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function storeArtworkImage(file: File, fileName: string): Promise<StoredImage> {
  if (cloudinaryIsConfigured()) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = process.env.CLOUDINARY_FOLDER || "artflow";
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
    const data = new FormData();
    data.set("file", file);
    data.set("api_key", process.env.CLOUDINARY_API_KEY!);
    data.set("timestamp", timestamp);
    data.set("folder", folder);
    data.set("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
    const result = await response.json() as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) throw new Error(result.error?.message ?? "Cloudinary upload failed.");
    return { imageUrl: result.secure_url, provider: "cloudinary" };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));
  return { imageUrl: `/uploads/${fileName}`, provider: "local" };
}
