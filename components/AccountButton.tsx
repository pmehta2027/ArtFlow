"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function AccountButton() {
  return <SignOutButton redirectUrl="/"><button className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50">Sign out</button></SignOutButton>;
}
