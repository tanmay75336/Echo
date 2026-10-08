import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateProjectHealth } from "@/lib/health/calculator";
import { z } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().default("#6366f1"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: user.currentWorkspace.id },
    include: {
      tasks: {
        include: { assignees: true },
      },
      conversations: {
        select: { id: true, title: true, status: true },
      },
      decisions: { select: { id: true } },
      commitments: { select: { id: true } },
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
      createdAt: p.createdAt,
      stats: {
        tasksCount: p.tasks.length,
        completedTasksCount: p.tasks.filter((t) => t.status === "DONE").length,
        conversationsCount: p.conversations.length,
        decisionsCount: p.decisions.length,
        commitmentsCount: p.commitments.length,
        unresolvedCount: p.unresolvedItems.filter((u) => u.status === "UNRESOLVED").length,
        conflictsCount: p.conflicts.filter((c) => c.status === "ACTIVE").length,
      },
      health,
    };
  });

  return NextResponse.json({ projects: projectsWithHealth });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = CreateProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        workspaceId: user.currentWorkspace.id,
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: user.currentWorkspace.id,
        userId: user.id,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: project.id,
        details: `Created project "${project.name}"`,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
