import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { serializeTags } from "../lib/types";

const prisma = new PrismaClient();

const samples = [
  {
    title: "Crimson Horizon",
    artistName: "Maya Chen",
    description: "A study in warm gradients and soft light at dusk.",
    tags: ["digital", "landscape", "abstract"],
    seed: "artflow-1",
    width: 800,
    height: 1200,
  },
  {
    title: "Urban Reflections",
    artistName: "Jordan Ellis",
    description: "Rain-slick streets mirrored in neon color.",
    tags: ["photography", "urban", "night"],
    seed: "artflow-2",
    width: 900,
    height: 700,
  },
  {
    title: "Botanical Study No. 4",
    artistName: "Priya Kapoor",
    description: "Ink and watercolor exploration of tropical foliage.",
    tags: ["illustration", "nature", "watercolor"],
    seed: "artflow-3",
    width: 700,
    height: 1000,
  },
  {
    title: "Portrait in Blue",
    artistName: "Leo Martinez",
    description: "Minimal portrait focusing on expression and color blocking.",
    tags: ["portrait", "digital", "minimal"],
    seed: "artflow-4",
    width: 800,
    height: 1000,
  },
  {
    title: "Coastal Lines",
    artistName: "Sofia Nguyen",
    description: "Geometric interpretation of shoreline patterns.",
    tags: ["abstract", "geometry", "seascape"],
    seed: "artflow-5",
    width: 1000,
    height: 800,
  },
  {
    title: "Studio Still Life",
    artistName: "Amir Hassan",
    description: "Muted tones and careful composition in oil.",
    tags: ["still-life", "painting", "classic"],
    seed: "artflow-6",
    width: 900,
    height: 1100,
  },
  {
    title: "Dream Sequence",
    artistName: "Elena Rossi",
    description: "Surreal collage blending photography and illustration.",
    tags: ["collage", "surreal", "mixed-media"],
    seed: "artflow-7",
    width: 850,
    height: 950,
  },
  {
    title: "Mountain Light",
    artistName: "Noah Wright",
    description: "High-contrast alpine scene at golden hour.",
    tags: ["landscape", "photography", "mountains"],
    seed: "artflow-8",
    width: 1200,
    height: 800,
  },
];

function toHandle(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function ensureArtworkAuthors() {
  const artworks = await prisma.artwork.findMany({ where: { authorId: null } });
  for (const artwork of artworks) {
    const handle = toHandle(artwork.artistName);
    const user = await prisma.user.upsert({
      where: { handle },
      update: {},
      create: { handle, displayName: artwork.artistName },
    });
    await prisma.artwork.update({ where: { id: artwork.id }, data: { authorId: user.id } });
  }
}

async function main() {
  const existingCount = await prisma.artwork.count();
  if (existingCount > 0) {
    await ensureArtworkAuthors();
    console.log("Database already has artwork. Added profile links where needed.");
    return;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  for (const sample of samples) {
    const imageUrl = `https://picsum.photos/seed/${sample.seed}/${sample.width}/${sample.height}`;
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch seed image for ${sample.title}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const fileName = `${sample.seed}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const metadata = await sharp(buffer).metadata();

    const author = await prisma.user.upsert({
      where: { handle: toHandle(sample.artistName) },
      update: {},
      create: { handle: toHandle(sample.artistName), displayName: sample.artistName },
    });

    await prisma.artwork.create({
      data: {
        title: sample.title,
        artistName: sample.artistName,
        description: sample.description,
        imageUrl: `/uploads/${fileName}`,
        tags: serializeTags(sample.tags),
        width: metadata.width ?? sample.width,
        height: metadata.height ?? sample.height,
        authorId: author.id,
      },
    });
  }

  console.log(`Seeded ${samples.length} artworks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
