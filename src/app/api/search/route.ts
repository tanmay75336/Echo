import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({
      results: {
        tasks: [],
        decisions: [],
        commitments: [],
        conversations: [],
        messages: [],
        projects: [],
      },
    });
  }

  const workspaceId = user.currentWorkspace.id;

  const [tasks, decisions, commitments, conversations, messages, projects] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { assignees: { some: { name: { contains: q } } } },
          ],
        },
        include: { assignees: true },
        take: 8,
      }),
      prisma.decision.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: q } },
            { decision: { contains: q } },
            { reason: { contains: q } },
          ],
        },
        take: 8,
      }),
      prisma.commitment.findMany({
        where: {
          workspaceId,
          OR: [
            { commitment: { contains: q } },
            { person: { contains: q } },
          ],
        },
        take: 8,
      }),
      prisma.conversation.findMany({
        where: {
          workspaceId,
          title: { contains: q },
        },
        take: 5,
      }),
      prisma.conversationMessage.findMany({
        where: {
          conversation: { workspaceId },
          content: { contains: q },
        },
        include: {
          conversation: { select: { id: true, title: true } },
        },
        take: 8,
      }),
      prisma.project.findMany({
        where: {
          workspaceId,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
      }),
    ]);

  return NextResponse.json({
    query: q,
    results: {
      tasks,
      decisions,
      commitments,
      conversations,
      messages,
      projects,
    },
    totalFound:
      tasks.length +
      decisions.length +
      commitments.length +
      conversations.length +
      messages.length +
      projects.length,
  });
}
