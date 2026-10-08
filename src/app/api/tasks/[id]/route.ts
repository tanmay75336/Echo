import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline: z.string().optional().nullable(),
  assigneeName: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = UpdateTaskSchema.parse(body);

    const task = await prisma.task.update({
      where: {
        id,
        workspaceId: user.currentWorkspace.id,
      },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.deadline !== undefined ? { deadline: data.deadline } : {}),
      },
      include: {
        assignees: true,
      },
    });

    if (data.assigneeName !== undefined) {
      await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      if (data.assigneeName) {
        await prisma.taskAssignee.create({
          data: {
            taskId: id,
            name: data.assigneeName,
          },
        });
      }
    }

    return NextResponse.json({ success: true, task });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
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

  await prisma.task.deleteMany({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  return NextResponse.json({ success: true });
}
