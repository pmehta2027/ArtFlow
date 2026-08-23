"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function MessageButton({ handle, signedIn, isOwnProfile }: { handle: string; signedIn: boolean; isOwnProfile: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  if (isOwnProfile) return null;
  if (!signedIn) return <Link href="/sign-in" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800">Sign in to message</Link>;
  async function startConversation() {
    setLoading(true);
    const response = await fetch(`/api/profiles/${handle}/conversation`, { method: "POST" });
    const data = await response.json() as { id?: string };
    if (response.ok && data.id) router.push(`/messages/${data.id}`);
    else setLoading(false);
  }
  return <button onClick={startConversation} disabled={loading} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-60">{loading ? "Opening..." : "Message"}</button>;
}
