import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { parseConversation } from "@/lib/parsing";
import { runAnalysisPipeline } from "@/lib/ai/pipeline";
import { z } from "zod";

const IngestConversationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rawText: z.string().min(5, "Conversation text must be at least 5 characters"),
  projectId: z.string().optional().nullable(),
  runAnalysisImmediately: z.boolean().default(true),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const conversations = await prisma.conversation.findMany({
    where: {
      workspaceId: user.currentWorkspace.id,
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      _count: {
        select: {
          messages: true,
          tasks: true,
          decisions: true,
          commitments: true,
          unresolvedItems: true,
          conflicts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = IngestConversationSchema.parse(body);

    // 1. Parse into normalized messages
    const parsed = parseConversation(data.rawText);

    if (parsed.messages.length === 0) {
      return NextResponse.json(
        { error: "Could not parse any messages from the provided text." },
        { status: 400 }
      );
    }

    // 2. Persist conversation and messages
    const conversation = await prisma.conversation.create({
      data: {
        workspaceId: user.currentWorkspace.id,
        projectId: data.projectId || null,
        title: data.title,
        rawText: data.rawText,
        sourceFormat: parsed.format,
        messageCount: parsed.messages.length,
        participantCount: parsed.participants.length,
        status: data.runAnalysisImmediately ? "PROCESSING" : "IDLE",
        messages: {
          create: parsed.messages.map((m) => ({
            orderIndex: m.orderIndex,
            speaker: m.speaker,
            timestamp: m.timestamp,
            content: m.content,
          })),
        },
      },
    });

    let analysisResult = null;
    let stats = null;

    // 3. Trigger AI Pipeline if requested
    if (data.runAnalysisImmediately) {
      const pipelineRes = await runAnalysisPipeline({
        conversationId: conversation.id,
        workspaceId: user.currentWorkspace.id,
        projectId: data.projectId || null,
      });
      analysisResult = pipelineRes.analysis;
      stats = pipelineRes.stats;
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageCount: parsed.messages.length,
      format: parsed.format,
      analysis: analysisResult,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to ingest conversation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
