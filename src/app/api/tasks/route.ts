import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  deadline: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  assigneeName: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const projectId = searchParams.get("projectId");
  const conversationId = searchParams.get("conversationId");

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId: user.currentWorkspace.id,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(projectId ? { projectId } : {}),
      ...(conversationId ? { conversationId } : {}),
    },
    include: {
      assignees: true,
      project: { select: { id: true, name: true, color: true } },
      conversation: { select: { id: true, title: true } },
      sourceMessage: {
        select: { id: true, speaker: true, timestamp: true, content: true, orderIndex: true },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = CreateTaskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        workspaceId: user.currentWorkspace.id,
        projectId: data.projectId || null,
        conversationId: data.conversationId || null,
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || null,
        createdById: user.id,
        ...(data.assigneeName
          ? {
              assignees: {
                create: {
                  name: data.assigneeName,
                },
              },
            }
          : {}),
      },
      include: {
        assignees: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: user.currentWorkspace.id,
        userId: user.id,
        action: "TASK_CREATED",
        entityType: "TASK",
        entityId: task.id,
        details: `Created task "${task.title}"`,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
