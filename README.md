# ArtFlow

A Pinterest-style social gallery for artists. Browse a masonry feed of artwork and upload new pieces. No accounts required in this prototype.

## Features

- Masonry explore feed
- Upload artwork with title, artist name, description, and tags
- Search for artwork using tags or title in the search bar
- Artwork detail pages with the ability to like, comment and save artwork
- Follow and directly message other users
- Images save locally during development, or automatically use Cloudinary when its credentials are configured
- Prisma and SQLite store users, artwork, boards, likes, comments, follows, profile images, and conversations
- Clerk provides secure sign-up, sign-in, and sign-out

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
