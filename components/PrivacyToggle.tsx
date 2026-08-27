"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyToggle({ initialIsPrivate }: { initialIsPrivate: boolean }) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function togglePrivacy() {
    const nextIsPrivate = !isPrivate;
    setSaving(true);
    const response = await fetch("/api/profile/privacy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrivate: nextIsPrivate }),
    });
    if (response.ok) {
      setIsPrivate(nextIsPrivate);
      router.refresh();
    }
    setSaving(false);
  }

  return <button type="button" onClick={togglePrivacy} disabled={saving} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-60">{saving ? "Saving..." : isPrivate ? "Private profile" : "Public profile"}</button>;
}
