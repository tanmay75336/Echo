import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateProjectHealth } from "@/lib/health/calculator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
    include: {
      conversations: {
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        include: { assignees: true, sourceMessage: true },
        orderBy: { createdAt: "desc" },
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
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const health = calculateProjectHealth({
    tasks: project.tasks,
    unresolvedCount: project.unresolvedItems.filter((u) => u.status === "UNRESOLVED").length,
    conflictsCount: project.conflicts.filter((c) => c.status === "ACTIVE").length,
  });

  return NextResponse.json({ project, health });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.project.deleteMany({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  return NextResponse.json({ success: true });
}
