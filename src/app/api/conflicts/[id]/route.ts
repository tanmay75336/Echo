import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const UpdateConflictSchema = z.object({
  status: z.enum(["ACTIVE", "RESOLVED"]),
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
    const data = UpdateConflictSchema.parse(body);

    const conflict = await prisma.conflict.update({
      where: {
        id,
        workspaceId: user.currentWorkspace.id,
      },
      data: {
        status: data.status,
      },
    });

    return NextResponse.json({ success: true, conflict });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update conflict";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
