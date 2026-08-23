import UploadForm from "@/components/UploadForm";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function UploadPage() {
  const user = await getCurrentUser();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Upload artwork
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Share your latest piece with the community.
        </p>
      </section>

      {user ? (
        <UploadForm />
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-600">Sign in to publish artwork under your profile.</p>
          <Link href="/sign-in" className="mt-4 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white">Create a profile</Link>
        </div>
      )}
    </main>
  );
}
