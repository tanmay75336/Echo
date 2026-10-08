import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: { workspaceId: user.currentWorkspace.id },
      include: {
        assignees: true,
        project: { select: { id: true, name: true, color: true } },
        conversation: { select: { id: true, title: true } },
        sourceMessage: { select: { id: true, orderIndex: true, speaker: true, content: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.project.findMany({
      where: { workspaceId: user.currentWorkspace.id },
      select: { id: true, name: true },
    }),
  ]);

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
      <TasksClient initialTasks={tasks} projects={projects} />
    </AppShell>
  );
}
