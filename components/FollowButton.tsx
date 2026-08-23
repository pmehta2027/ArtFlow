"use client";

import { useState } from "react";
import Link from "next/link";

export default function FollowButton({ handle, signedIn, isOwnProfile, initialFollowing, onFollowChange }: { handle: string; signedIn: boolean; isOwnProfile: boolean; initialFollowing: boolean; onFollowChange: (following: boolean, followers: number) => void }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) return null;
  if (!signedIn) return <Link href="/sign-in" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Sign in to follow</Link>;

  async function toggleFollow() {
    setLoading(true);
    const response = await fetch(`/api/profiles/${handle}/follow`, { method: "POST" });
    const data = await response.json() as { following?: boolean; followers?: number };
    if (response.ok && typeof data.following === "boolean" && typeof data.followers === "number") {
      setFollowing(data.following);
      onFollowChange(data.following, data.followers);
    }
    setLoading(false);
  }

  return <button onClick={toggleFollow} disabled={loading} className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${following ? "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50" : "bg-stone-900 text-white hover:bg-stone-700"}`}>{loading ? "Updating..." : following ? "Following" : "Follow"}</button>;
}
