import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { CommitmentsClient } from "./CommitmentsClient";

export default async function CommitmentsPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const commitments = await prisma.commitment.findMany({
    where: { workspaceId: user.currentWorkspace.id },
    include: {
      project: { select: { id: true, name: true, color: true } },
      conversation: { select: { id: true, title: true } },
      sourceMessage: { select: { id: true, orderIndex: true, speaker: true, content: true } },
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
      <CommitmentsClient initialCommitments={commitments} />
    </AppShell>
  );
}
