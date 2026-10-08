import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateProjectHealth } from "@/lib/health/calculator";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectDetailClient } from "./ProjectDetailClient";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
    include: {
      conversations: {
        include: {
          _count: { select: { messages: true, tasks: true, decisions: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        include: { assignees: true, sourceMessage: true },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      },
      decisions: {
        include: { sourceMessage: true },
        orderBy: { createdAt: "desc" },
      },
      commitments: {
        include: { sourceMessage: true },
        orderBy: { createdAt: "desc" },
      },
      unresolvedItems: {
        include: { sourceMessage: true },
        orderBy: { createdAt: "desc" },
      },
      conflicts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const health = calculateProjectHealth({
    tasks: project.tasks,
    unresolvedCount: project.unresolvedItems.filter((u) => u.status === "UNRESOLVED").length,
    conflictsCount: project.conflicts.filter((c) => c.status === "ACTIVE").length,
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
      <ProjectDetailClient project={project} health={health} />
    </AppShell>
  );
}
