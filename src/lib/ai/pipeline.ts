import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "./provider";
import { AnalysisResult, AnalysisResultSchema } from "./types";
import { NormalizedMessage } from "@/lib/parsing";

export interface AnalysisPipelineOptions {
  conversationId: string;
  workspaceId: string;
  projectId?: string | null;
}

export async function runAnalysisPipeline(options: AnalysisPipelineOptions): Promise<{
  analysis: AnalysisResult;
  stats: {
    tasksCount: number;
    decisionsCount: number;
    commitmentsCount: number;
    unresolvedCount: number;
    conflictsCount: number;
    entitiesCount: number;
  };
}> {
  const { conversationId, workspaceId, projectId } = options;

  // 1. Fetch conversation and its ordered messages
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!conversation || conversation.messages.length === 0) {
    throw new Error("Conversation has no messages to analyze.");
  }

  // Update status to PROCESSING
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "PROCESSING" },
  });

  try {
    // 2. Prepare normalized messages for AI
    const normalizedMessages: NormalizedMessage[] = conversation.messages.map((m) => ({
      id: m.id,
      orderIndex: m.orderIndex,
      speaker: m.speaker,
      timestamp: m.timestamp,
      content: m.content,
    }));

    const maxIndex = conversation.messages.length;
    // Map orderIndex -> message.id
    const orderIndexToIdMap = new Map<number, string>();
    for (const msg of conversation.messages) {
      orderIndexToIdMap.set(msg.orderIndex, msg.id);
    }

    // 3. Run AI extraction
    const provider = getAIProvider();
    const rawResult = await provider.analyzeConversation(normalizedMessages);

    // 4. Validate output schema with Zod
    const validatedResult = AnalysisResultSchema.parse(rawResult);

    // 5. Post-process & Source Validation (CRITICAL RELIABILITY RULE)
    // Filter out or sanitize any item with an invalid source message index
    const validTasks = validatedResult.tasks.filter((t) => {
      return t.sourceMessageIndex >= 1 && t.sourceMessageIndex <= maxIndex;
    });

    const validDecisions = validatedResult.decisions.filter((d) => {
      return d.sourceMessageIndex >= 1 && d.sourceMessageIndex <= maxIndex;
    });

    const validCommitments = validatedResult.commitments.filter((c) => {
      return c.sourceMessageIndex >= 1 && c.sourceMessageIndex <= maxIndex;
    });

    const validUnresolved = validatedResult.unresolvedItems.filter((u) => {
      return u.sourceMessageIndex >= 1 && u.sourceMessageIndex <= maxIndex;
    });

    // 6. Database Transaction: Persist everything linked to real records
    await prisma.$transaction(async (tx) => {
      // Clean up previous AI extraction for this conversation to prevent duplicates
      await tx.task.deleteMany({ where: { conversationId } });
      await tx.decision.deleteMany({ where: { conversationId } });
      await tx.commitment.deleteMany({ where: { conversationId } });
      await tx.unresolvedItem.deleteMany({ where: { conversationId } });
      await tx.conflict.deleteMany({ where: { conversationId } });
      await tx.entity.deleteMany({ where: { conversationId } });

      // Create Tasks
      for (const t of validTasks) {
        const sourceMessageDbId = orderIndexToIdMap.get(t.sourceMessageIndex) || null;
        const task = await tx.task.create({
          data: {
            workspaceId,
            projectId: projectId || conversation.projectId,
            conversationId,
            sourceMessageId: sourceMessageDbId,
            title: t.title,
            description: t.description || null,
            status: "TODO",
            priority: t.priority,
            deadline: t.deadline || null,
            confidence: t.confidence,
            sourceQuote: t.sourceQuote,
          },
        });

        if (t.assignee) {
          await tx.taskAssignee.create({
            data: {
              taskId: task.id,
              name: t.assignee,
            },
          });
        }
      }

      // Create Decisions
      for (const d of validDecisions) {
        const sourceMessageDbId = orderIndexToIdMap.get(d.sourceMessageIndex) || null;
        await tx.decision.create({
          data: {
            workspaceId,
            projectId: projectId || conversation.projectId,
            conversationId,
            sourceMessageId: sourceMessageDbId,
            title: d.title,
            description: d.description || null,
            decision: d.decision,
            participants: d.participants.join(", "),
            reason: d.reason || null,
            status: d.status,
            confidence: d.confidence,
            date: d.date || null,
            sourceQuote: d.sourceQuote,
          },
        });
      }

      // Create Commitments
      for (const c of validCommitments) {
        const sourceMessageDbId = orderIndexToIdMap.get(c.sourceMessageIndex) || null;
        await tx.commitment.create({
          data: {
            workspaceId,
            projectId: projectId || conversation.projectId,
            conversationId,
            sourceMessageId: sourceMessageDbId,
            person: c.person,
            commitment: c.commitment,
            deadline: c.deadline || null,
            confidence: c.confidence,
            status: c.status,
            sourceQuote: c.sourceQuote,
          },
        });
      }

      // Create Unresolved Items
      for (const u of validUnresolved) {
        const sourceMessageDbId = orderIndexToIdMap.get(u.sourceMessageIndex) || null;
        await tx.unresolvedItem.create({
          data: {
            workspaceId,
            projectId: projectId || conversation.projectId,
            conversationId,
            sourceMessageId: sourceMessageDbId,
            question: u.question,
            context: u.context || null,
            participants: u.participants.join(", "),
            status: u.status,
            resolutionNotes: u.resolutionNotes || null,
            confidence: u.confidence,
            sourceQuote: u.sourceQuote,
          },
        });
      }

      // Create Conflicts
      for (const conf of validatedResult.conflicts) {
        await tx.conflict.create({
          data: {
            workspaceId,
            projectId: projectId || conversation.projectId,
            conversationId,
            description: conf.description,
            involvedPeople: conf.involvedPeople.join(", "),
            severity: conf.severity,
            evidence: conf.evidence,
            confidence: conf.confidence,
            status: conf.status,
          },
        });
      }

      // Create Entities
      for (const ent of validatedResult.entities) {
        await tx.entity.create({
          data: {
            workspaceId,
            conversationId,
            name: ent.name,
            type: ent.type,
            mentionCount: ent.mentionCount,
            metadata: ent.metadata || null,
          },
        });
      }

      // Save Analysis record with versioning
      const existingAnalysis = await tx.analysis.findFirst({
        where: { conversationId },
        orderBy: { version: "desc" },
      });

      const nextVersion = existingAnalysis ? existingAnalysis.version + 1 : 1;
      const rawJsonString = JSON.stringify(validatedResult);

      const createdAnalysis = await tx.analysis.create({
        data: {
          conversationId,
          version: nextVersion,
          summary: validatedResult.summary,
          projectStatus: validatedResult.projectStatus,
          keyTopics: JSON.stringify(validatedResult.keyTopics),
          rawJson: rawJsonString,
        },
      });

      await tx.analysisVersion.create({
        data: {
          analysisId: createdAnalysis.id,
          versionNumber: nextVersion,
          rawJson: rawJsonString,
        },
      });

      // Update Conversation status to ANALYZED
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          status: "ANALYZED",
          participantCount: validatedResult.participants.length,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          workspaceId,
          action: "CONVERSATION_ANALYZED",
          entityType: "CONVERSATION",
          entityId: conversationId,
          details: `Extracted ${validTasks.length} tasks, ${validDecisions.length} decisions, ${validCommitments.length} commitments.`,
        },
      });
    });

    return {
      analysis: validatedResult,
      stats: {
        tasksCount: validTasks.length,
        decisionsCount: validDecisions.length,
        commitmentsCount: validCommitments.length,
        unresolvedCount: validUnresolved.length,
        conflictsCount: validatedResult.conflicts.length,
        entitiesCount: validatedResult.entities.length,
      },
    };
  } catch (error) {
    // If analysis fails, mark conversation as FAILED so user can retry
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
