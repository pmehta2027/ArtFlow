"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ displayName, avatarUrl }: { displayName: string; avatarUrl: string | null }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("image", file);
    const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
    const data = await response.json() as { avatarUrl?: string; error?: string };
    if (!response.ok || !data.avatarUrl) setError(data.error ?? "Unable to update profile photo.");
    else { setImageUrl(data.avatarUrl); router.refresh(); }
    setUploading(false);
    event.target.value = "";
  }

  return <div className="space-y-2"><label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-stone-900 text-xl font-semibold text-white"><AvatarImage displayName={displayName} avatarUrl={imageUrl} /><span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-medium opacity-0 transition group-hover:opacity-100">Change</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={upload} disabled={uploading} /></label><p className="text-xs text-stone-500">{uploading ? "Uploading..." : "Profile photo"}</p>{error && <p className="max-w-40 text-xs text-rose-700">{error}</p>}</div>;
}

export function AvatarImage({ displayName, avatarUrl }: { displayName: string; avatarUrl: string | null }) {
  if (!avatarUrl) return <span>{displayName.slice(0, 1).toUpperCase()}</span>;
  return <Image src={avatarUrl} alt={`${displayName}'s profile photo`} fill sizes="80px" className="object-cover" />;
}
