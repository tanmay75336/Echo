import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateProjectHealth } from "@/lib/health/calculator";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsClient } from "./ProjectsClient";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: user.currentWorkspace.id },
    include: {
      tasks: { include: { assignees: true } },
      conversations: { select: { id: true, title: true } },
      decisions: { select: { id: true } },
      unresolvedItems: { select: { id: true, status: true } },
      conflicts: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectsWithHealth = projects.map((p) => {
    const health = calculateProjectHealth({
      tasks: p.tasks,
      unresolvedCount: p.unresolvedItems.filter((u) => u.status === "UNRESOLVED").length,
      conflictsCount: p.conflicts.filter((c) => c.status === "ACTIVE").length,
    });
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      status: p.status,
      tasks: p.tasks,
      conversationCount: p.conversations.length,
      decisionCount: p.decisions.length,
      health,
    };
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
      <ProjectsClient initialProjects={projectsWithHealth} />
    </AppShell>
  );
}
