import { GoogleGenerativeAI } from "@google/generative-ai";
import { NormalizedMessage } from "@/lib/parsing";
import { AnalysisResult, AnalysisResultSchema } from "../types";
import { buildAnalyzeConversationPrompt } from "../prompts/analyzeConversation";
import { buildAnswerWorkspaceQuestionPrompt, WorkspaceContextData } from "../prompts/answerWorkspaceQuestion";

export class GeminiProvider {
  readonly name = "Google Gemini Provider";
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = "gemini-1.5-flash") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async analyzeConversation(messages: NormalizedMessage[]): Promise<AnalysisResult> {
    const prompt = buildAnalyzeConversationPrompt(messages);
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const rawJson = JSON.parse(text);
    return AnalysisResultSchema.parse(rawJson);
  }

  async answerQuestion(
    question: string,
    context: WorkspaceContextData
  ): Promise<{ answer: string; citations: string[] }> {
    const prompt = buildAnswerWorkspaceQuestionPrompt(question, context);
    const model = this.client.getGenerativeModel({
      model: this.modelName,
    });

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    const citations: string[] = [];
    const citationRegex = /\[(Task|Decision|Commitment|Unresolved|Conflict|Conversation): ([^\]]+)\]/g;
    let match;
    while ((match = citationRegex.exec(answer)) !== null) {
      citations.push(`${match[1]}: ${match[2]}`);
    }

    return { answer, citations };
  }
}
