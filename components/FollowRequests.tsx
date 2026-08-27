"use client";

import { useState } from "react";
import Link from "next/link";

type Requester = { id: string; handle: string; displayName: string };

export default function FollowRequests({ initialRequests }: { initialRequests: Requester[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function respond(requesterId: string, action: "accept" | "decline") {
    setUpdatingId(requesterId);
    const response = await fetch(`/api/follow-requests/${requesterId}${action === "accept" ? "/accept" : ""}`, { method: action === "accept" ? "POST" : "DELETE" });
    if (response.ok) setRequests(current => current.filter(request => request.id !== requesterId));
    setUpdatingId(null);
  }

  if (!requests.length) return null;
  return <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-stone-900">Follow requests</h2><div className="mt-3 divide-y divide-stone-100">{requests.map(request => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><Link href={`/profiles/${request.handle}`} className="text-sm font-semibold text-stone-900 hover:underline">{request.displayName} <span className="font-normal text-stone-500">@{request.handle}</span></Link><div className="flex gap-2"><button onClick={() => respond(request.id, "accept")} disabled={updatingId === request.id} className="rounded-full bg-stone-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">Accept</button><button onClick={() => respond(request.id, "decline")} disabled={updatingId === request.id} className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-800 disabled:opacity-60">Decline</button></div></div>)}</div></section>;
}
