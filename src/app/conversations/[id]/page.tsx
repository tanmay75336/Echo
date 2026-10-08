import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ConversationViewerClient } from "./ConversationViewerClient";

export default async function ConversationViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const { id } = await params;
  const { msg: targetMsgId } = await searchParams;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
    include: {
      project: true,
      messages: {
        orderBy: { orderIndex: "asc" },
      },
      analyses: {
        orderBy: { version: "desc" },
        take: 1,
      },
      tasks: {
        include: { assignees: true, sourceMessage: true },
        orderBy: { createdAt: "asc" },
      },
      decisions: {
        include: { sourceMessage: true },
        orderBy: { createdAt: "asc" },
      },
      commitments: {
        include: { sourceMessage: true },
        orderBy: { createdAt: "asc" },
      },
      unresolvedItems: {
        include: { sourceMessage: true },
        orderBy: { createdAt: "asc" },
      },
      conflicts: {
        orderBy: { createdAt: "asc" },
      },
      entities: {
        orderBy: { mentionCount: "desc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        currentWorkspace: {
          name: user.currentWorkspace.name,
          slug: user.currentWorkspace.slug,
        },
      }}
    >
      <ConversationViewerClient
        conversation={conversation}
        initialTargetMessageId={targetMsgId}
      />
    </AppShell>
  );
}
