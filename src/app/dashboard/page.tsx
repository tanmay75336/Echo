import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateProjectHealth } from "@/lib/health/calculator";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const workspaceId = user.currentWorkspace.id;

  // Parallel fetch workspace intelligence data
  const [tasks, decisions, unresolvedItems, conflicts, projects, conversations] =
    await Promise.all([
      prisma.task.findMany({
        where: { workspaceId },
        include: {
          assignees: true,
          project: { select: { id: true, name: true, color: true } },
          conversation: { select: { id: true, title: true } },
          sourceMessage: { select: { id: true, orderIndex: true, speaker: true, content: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.decision.findMany({
        where: { workspaceId },
        include: {
          project: { select: { id: true, name: true, color: true } },
          conversation: { select: { id: true, title: true } },
          sourceMessage: { select: { id: true, orderIndex: true, speaker: true, content: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.unresolvedItem.findMany({
        where: { workspaceId, status: "UNRESOLVED" },
        include: {
          project: { select: { id: true, name: true, color: true } },
          conversation: { select: { id: true, title: true } },
          sourceMessage: { select: { id: true, orderIndex: true, speaker: true, content: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.conflict.findMany({
        where: { workspaceId, status: "ACTIVE" },
        include: {
          conversation: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: { workspaceId },
        include: {
          tasks: { include: { assignees: true } },
          unresolvedItems: { select: { id: true, status: true } },
          conflicts: { select: { id: true, status: true } },
        },
      }),
      prisma.conversation.findMany({
        where: { workspaceId },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const projectsWithHealth = projects.map((p) => {
    const health = calculateProjectHealth({
      tasks: p.tasks,
      unresolvedCount: p.unresolvedItems.filter((u) => u.status === "UNRESOLVED").length,
      conflictsCount: p.conflicts.filter((c) => c.status === "ACTIVE").length,
    });
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      health,
      taskCount: p.tasks.length,
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
      <DashboardClient
        userName={user.name}
        workspaceName={user.currentWorkspace.name}
        initialTasks={tasks}
        initialDecisions={decisions}
        initialUnresolved={unresolvedItems}
        initialConflicts={conflicts}
        projectsWithHealth={projectsWithHealth}
        hasConversations={conversations.length > 0}
      />
    </AppShell>
  );
}
