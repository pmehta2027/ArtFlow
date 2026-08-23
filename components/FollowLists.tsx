"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type ProfilePreview = { handle: string; displayName: string; avatarUrl: string | null };

export default function FollowLists({ followers, following, followersCount }: { followers: ProfilePreview[]; following: ProfilePreview[]; followersCount: number }) {
  const [activeList, setActiveList] = useState<"followers" | "following" | null>(null);
  const profiles = activeList === "followers" ? followers : following;
  const label = activeList === "followers" ? "Followers" : "Following";

  return <><button onClick={() => setActiveList("followers")} className="text-left transition hover:text-stone-900"><strong className="font-semibold text-stone-900">{followersCount}</strong> {followersCount === 1 ? "follower" : "followers"}</button><button onClick={() => setActiveList("following")} className="text-left transition hover:text-stone-900"><strong className="font-semibold text-stone-900">{following.length}</strong> following</button>{activeList && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setActiveList(null)}><section className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-stone-900">{label}</h2><button onClick={() => setActiveList(null)} className="rounded-full px-2 text-xl text-stone-500 hover:bg-stone-100" aria-label="Close">×</button></div><div className="mt-4 max-h-80 divide-y divide-stone-100 overflow-auto">{profiles.length ? profiles.map(profile => <Link key={profile.handle} href={`/profiles/${profile.handle}`} onClick={() => setActiveList(null)} className="flex items-center gap-3 py-3 hover:bg-stone-50"><div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-stone-900 text-sm font-semibold text-white">{profile.avatarUrl ? <Image src={profile.avatarUrl} alt="" fill sizes="40px" className="object-cover" /> : profile.displayName.slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-semibold text-stone-900">{profile.displayName}</p><p className="text-xs text-stone-500">@{profile.handle}</p></div></Link>) : <p className="py-8 text-center text-sm text-stone-500">No accounts yet.</p>}</div></section></div>}</>;
}
