import { describe, it, expect } from "vitest";
import { MockProvider } from "../src/lib/ai/providers/mock";
import { parseConversation } from "../src/lib/parsing";

describe("MockProvider Heuristic Engine & Contradiction Detection", () => {
  const provider = new MockProvider();

  it("extracts tasks, commitments, decisions, and contradictions from realistic conversation", async () => {
    const rawConversation = `
[09:40 AM] Tanmay: Rahul, please configure PostgreSQL by Wednesday.
[09:43 AM] Rahul: Agreed. Let's use PostgreSQL for our database because of relational foreign keys.
[09:45 AM] Rahul: I will finish backend auth and ingestion API by Wednesday.
[09:50 AM] Amit: I'll prepare PPT by Thursday.
[09:55 AM] Sneha: Should we deploy on AWS ECS or Vercel?
[02:15 PM] Rahul: Heads up, I have family visiting unexpectedly and won't be available until Friday.
`;

    const parsed = parseConversation(rawConversation);
    const analysis = await provider.analyzeConversation(parsed.messages);

    // Verify tasks
    expect(analysis.tasks.length).toBeGreaterThan(0);
    const pgTask = analysis.tasks.find((t) => /postgresql/i.test(t.title));
    expect(pgTask).toBeDefined();
    expect(pgTask?.sourceMessageIndex).toBeGreaterThan(0);

    // Verify decisions
    expect(analysis.decisions.length).toBeGreaterThan(0);
    const dbDecision = analysis.decisions.find((d) => /postgresql/i.test(d.decision));
    expect(dbDecision).toBeDefined();
    expect(dbDecision?.decision).toContain("PostgreSQL");

    // Verify commitments
    expect(analysis.commitments.length).toBeGreaterThan(0);
    const rahulCommit = analysis.commitments.find((c) => c.person === "Rahul");
    expect(rahulCommit).toBeDefined();

    // Verify unresolved items
    expect(analysis.unresolvedItems.length).toBeGreaterThan(0);
    const awsQuestion = analysis.unresolvedItems.find((u) => /aws|deploy/i.test(u.question));
    expect(awsQuestion).toBeDefined();

    // Verify contradiction detection! (Rahul Wednesday commitment vs Friday absence)
    expect(analysis.conflicts.length).toBeGreaterThan(0);
    const rahulConflict = analysis.conflicts.find((c) =>
      c.involvedPeople.includes("Rahul")
    );
    expect(rahulConflict).toBeDefined();
    expect(rahulConflict?.severity).toBe("HIGH");
  });

  it("answers workspace question strictly with citations", async () => {
    const context = {
      workspaceName: "Echo HQ",
      tasks: [
        {
          id: "t1",
          title: "Finish backend auth and ingestion API",
          status: "IN_PROGRESS",
          priority: "HIGH",
          assignee: "Rahul",
          deadline: "Wednesday",
          sourceQuote: "I will finish backend auth and ingestion API by Wednesday",
        },
      ],
      decisions: [
        {
          id: "d1",
          title: "Database selection",
          decision: "Use PostgreSQL for production database",
          status: "CONFIRMED",
          participants: "Rahul, Tanmay",
          sourceQuote: "Agreed. Let's use PostgreSQL",
        },
      ],
      commitments: [],
      unresolvedItems: [],
      conflicts: [],
      conversations: [],
    };

    const q1 = await provider.answerQuestion("What did we decide about the database?", context);
    expect(q1.answer).toContain("PostgreSQL");
    expect(q1.citations.length).toBeGreaterThan(0);

    const q2 = await provider.answerQuestion("Who is responsible for the backend?", context);
    expect(q2.answer).toContain("Rahul");

    const q3 = await provider.answerQuestion("What is our favorite pizza topping?", context);
    expect(q3.answer).toContain("could not find information");
  });
});
