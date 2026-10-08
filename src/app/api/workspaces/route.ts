import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: {
        select: {
          conversations: true,
          tasks: true,
          decisions: true,
          projects: true,
        },
      },
    },
  });

  return NextResponse.json({ workspaces });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if owner
  if (user.workspaceRole !== "OWNER") {
    return NextResponse.json(
      { error: "Only the workspace owner can delete this workspace." },
      { status: 403 }
    );
  }

  await prisma.workspace.delete({
    where: { id: user.currentWorkspace.id },
  });

  return NextResponse.json({ success: true, message: "Workspace deleted" });
}
