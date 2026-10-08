import { NormalizedMessage } from "@/lib/parsing";
import { AnalysisResult } from "./types";
import { WorkspaceContextData } from "./prompts/answerWorkspaceQuestion";
import { MockProvider } from "./providers/mock";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";

export interface AIProvider {
  name: string;
  analyzeConversation(messages: NormalizedMessage[]): Promise<AnalysisResult>;
  answerQuestion(
    question: string,
    context: WorkspaceContextData
  ): Promise<{ answer: string; citations: string[] }>;
}

export function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if ((providerType === "gemini" || !providerType) && geminiKey) {
    return new GeminiProvider(geminiKey);
  }

  if (providerType === "openai" && openaiKey) {
    return new OpenAIProvider(openaiKey);
  }

  // Fallback to MockProvider (clean deterministic heuristics, guaranteed zero external dependencies)
  return new MockProvider();
}
