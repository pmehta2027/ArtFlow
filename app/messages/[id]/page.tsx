import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageComposer from "@/components/MessageComposer";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const { id } = await params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, OR: [{ participantOneId: user.id }, { participantTwoId: user.id }] },
    include: {
      participantOne: { select: { id: true, handle: true, displayName: true } },
      participantTwo: { select: { id: true, handle: true, displayName: true } },
      messages: { include: { author: { select: { displayName: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) notFound();
  const otherUser = conversation.participantOneId === user.id ? conversation.participantTwo : conversation.participantOne;
  return <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6"><Link href="/messages" className="text-sm font-medium text-stone-600 hover:text-stone-900">← Messages</Link><section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"><Link href={`/profiles/${otherUser.handle}`} className="text-xl font-semibold tracking-tight hover:underline">{otherUser.displayName}</Link><p className="mt-1 text-sm text-stone-500">@{otherUser.handle}</p><MessageComposer conversationId={conversation.id} initialMessages={conversation.messages} currentUserId={user.id} /></section></main>;
}
