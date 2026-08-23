"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Board = { id: string; name: string };
export default function SaveToBoard({ artworkId, signedIn }: { artworkId: string; signedIn: boolean }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (open && signedIn) fetch("/api/boards").then(r => r.json()).then(setBoards); }, [open, signedIn]);
  async function save(boardId: string) {
    const response = await fetch(`/api/boards/${boardId}/artworks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ artworkId }) });
    setMessage(response.ok ? "Saved to board" : "Unable to save artwork");
  }
  async function create(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/boards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const board = await response.json() as Board;
    if (response.ok) { setBoards([board, ...boards]); setName(""); await save(board.id); }
  }
  if (!signedIn) return <Link href="/sign-in" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700">Sign in to save</Link>;
  return <div className="relative">
    <button onClick={() => setOpen(!open)} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white">Save to board</button>
    {open && <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl bg-white p-3 shadow-lg ring-1 ring-stone-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Your boards</p>
      <div className="mt-2 max-h-36 space-y-1 overflow-auto">{boards.length ? boards.map(board => <button key={board.id} onClick={() => save(board.id)} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-stone-100">{board.name}</button>) : <p className="px-2 py-2 text-sm text-stone-500">No boards yet.</p>}</div>
      <form onSubmit={create} className="mt-3 flex gap-2 border-t border-stone-100 pt-3"><input value={name} onChange={e => setName(e.target.value)} maxLength={48} required placeholder="New board" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm" /><button className="rounded-lg bg-stone-900 px-2 text-sm text-white">Add</button></form>
      {message && <p className="mt-2 text-xs text-stone-600">{message}</p>}
    </div>}
  </div>;
}
