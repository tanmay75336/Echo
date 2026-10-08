import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { IngestConversationClient } from "./IngestConversationClient";

export default async function NewConversationPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: user.currentWorkspace.id },
    select: { id: true, name: true },
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
      <IngestConversationClient projects={projects} />
    </AppShell>
  );
}
