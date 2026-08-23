import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-50 border-b border-black bg-black/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight text-white">
          ArtFlow
        </Link>

        <form action="/" className="hidden min-w-0 flex-1 items-center md:flex">
          <label htmlFor="art-search" className="sr-only">Search artwork by title or tag</label>
          <input id="art-search" name="q" type="search" placeholder="Search artwork or tags" className="min-w-0 flex-1 rounded-l-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white outline-none placeholder:text-white/65 focus:border-white" />
          <button className="rounded-r-full border border-l-0 border-white/30 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/15">Search</button>
        </form>

        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Explore
          </Link>
          {user && <Link href="/boards" className="rounded-full px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15">Boards</Link>}
          {user && <Link href="/messages" className="rounded-full px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15">Messages</Link>}
          <Link
            href="/upload"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-sky-100"
          >
            Upload
          </Link>
          {user && <Link href={`/profiles/${user.handle}`} className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">Profile</Link>}
          <Show when="signed-out">
            <SignUpButton>
              <button className="rounded-full border border-white/40 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15">Sign up</button>
            </SignUpButton>
          </Show>
        </nav>
      </div>
    </header>
  );
}
