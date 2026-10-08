import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const UpdateCommitmentSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BROKEN"]).optional(),
  commitment: z.string().optional(),
  deadline: z.string().optional().nullable(),
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
    const data = UpdateCommitmentSchema.parse(body);

    const commitment = await prisma.commitment.update({
      where: {
        id,
        workspaceId: user.currentWorkspace.id,
      },
      data,
    });

    return NextResponse.json({ success: true, commitment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update commitment";
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

  await prisma.commitment.deleteMany({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  return NextResponse.json({ success: true });
}
