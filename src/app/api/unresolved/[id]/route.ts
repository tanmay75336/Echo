import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const UpdateUnresolvedSchema = z.object({
  status: z.enum(["UNRESOLVED", "RESOLVED"]).optional(),
  resolutionNotes: z.string().optional().nullable(),
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
    const data = UpdateUnresolvedSchema.parse(body);

    const item = await prisma.unresolvedItem.update({
      where: {
        id,
        workspaceId: user.currentWorkspace.id,
      },
      data,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update item";
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

  await prisma.unresolvedItem.deleteMany({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  return NextResponse.json({ success: true });
}
