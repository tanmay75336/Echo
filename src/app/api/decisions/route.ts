import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const CreateDecisionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  decision: z.string().min(1, "Decision is required"),
  description: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
  status: z.enum(["CONFIRMED", "PROPOSED", "OUTDATED"]).default("CONFIRMED"),
  projectId: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");

  const decisions = await prisma.decision.findMany({
    where: {
      workspaceId: user.currentWorkspace.id,
      ...(status ? { status } : {}),
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

  return NextResponse.json({ decisions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = CreateDecisionSchema.parse(body);

    const decision = await prisma.decision.create({
      data: {
        workspaceId: user.currentWorkspace.id,
        projectId: data.projectId || null,
        conversationId: data.conversationId || null,
        title: data.title,
        decision: data.decision,
        description: data.description || null,
        reason: data.reason || null,
        participants: data.participants || null,
        status: data.status,
      },
    });

    return NextResponse.json({ success: true, decision });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create decision";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
