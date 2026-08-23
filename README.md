# ArtFlow

A minimal Pinterest-style social gallery for artists. Browse a masonry feed of artwork and upload new pieces — no accounts required in this prototype.

## Features

- Masonry explore feed with tag filtering
- Upload artwork with title, artist name, description, and tags
- Artwork detail pages
- Local SQLite storage and on-disk image uploads

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- sharp (image metadata)
- react-masonry-css

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run database migrations:

```bash
npm run db:migrate
```

3. Seed sample artwork (optional):

```bash
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/page.tsx` — explore feed
- `app/upload/page.tsx` — upload form
- `app/art/[id]/page.tsx` — artwork detail
- `app/api/art/` — list and create artwork
- `components/` — UI components
- `prisma/schema.prisma` — database schema
- `public/uploads/` — uploaded images (gitignored)

## Notes

- Uploaded images are stored in `public/uploads/`
- Database file: `prisma/dev.db`
- V1 intentionally excludes auth, boards, likes, and comments

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed sample artwork |
