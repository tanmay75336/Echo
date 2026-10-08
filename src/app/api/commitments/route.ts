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
  const person = searchParams.get("person");
  const projectId = searchParams.get("projectId");

  const commitments = await prisma.commitment.findMany({
    where: {
      workspaceId: user.currentWorkspace.id,
      ...(status ? { status } : {}),
      ...(person ? { person: { contains: person } } : {}),
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      conversation: { select: { id: true, title: true } },
      sourceMessage: {
        select: { id: true, speaker: true, timestamp: true, content: true, orderIndex: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ commitments });
}
