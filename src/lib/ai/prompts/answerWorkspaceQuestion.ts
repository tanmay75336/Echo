export interface WorkspaceContextData {
  workspaceName: string;
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    assignee?: string | null;
    deadline?: string | null;
    sourceQuote?: string | null;
    conversationTitle?: string | null;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    decision: string;
    status: string;
    participants?: string | null;
    date?: string | null;
    sourceQuote?: string | null;
  }>;
  commitments: Array<{
    id: string;
    person: string;
    commitment: string;
    deadline?: string | null;
    status: string;
    sourceQuote?: string | null;
  }>;
  unresolvedItems: Array<{
    id: string;
    question: string;
    status: string;
    context?: string | null;
  }>;
  conflicts: Array<{
    id: string;
    description: string;
    severity: string;
    evidence: string;
  }>;
  conversations: Array<{
    id: string;
    title: string;
    summary?: string | null;
    participantCount: number;
  }>;
}

export function buildAnswerWorkspaceQuestionPrompt(
  question: string,
  context: WorkspaceContextData
): string {
  return `You are Echo's workspace intelligence assistant ("Ask Echo").
Your mission is to answer questions strictly and exclusively using the user's workspace data provided below.

CRITICAL RULES:
1. GROUNDED IN WORKSPACE ONLY:
   - Answer ONLY using the facts from the provided workspace data.
   - If the answer is not contained in the workspace data, clearly state: "I could not find information about that in your workspace conversations or data."
   - NEVER hallucinate or invent decisions, deadlines, owners, or meetings that are not present.
2. CITATIONS & CITATION LINKS:
   - Always reference the specific entity (e.g., [Task: Prepare Screenshots], [Decision: PostgreSQL for Production], [Commitment: Rahul - Wednesday Backend], or [Conversation: Sprint Planning]).
   - If quoting, use the source quote from the data.
3. CONCISE & ACTIONABLE:
   - Keep answers professional, direct, structured with bullet points where appropriate.

WORKSPACE DATA:
Workspace: ${context.workspaceName}

=== TASKS (${context.tasks.length}) ===
${JSON.stringify(context.tasks, null, 2)}

=== DECISIONS (${context.decisions.length}) ===
${JSON.stringify(context.decisions, null, 2)}

=== COMMITMENTS (${context.commitments.length}) ===
${JSON.stringify(context.commitments, null, 2)}

=== UNRESOLVED ITEMS (${context.unresolvedItems.length}) ===
${JSON.stringify(context.unresolvedItems, null, 2)}

=== CONFLICTS (${context.conflicts.length}) ===
${JSON.stringify(context.conflicts, null, 2)}

=== CONVERSATIONS (${context.conversations.length}) ===
${JSON.stringify(context.conversations, null, 2)}

USER QUESTION:
"${question}"

Provide a direct, grounded answer with citations to the entities above.`;
}
