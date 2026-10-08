import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const UpdateDecisionSchema = z.object({
  title: z.string().optional(),
  decision: z.string().optional(),
  description: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
  status: z.enum(["CONFIRMED", "PROPOSED", "OUTDATED"]).optional(),
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
    const data = UpdateDecisionSchema.parse(body);

    const decision = await prisma.decision.update({
      where: {
        id,
        workspaceId: user.currentWorkspace.id,
      },
      data,
    });

    return NextResponse.json({ success: true, decision });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update decision";
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

  await prisma.decision.deleteMany({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  return NextResponse.json({ success: true });
}
