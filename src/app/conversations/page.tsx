import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ConversationsListClient } from "./ConversationsListClient";

export default async function ConversationsPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const conversations = await prisma.conversation.findMany({
    where: { workspaceId: user.currentWorkspace.id },
    include: {
      project: { select: { id: true, name: true, color: true } },
      _count: {
        select: {
          messages: true,
          tasks: true,
          decisions: true,
          commitments: true,
          unresolvedItems: true,
          conflicts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
      <ConversationsListClient initialConversations={conversations} />
    </AppShell>
  );
}
