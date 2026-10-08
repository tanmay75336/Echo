import { NormalizedMessage } from "@/lib/parsing";
import { AnalysisResult, ExtractedTask, ExtractedDecision, ExtractedCommitment, ExtractedUnresolvedItem, ExtractedConflict, ExtractedEntity } from "../types";
import { WorkspaceContextData } from "../prompts/answerWorkspaceQuestion";

export class MockProvider {
  readonly name = "MockProvider (Intelligent Local Heuristic)";

  async analyzeConversation(messages: NormalizedMessage[]): Promise<AnalysisResult> {
    const tasks: ExtractedTask[] = [];
    const decisions: ExtractedDecision[] = [];
    const commitments: ExtractedCommitment[] = [];
    const unresolvedItems: ExtractedUnresolvedItem[] = [];
    const conflicts: ExtractedConflict[] = [];
    const entityMap = new Map<string, { type: ExtractedEntity["type"]; count: number }>();

    const knownTech = [
      "PostgreSQL", "Next.js", "React", "TypeScript", "Prisma", "Tailwind", "Docker",
      "Redis", "Supabase", "Auth.js", "Python", "Node.js", "AWS", "GitHub", "Vercel",
      "FastAPI", "GraphQL", "MongoDB", "SQLite", "Figma", "Stripe"
    ];

    const participants = Array.from(
      new Set(messages.map((m) => m.speaker).filter(Boolean) as string[])
    );

    // Heuristics for detection
    const commitmentRegex = /\b(?:I(?:'ll|\s+will|\s+can|\s+promise\s+to|\s+am\s+going\s+to))\s+([^.,!?\n]+)/i;
    const taskAssignRegex = /\b(?:([A-Z][a-z]+)[,\s]+(?:can\s+you|please|could\s+you)\s+([^.,!?\n]+)|(?:we\s+need\s+to|someone\s+should|action\s+item:?)\s+([^.,!?\n]+))/i;
    const decisionRegex = /\b(?:let'?s\s+(?:use|go\s+with|stick\s+to|choose)|agreed\s+(?:on|to)?|we\s+(?:decided|agreed)|final\s+decision:?)\s+([^.,!?\n]+)/i;
    const questionRegex = /\b(?:should\s+we|who\s+(?:will|can|is)|what\s+about|do\s+we\s+need|how\s+should\s+we)\s+([^?\n]+\?)/i;
    const deadlineRegex = /\b(?:by\s+(?:this\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|eod|end\s+of\s+day|next\s+week|oct(?:ober)?\s+\d+|nov(?:ember)?\s+\d+|dec(?:ember)?\s+\d+))/i;

    // Scan for entities
    for (const msg of messages) {
      for (const tech of knownTech) {
        const regex = new RegExp(`\\b${tech}\\b`, "i");
        if (regex.test(msg.content)) {
          const entry = entityMap.get(tech) || { type: "TOOL", count: 0 };
          entry.count++;
          entityMap.set(tech, entry);
        }
      }
    }

    // Process each message
    for (const msg of messages) {
      const text = msg.content;
      const speaker = msg.speaker || "Team Member";

      // 1. Check Commitments
      const commitMatch = text.match(commitmentRegex);
      if (commitMatch && !text.includes("?")) {
        const promisePart = commitMatch[1].trim();
        const deadlineMatch = text.match(deadlineRegex);
        commitments.push({
          person: speaker,
          commitment: promisePart.charAt(0).toUpperCase() + promisePart.slice(1),
          deadline: deadlineMatch ? deadlineMatch[1] : null,
          confidence: 0.94,
          status: "PENDING",
          sourceMessageIndex: msg.orderIndex,
          sourceQuote: text,
        });
      }

      // 2. Check Tasks
      const taskMatch = text.match(taskAssignRegex);
      if (taskMatch) {
        const assignedName = taskMatch[1] || null;
        const taskAction = (taskMatch[2] || taskMatch[3] || "").trim();
        const deadlineMatch = text.match(deadlineRegex);

        if (taskAction.length > 3) {
          const priority: ExtractedTask["priority"] =
            /urgent|asap|today|critical|blocker/i.test(text) ? "URGENT" :
            /important|high|soon/i.test(text) ? "HIGH" : "MEDIUM";

          tasks.push({
            title: taskAction.charAt(0).toUpperCase() + taskAction.slice(1),
            description: `Extracted from conversation discussion by ${speaker}.`,
            assignee: assignedName || (commitMatch ? speaker : null),
            deadline: deadlineMatch ? deadlineMatch[1] : null,
            priority,
            confidence: 0.92,
            sourceMessageIndex: msg.orderIndex,
            sourceQuote: text,
          });
        }
      }

      // 3. Check Decisions
      const decisionMatch = text.match(decisionRegex);
      if (decisionMatch) {
        const decisionText = decisionMatch[1].trim();
        decisions.push({
          title: `Adopt ${decisionText.slice(0, 40)}`,
          description: `Team consensus reached in message #${msg.orderIndex}.`,
          decision: decisionText.charAt(0).toUpperCase() + decisionText.slice(1),
          participants: [speaker, ...participants.filter((p) => p !== speaker).slice(0, 2)],
          reason: text.includes("because") ? text.split(/because/i)[1].trim() : null,
          status: "CONFIRMED",
          confidence: 0.95,
          date: msg.timestamp || null,
          sourceMessageIndex: msg.orderIndex,
          sourceQuote: text,
        });
      }

      // 4. Check Unresolved Questions
      const questionMatch = text.match(questionRegex);
      if (questionMatch) {
        const questionText = (questionMatch[0] || "").trim();
        // Check if later messages answer this question
        const isResolvedLater = messages.some(
          (m) =>
            m.orderIndex > msg.orderIndex &&
            (m.content.toLowerCase().includes("agreed") ||
             m.content.toLowerCase().includes("decided") ||
             m.content.toLowerCase().includes("let's go with"))
        );

        if (!isResolvedLater) {
          unresolvedItems.push({
            question: questionText.charAt(0).toUpperCase() + questionText.slice(1),
            context: `Asked by ${speaker}: "${text}"`,
            participants: [speaker],
            status: "UNRESOLVED",
            resolutionNotes: null,
            confidence: 0.88,
            sourceMessageIndex: msg.orderIndex,
            sourceQuote: text,
          });
        }
      }
    }

    // 5. Detect Contradictions / Conflicts
    // Check if any person committed to something (e.g. Wednesday) and later said they are unavailable or delayed
    for (let i = 0; i < messages.length; i++) {
      const m1 = messages[i];
      for (let j = i + 1; j < messages.length; j++) {
        const m2 = messages[j];

        // Same speaker timeline conflict
        if (m1.speaker && m2.speaker && m1.speaker.toLowerCase() === m2.speaker.toLowerCase()) {
          const hasDeliveryCommitment = /\b(?:finish|complete|deliver|submit|done|handle)\b.*?\b(?:by|on)?\s*(wednesday|thursday|friday|monday|tomorrow)\b/i.test(m1.content);
          const hasDelayOrAbsence = /\b(?:won't\s+be\s+available|out\s+of\s+office|delayed|can't\s+make\s+it|unavailable|stuck|blocked)\b/i.test(m2.content);

          if (hasDeliveryCommitment && hasDelayOrAbsence) {
            conflicts.push({
              description: `${m1.speaker} committed to deliver by a specific day, but later indicated scheduling unavailability.`,
              involvedPeople: [m1.speaker],
              severity: "HIGH",
              evidence: `Message #${m1.orderIndex}: "${m1.content}" contradicts Message #${m2.orderIndex}: "${m2.content}"`,
              confidence: 0.92,
              status: "ACTIVE",
            });
          }
        }

        // Cross-speaker architectural conflict
        const isM1Postgres = /postgresql|postgres/i.test(m1.content);
        const isM2Mongo = /mongodb|mongo/i.test(m2.content) && !/instead\s+of|over/i.test(m2.content);
        if (isM1Postgres && isM2Mongo && m1.speaker !== m2.speaker && /should\s+use|let's\s+use/i.test(m2.content)) {
          conflicts.push({
            description: `Architectural disagreement on database selection between ${m1.speaker} and ${m2.speaker}.`,
            involvedPeople: [m1.speaker || "Member 1", m2.speaker || "Member 2"],
            severity: "MEDIUM",
            evidence: `${m1.speaker}: "${m1.content}" vs ${m2.speaker}: "${m2.content}"`,
            confidence: 0.85,
            status: "ACTIVE",
          });
        }
      }
    }

    // Default safety fallback if conversation was small and specific heuristics didn't trigger
    if (tasks.length === 0 && messages.length > 0) {
      const firstActionMsg = messages.find((m) => m.content.length > 15) || messages[0];
      tasks.push({
        title: `Follow up on: ${firstActionMsg.content.slice(0, 35)}...`,
        description: "Action item identified from discussion.",
        assignee: firstActionMsg.speaker || null,
        deadline: null,
        priority: "MEDIUM",
        confidence: 0.8,
        sourceMessageIndex: firstActionMsg.orderIndex,
        sourceQuote: firstActionMsg.content,
      });
    }

    // Format entities
    const entities: ExtractedEntity[] = Array.from(entityMap.entries()).map(([name, data]) => ({
      name,
      type: data.type,
      mentionCount: data.count,
      metadata: `Mentioned ${data.count} times in technical discussion`,
    }));

    // Add participants as entities
    for (const p of participants) {
      entities.push({
        name: p,
        type: "PERSON",
        mentionCount: messages.filter((m) => m.speaker === p).length,
        metadata: "Active conversation participant",
      });
    }

    return {
      summary: `Team conversation involving ${participants.join(", ") || "the team"}. Discussed project deliverables, architectural decisions, and next steps with ${tasks.length} action items identified.`,
      projectStatus: conflicts.length > 0
        ? `Attention needed: ${conflicts.length} potential conflict/delay signal detected with active deliverables.`
        : `On track: ${tasks.length} tasks clear and ${decisions.length} decisions confirmed.`,
      keyTopics: ["Architecture", "Deliverables", "Timeline", "Project Execution"],
      tasks,
      decisions,
      commitments,
      unresolvedItems,
      conflicts,
      entities,
      participants,
    };
  }

  async answerQuestion(
    question: string,
    context: WorkspaceContextData
  ): Promise<{ answer: string; citations: string[] }> {
    const qLower = question.toLowerCase();
    const citations: string[] = [];

    // Search tasks
    const matchedTasks = context.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(qLower) ||
        (t.assignee && qLower.includes(t.assignee.toLowerCase())) ||
        (qLower.includes("task") || qLower.includes("due") || qLower.includes("responsible"))
    );

    // Search decisions
    const matchedDecisions = context.decisions.filter(
      (d) =>
        d.title.toLowerCase().includes(qLower) ||
        d.decision.toLowerCase().includes(qLower) ||
        qLower.includes("decision") ||
        qLower.includes("decide") ||
        (qLower.includes("database") && d.decision.toLowerCase().includes("database"))
    );

    // Search commitments
    const matchedCommitments = context.commitments.filter(
      (c) =>
        c.commitment.toLowerCase().includes(qLower) ||
        (c.person && qLower.includes(c.person.toLowerCase())) ||
        qLower.includes("commitment") ||
        qLower.includes("promised")
    );

    // Search unresolved
    const matchedUnresolved = context.unresolvedItems.filter(
      (u) =>
        u.question.toLowerCase().includes(qLower) ||
        qLower.includes("unresolved") ||
        qLower.includes("open question")
    );

    // Search conflicts
    const matchedConflicts = context.conflicts.filter(
      (c) =>
        c.description.toLowerCase().includes(qLower) ||
        qLower.includes("conflict") ||
        qLower.includes("contradiction") ||
        qLower.includes("risk")
    );

    let answer = "";

    if (qLower.includes("database")) {
      const dbDecision = context.decisions.find((d) => /database|postgres|mongo|sql/i.test(d.decision + d.title));
      if (dbDecision) {
        citations.push(`Decision: ${dbDecision.title}`);
        answer = `Based on workspace decisions, the team decided: **"${dbDecision.decision}"**.\n\nSource: "${dbDecision.sourceQuote || "Team Discussion"}"\nStatus: ${dbDecision.status}.`;
        return { answer, citations };
      }
    }

    if (qLower.includes("who is responsible") || qLower.includes("backend")) {
      const backendTask = context.tasks.find((t) => /backend/i.test(t.title + (t.description || "")));
      const backendCommitment = context.commitments.find((c) => /backend/i.test(c.commitment));
      if (backendTask || backendCommitment) {
        const person = backendTask?.assignee || backendCommitment?.person || "Team Member";
        citations.push(backendTask ? `Task: ${backendTask.title}` : `Commitment: ${backendCommitment?.commitment}`);
        answer = `**${person}** is responsible for the backend.\n- Task: "${backendTask?.title || backendCommitment?.commitment}"\n- Deadline: ${backendTask?.deadline || backendCommitment?.deadline || "Not specified"}\n- Status: ${backendTask?.status || "In Progress"}`;
        return { answer, citations };
      }
    }

    if (qLower.includes("due") || qLower.includes("tasks due")) {
      const dueTasks = context.tasks.filter((t) => t.deadline);
      if (dueTasks.length > 0) {
        dueTasks.forEach((t) => citations.push(`Task: ${t.title}`));
        answer = `Here are the upcoming tasks with deadlines in your workspace:\n\n` +
          dueTasks.map((t) => `• **${t.title}** (Assigned to: ${t.assignee || "Unassigned"}) — Due: **${t.deadline}** [${t.status}]`).join("\n");
        return { answer, citations };
      }
    }

    if (qLower.includes("unresolved") || qLower.includes("open questions")) {
      if (context.unresolvedItems.length > 0) {
        context.unresolvedItems.forEach((u) => citations.push(`Unresolved: ${u.question}`));
        answer = `Here are the currently unresolved questions in your workspace:\n\n` +
          context.unresolvedItems.map((u) => `• **${u.question}** (Status: ${u.status})`).join("\n");
        return { answer, citations };
      }
    }

    if (qLower.includes("conflict") || qLower.includes("contradiction")) {
      if (context.conflicts.length > 0) {
        context.conflicts.forEach((c) => citations.push(`Conflict: ${c.description}`));
        answer = `Here are the detected contradictions/conflicts requiring attention:\n\n` +
          context.conflicts.map((c) => `⚠ **[${c.severity} Severity]** ${c.description}\nEvidence: ${c.evidence}`).join("\n\n");
        return { answer, citations };
      }
    }

    // General match
    const findings: string[] = [];
    if (matchedDecisions.length > 0) {
      matchedDecisions.slice(0, 2).forEach((d) => {
        citations.push(`Decision: ${d.title}`);
        findings.push(`• **Decision**: ${d.decision} (Status: ${d.status})`);
      });
    }
    if (matchedTasks.length > 0) {
      matchedTasks.slice(0, 3).forEach((t) => {
        citations.push(`Task: ${t.title}`);
        findings.push(`• **Task**: ${t.title} (Assigned: ${t.assignee || "Unassigned"}, Status: ${t.status})`);
      });
    }
    if (matchedCommitments.length > 0) {
      matchedCommitments.slice(0, 2).forEach((c) => {
        citations.push(`Commitment: ${c.person}`);
        findings.push(`• **Commitment**: ${c.person} pledged: "${c.commitment}"`);
      });
    }

    if (findings.length > 0) {
      answer = `Based on your workspace records for "${context.workspaceName}", here is what was found:\n\n` + findings.join("\n");
    } else {
      answer = `I searched your workspace ("${context.workspaceName}"), but could not find information regarding "${question}". No matching tasks, decisions, commitments, or conversation records were found.`;
    }

    return { answer, citations };
  }
}
