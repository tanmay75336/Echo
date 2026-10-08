import { describe, it, expect } from "vitest";
import {
  ExtractedTaskSchema,
  ExtractedDecisionSchema,
  ExtractedCommitmentSchema,
  ExtractedConflictSchema,
  ExtractedUnresolvedItemSchema,
  AnalysisResultSchema,
} from "../src/lib/ai/types";

describe("AI Extraction Schemas & Strict Validation", () => {
  it("validates a compliant task with source traceability", () => {
    const validTask = {
      title: "Prepare screenshots",
      description: "App demo screenshots for presentation",
      assignee: "Tanmay",
      deadline: "Thursday",
      priority: "HIGH" as const,
      confidence: 0.95,
      sourceMessageIndex: 42,
      sourceQuote: "Tanmay, can you prepare the screenshots by Thursday?",
    };

    const parsed = ExtractedTaskSchema.parse(validTask);
    expect(parsed.title).toBe("Prepare screenshots");
    expect(parsed.sourceMessageIndex).toBe(42);
  });

  it("rejects task without title or with invalid index", () => {
    const invalidTask = {
      title: "",
      sourceMessageIndex: -5,
      sourceQuote: "Quote",
    };

    expect(() => ExtractedTaskSchema.parse(invalidTask)).toThrow();
  });

  it("validates a full AnalysisResult object", () => {
    const fullAnalysis = {
      summary: "Sprint sync discussing database and deliverables.",
      projectStatus: "On track with 2 active deliverables.",
      keyTopics: ["Database", "Architecture"],
      tasks: [
        {
          title: "Configure Prisma",
          assignee: "Rahul",
          deadline: "Wednesday",
          priority: "HIGH" as const,
          confidence: 0.9,
          sourceMessageIndex: 12,
          sourceQuote: "Rahul, configure Prisma by Wednesday",
        },
      ],
      decisions: [
        {
          title: "Use PostgreSQL",
          decision: "Adopt PostgreSQL for relational constraints",
          participants: ["Rahul", "Tanmay"],
          reason: "Strict foreign key relations needed",
          status: "CONFIRMED" as const,
          confidence: 0.98,
          sourceMessageIndex: 11,
          sourceQuote: "Agreed. Let's use PostgreSQL",
        },
      ],
      commitments: [
        {
          person: "Rahul",
          commitment: "Finish backend auth by Wednesday",
          deadline: "Wednesday",
          confidence: 0.95,
          status: "PENDING" as const,
          sourceMessageIndex: 13,
          sourceQuote: "I will finish backend auth by Wednesday",
        },
      ],
      unresolvedItems: [],
      conflicts: [
        {
          description: "Rahul committed to Wednesday, but later indicated unavailability.",
          involvedPeople: ["Rahul"],
          severity: "HIGH" as const,
          evidence: "Msg 13 vs Msg 38",
          confidence: 0.92,
          status: "ACTIVE" as const,
        },
      ],
      entities: [
        {
          name: "PostgreSQL",
          type: "TOOL" as const,
          mentionCount: 3,
        },
      ],
      participants: ["Rahul", "Tanmay"],
    };

    const result = AnalysisResultSchema.parse(fullAnalysis);
    expect(result.tasks.length).toBe(1);
    expect(result.decisions.length).toBe(1);
    expect(result.conflicts.length).toBe(1);
  });
});
