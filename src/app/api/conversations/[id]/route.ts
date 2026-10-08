import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
    include: {
      project: true,
      messages: {
        orderBy: { orderIndex: "asc" },
      },
      analyses: {
        orderBy: { version: "desc" },
        take: 1,
      },
      tasks: {
        include: { assignees: true },
        orderBy: { createdAt: "asc" },
      },
      decisions: {
        orderBy: { createdAt: "asc" },
      },
      commitments: {
        orderBy: { createdAt: "asc" },
      },
      unresolvedItems: {
        orderBy: { createdAt: "asc" },
      },
      conflicts: {
        orderBy: { createdAt: "asc" },
      },
      entities: {
        orderBy: { mentionCount: "desc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
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

  await prisma.conversation.deleteMany({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  return NextResponse.json({ success: true });
}
