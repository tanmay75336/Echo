import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ConflictsClient } from "./ConflictsClient";

export default async function ConflictsPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const conflicts = await prisma.conflict.findMany({
    where: { workspaceId: user.currentWorkspace.id },
    include: {
      project: { select: { id: true, name: true, color: true } },
      conversation: { select: { id: true, title: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
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
      <ConflictsClient initialConflicts={conflicts} />
    </AppShell>
  );
}
