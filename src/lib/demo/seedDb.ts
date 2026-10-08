import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/session";
import { parseConversation } from "@/lib/parsing";
import { runAnalysisPipeline } from "@/lib/ai/pipeline";
import { getDemoConversationText } from "./seedData";

export async function seedDemoWorkspace(targetUserId?: string): Promise<{
  user: { id: string; email: string };
  workspace: { id: string; name: string; slug: string };
  conversationId: string;
}> {
  // 1. Get or create demo user
  let user;
  if (targetUserId) {
    user = await prisma.user.findUnique({ where: { id: targetUserId } });
  }

  if (!user) {
    const demoEmail = "demo@echo.ai";
    user = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!user) {
      const passwordHash = await hashPassword("demouser123");
      user = await prisma.user.create({
        data: {
          name: "Tanmay (Lead)",
          email: demoEmail,
          passwordHash,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        },
      });
    }
  }

  // 2. Get or create workspace
  let workspace = await prisma.workspace.findFirst({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
  });

  if (!workspace) {
    const slug = `echo-demo-${user.id.slice(-6).toLowerCase()}`;
    workspace = await prisma.workspace.create({
      data: {
        name: "Echo Product Team",
        slug,
        description: "Official team workspace for Echo action intelligence development.",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
  }

  // 3. Create or find Project
  let project = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: "Echo MVP Core" },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: "Echo MVP Core",
        description: "Core action intelligence engine, parser, and source-highlighting viewer.",
        color: "#6366f1",
        status: "ACTIVE",
      },
    });
  }

  // 4. Ingest demo conversation
  let conversation = await prisma.conversation.findFirst({
    where: { workspaceId: workspace.id, title: "Sprint 1 — Architecture & Core Ingestion" },
  });

  if (!conversation) {
    const rawText = getDemoConversationText();
    const parsed = parseConversation(rawText);

    conversation = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        projectId: project.id,
        title: "Sprint 1 — Architecture & Core Ingestion",
        rawText,
        sourceFormat: parsed.format,
        messageCount: parsed.messages.length,
        participantCount: parsed.participants.length,
        status: "PROCESSING",
      },
    });

    // Create individual message records
    for (const msg of parsed.messages) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          orderIndex: msg.orderIndex,
          speaker: msg.speaker,
          timestamp: msg.timestamp,
          content: msg.content,
        },
      });
    }

    // 5. Run real analysis pipeline to extract tasks, decisions, commitments, contradictions
    await runAnalysisPipeline({
      conversationId: conversation.id,
      workspaceId: workspace.id,
      projectId: project.id,
    });
  }

  return {
    user: { id: user.id, email: user.email },
    workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
    conversationId: conversation.id,
  };
}
