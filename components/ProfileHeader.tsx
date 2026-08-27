"use client";

import { useState } from "react";
import FollowButton from "@/components/FollowButton";
import MessageButton from "@/components/MessageButton";
import AccountButton from "@/components/AccountButton";
import AvatarUpload, { AvatarImage } from "@/components/AvatarUpload";
import FollowLists from "@/components/FollowLists";
import PrivacyToggle from "@/components/PrivacyToggle";

type ProfilePreview = { handle: string; displayName: string; avatarUrl: string | null };

export default function ProfileHeader({ displayName, handle, avatarUrl, postCount, followers, followingCount, followerProfiles, followingProfiles, signedIn, isOwnProfile, initialFollowing, initialRequested, isPrivate, canViewProfile }: { displayName: string; handle: string; avatarUrl: string | null; postCount: number; followers: number; followingCount: number; followerProfiles: ProfilePreview[]; followingProfiles: ProfilePreview[]; signedIn: boolean; isOwnProfile: boolean; initialFollowing: boolean; initialRequested: boolean; isPrivate: boolean; canViewProfile: boolean }) {
  const [followerCount, setFollowerCount] = useState(followers);
  return <section className="flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div>{isOwnProfile ? <AvatarUpload displayName={displayName} avatarUrl={avatarUrl} /> : <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-stone-900 text-xl font-semibold text-white"><AvatarImage displayName={displayName} avatarUrl={avatarUrl} /></div>}<h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">{displayName}{isPrivate && <span className="ml-2 text-base font-medium text-stone-500">Private</span>}</h1><p className="mt-1 text-sm text-stone-500">@{handle}</p><div className="mt-3 flex gap-4 text-sm text-stone-600"><span><strong className="font-semibold text-stone-900">{postCount}</strong> {postCount === 1 ? "post" : "posts"}</span>{canViewProfile ? <FollowLists followers={followerProfiles} following={followingProfiles} followersCount={followerCount} /> : <><span><strong className="font-semibold text-stone-900">{followerCount}</strong> {followerCount === 1 ? "follower" : "followers"}</span><span><strong className="font-semibold text-stone-900">{followingCount}</strong> following</span></>}</div></div><div className="flex flex-wrap gap-2">{isOwnProfile ? <><PrivacyToggle initialIsPrivate={isPrivate} /><AccountButton /></> : <>{canViewProfile && <MessageButton handle={handle} signedIn={signedIn} isOwnProfile={false} />}<FollowButton handle={handle} signedIn={signedIn} isOwnProfile={false} initialFollowing={initialFollowing} initialRequested={initialRequested} onFollowChange={(_isFollowing, _isRequested, nextFollowers) => setFollowerCount(nextFollowers)} /></>}</div></section>;
}
