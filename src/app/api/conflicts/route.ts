import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const conflicts = await prisma.conflict.findMany({
    where: {
      workspaceId: user.currentWorkspace.id,
      ...(status ? { status } : {}),
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      conversation: { select: { id: true, title: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ conflicts });
}
