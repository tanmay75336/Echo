import OpenAI from "openai";
import { NormalizedMessage } from "@/lib/parsing";
import { AnalysisResult, AnalysisResultSchema } from "../types";
import { buildAnalyzeConversationPrompt } from "../prompts/analyzeConversation";
import { buildAnswerWorkspaceQuestionPrompt, WorkspaceContextData } from "../prompts/answerWorkspaceQuestion";

export class OpenAIProvider {
  readonly name = "OpenAI Provider";
  private client: OpenAI;
  private modelName: string;

  constructor(apiKey: string, modelName = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.modelName = modelName;
  }

  async analyzeConversation(messages: NormalizedMessage[]): Promise<AnalysisResult> {
    const prompt = buildAnalyzeConversationPrompt(messages);
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an AI conversation intelligence assistant. Output valid JSON matching the user schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const rawJson = JSON.parse(text);
    return AnalysisResultSchema.parse(rawJson);
  }

  async answerQuestion(
    question: string,
    context: WorkspaceContextData
  ): Promise<{ answer: string; citations: string[] }> {
    const prompt = buildAnswerWorkspaceQuestionPrompt(question, context);
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: "You are Echo workspace assistant. Answer strictly from the provided workspace data.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const answer = response.choices[0]?.message?.content || "No answer available.";
    const citations: string[] = [];
    const citationRegex = /\[(Task|Decision|Commitment|Unresolved|Conflict|Conversation): ([^\]]+)\]/g;
    let match;
    while ((match = citationRegex.exec(answer)) !== null) {
      citations.push(`${match[1]}: ${match[2]}`);
    }

    return { answer, citations };
  }
}
