import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const conversations = await prisma.conversation.findMany({ where: { OR: [{ participantOneId: user.id }, { participantTwoId: user.id }] }, include: { participantOne: { select: { id: true, handle: true, displayName: true } }, participantTwo: { select: { id: true, handle: true, displayName: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6"><h1 className="text-3xl font-semibold tracking-tight">Messages</h1><p className="mt-2 text-sm text-stone-600">Private conversations with creators.</p><div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">{conversations.length ? conversations.map(conversation => { const otherUser = conversation.participantOneId === user.id ? conversation.participantTwo : conversation.participantOne; const preview = conversation.messages[0]; return <Link key={conversation.id} href={`/messages/${conversation.id}`} className="block border-b border-stone-100 px-5 py-4 last:border-0 hover:bg-stone-50"><p className="font-medium text-stone-900">{otherUser.displayName}</p><p className="mt-1 truncate text-sm text-stone-500">{preview?.body ?? "No messages yet"}</p></Link>; }) : <div className="px-6 py-14 text-center text-sm text-stone-600">Visit a creator profile to start a conversation.</div>}</div></main>;
}
