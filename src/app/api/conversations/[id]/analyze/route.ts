import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { runAnalysisPipeline } from "@/lib/ai/pipeline";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      workspaceId: user.currentWorkspace.id,
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    const result = await runAnalysisPipeline({
      conversationId: conversation.id,
      workspaceId: user.currentWorkspace.id,
      projectId: conversation.projectId,
    });

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      stats: result.stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
