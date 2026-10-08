import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "json").toLowerCase();
  const projectId = searchParams.get("projectId");

  const workspaceId = user.currentWorkspace.id;

  const [tasks, decisions, commitments, unresolvedItems, conflicts] =
    await Promise.all([
      prisma.task.findMany({
        where: { workspaceId, ...(projectId ? { projectId } : {}) },
        include: { assignees: true },
      }),
      prisma.decision.findMany({
        where: { workspaceId, ...(projectId ? { projectId } : {}) },
      }),
      prisma.commitment.findMany({
        where: { workspaceId, ...(projectId ? { projectId } : {}) },
      }),
      prisma.unresolvedItem.findMany({
        where: { workspaceId, ...(projectId ? { projectId } : {}) },
      }),
      prisma.conflict.findMany({
        where: { workspaceId, ...(projectId ? { projectId } : {}) },
      }),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    workspace: user.currentWorkspace.name,
    tasks: tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: t.assignees.map((a) => a.name).join(", "),
      deadline: t.deadline || "",
      description: t.description || "",
    })),
    decisions: decisions.map((d) => ({
      title: d.title,
      decision: d.decision,
      status: d.status,
      participants: d.participants || "",
      reason: d.reason || "",
      date: d.date || "",
    })),
    commitments: commitments.map((c) => ({
      person: c.person,
      commitment: c.commitment,
      deadline: c.deadline || "",
      status: c.status,
    })),
    unresolvedItems: unresolvedItems.map((u) => ({
      question: u.question,
      status: u.status,
      context: u.context || "",
    })),
    conflicts: conflicts.map((cf) => ({
      description: cf.description,
      involvedPeople: cf.involvedPeople,
      severity: cf.severity,
      evidence: cf.evidence,
      status: cf.status,
    })),
  };

  if (format === "csv") {
    // Produce CSV format for tasks
    const csvRows = [
      ["Type", "Title/Item", "Assignee/Owner", "Status", "Priority/Severity", "Deadline"].join(","),
      ...payload.tasks.map((t) =>
        `"TASK","${t.title.replace(/"/g, '""')}","${t.assignee}","${t.status}","${t.priority}","${t.deadline}"`
      ),
      ...payload.decisions.map((d) =>
        `"DECISION","${d.decision.replace(/"/g, '""')}","${d.participants}","${d.status}","","${d.date}"`
      ),
      ...payload.commitments.map((c) =>
        `"COMMITMENT","${c.commitment.replace(/"/g, '""')}","${c.person}","${c.status}","","${c.deadline}"`
      ),
    ];

    return new NextResponse(csvRows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="echo-export-${Date.now()}.csv"`,
      },
    });
  }

  if (format === "markdown") {
    const md = `# Echo Workspace Export — ${user.currentWorkspace.name}
Generated: ${new Date().toLocaleDateString()}

## Tasks (${payload.tasks.length})
${payload.tasks.map((t) => `- [${t.status === "DONE" ? "x" : " "}] **${t.title}** (Assignee: ${t.assignee || "Unassigned"}, Priority: ${t.priority}, Due: ${t.deadline || "None"})`).join("\n")}

## Decisions (${payload.decisions.length})
${payload.decisions.map((d) => `### ${d.title}\n- **Decision**: ${d.decision}\n- **Status**: ${d.status}\n- **Participants**: ${d.participants}\n- **Reason**: ${d.reason || "N/A"}`).join("\n\n")}

## Commitments (${payload.commitments.length})
${payload.commitments.map((c) => `- **${c.person}**: "${c.commitment}" (Status: ${c.status}, Due: ${c.deadline || "None"})`).join("\n")}

## Unresolved Items (${payload.unresolvedItems.length})
${payload.unresolvedItems.map((u) => `- ❓ **${u.question}** [Status: ${u.status}]`).join("\n")}

## Detected Conflicts / Contradictions (${payload.conflicts.length})
${payload.conflicts.map((cf) => `### ⚠ ${cf.description} (${cf.severity} Severity)\n- **Involved**: ${cf.involvedPeople}\n- **Evidence**: ${cf.evidence}`).join("\n\n")}
`;

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="echo-export-${Date.now()}.md"`,
      },
    });
  }

  // Default JSON
  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename="echo-export-${Date.now()}.json"`,
    },
  });
}
