import { z } from "zod";

export const ExtractedTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  confidence: z.number().min(0).max(1).default(1.0),
  sourceMessageIndex: z.number().int().positive(),
  sourceQuote: z.string(),
});

export const ExtractedDecisionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  decision: z.string().min(1),
  participants: z.array(z.string()).default([]),
  reason: z.string().optional().nullable(),
  status: z.enum(["CONFIRMED", "PROPOSED", "OUTDATED"]).default("CONFIRMED"),
  confidence: z.number().min(0).max(1).default(1.0),
  date: z.string().optional().nullable(),
  sourceMessageIndex: z.number().int().positive(),
  sourceQuote: z.string(),
});

export const ExtractedCommitmentSchema = z.object({
  person: z.string().min(1),
  commitment: z.string().min(1),
  deadline: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1).default(1.0),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BROKEN"]).default("PENDING"),
  sourceMessageIndex: z.number().int().positive(),
  sourceQuote: z.string(),
});

export const ExtractedUnresolvedItemSchema = z.object({
  question: z.string().min(1),
  context: z.string().optional().nullable(),
  participants: z.array(z.string()).default([]),
  status: z.enum(["UNRESOLVED", "RESOLVED"]).default("UNRESOLVED"),
  resolutionNotes: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1).default(1.0),
  sourceMessageIndex: z.number().int().positive(),
  sourceQuote: z.string(),
});

export const ExtractedConflictSchema = z.object({
  description: z.string().min(1),
  involvedPeople: z.array(z.string()).default([]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  evidence: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.85),
  status: z.enum(["ACTIVE", "RESOLVED"]).default("ACTIVE"),
});

export const ExtractedEntitySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["TOOL", "SYSTEM", "PERSON", "ORG", "CONCEPT", "METRIC"]).default("CONCEPT"),
  mentionCount: z.number().int().default(1),
  metadata: z.string().optional().nullable(),
});

export const AnalysisResultSchema = z.object({
  summary: z.string().min(1),
  projectStatus: z.string().min(1),
  keyTopics: z.array(z.string()).default([]),
  tasks: z.array(ExtractedTaskSchema).default([]),
  decisions: z.array(ExtractedDecisionSchema).default([]),
  commitments: z.array(ExtractedCommitmentSchema).default([]),
  unresolvedItems: z.array(ExtractedUnresolvedItemSchema).default([]),
  conflicts: z.array(ExtractedConflictSchema).default([]),
  entities: z.array(ExtractedEntitySchema).default([]),
  participants: z.array(z.string()).default([]),
});

export type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;
export type ExtractedDecision = z.infer<typeof ExtractedDecisionSchema>;
export type ExtractedCommitment = z.infer<typeof ExtractedCommitmentSchema>;
export type ExtractedUnresolvedItem = z.infer<typeof ExtractedUnresolvedItemSchema>;
export type ExtractedConflict = z.infer<typeof ExtractedConflictSchema>;
export type ExtractedEntity = z.infer<typeof ExtractedEntitySchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
