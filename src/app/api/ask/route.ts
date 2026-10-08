import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/provider";
import { WorkspaceContextData } from "@/lib/ai/prompts/answerWorkspaceQuestion";
import { z } from "zod";

const AskSchema = z.object({
  question: z.string().min(2, "Please ask a specific question"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { question } = AskSchema.parse(body);

    const workspaceId = user.currentWorkspace.id;

    // Load full workspace context
    const [tasks, decisions, commitments, unresolvedItems, conflicts, conversations] =
      await Promise.all([
        prisma.task.findMany({
          where: { workspaceId },
          include: {
            assignees: true,
            conversation: { select: { title: true } },
          },
          take: 50,
        }),
        prisma.decision.findMany({
          where: { workspaceId },
          take: 50,
        }),
        prisma.commitment.findMany({
          where: { workspaceId },
          take: 50,
        }),
        prisma.unresolvedItem.findMany({
          where: { workspaceId },
          take: 50,
        }),
        prisma.conflict.findMany({
          where: { workspaceId },
          take: 50,
        }),
        prisma.conversation.findMany({
          where: { workspaceId },
          select: { id: true, title: true, participantCount: true },
          take: 20,
        }),
      ]);

    const context: WorkspaceContextData = {
      workspaceName: user.currentWorkspace.name,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignee: t.assignees[0]?.name || null,
        deadline: t.deadline,
        sourceQuote: t.sourceQuote,
        conversationTitle: t.conversation?.title,
      })),
      decisions: decisions.map((d) => ({
        id: d.id,
        title: d.title,
        decision: d.decision,
        status: d.status,
        participants: d.participants,
        date: d.date,
        sourceQuote: d.sourceQuote,
      })),
      commitments: commitments.map((c) => ({
        id: c.id,
        person: c.person,
        commitment: c.commitment,
        deadline: c.deadline,
        status: c.status,
        sourceQuote: c.sourceQuote,
      })),
      unresolvedItems: unresolvedItems.map((u) => ({
        id: u.id,
        question: u.question,
        status: u.status,
        context: u.context,
      })),
      conflicts: conflicts.map((cf) => ({
        id: cf.id,
        description: cf.description,
        severity: cf.severity,
        evidence: cf.evidence,
      })),
      conversations: conversations.map((cv) => ({
        id: cv.id,
        title: cv.title,
        participantCount: cv.participantCount,
      })),
    };

    const provider = getAIProvider();
    const result = await provider.answerQuestion(question, context);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
      provider: provider.name,
      scannedEntities: {
        tasksCount: tasks.length,
        decisionsCount: decisions.length,
        commitmentsCount: commitments.length,
        unresolvedCount: unresolvedItems.length,
        conflictsCount: conflicts.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to answer question";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
