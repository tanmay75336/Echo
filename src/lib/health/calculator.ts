export interface ProjectHealthResult {
  score: number; // 0 to 100
  status: "EXCELLENT" | "GOOD" | "NEEDS_ATTENTION" | "CRITICAL";
  reasons: Array<{
    type: "DEDUCTION" | "NEUTRAL" | "BONUS";
    message: string;
    points: number;
  }>;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    unassignedTasks: number;
    unresolvedCount: number;
    activeConflictsCount: number;
  };
}

export function calculateProjectHealth(data: {
  tasks: Array<{
    status: string;
    deadline?: string | null;
    assignees?: Array<{ name: string }>;
  }>;
  unresolvedCount: number;
  conflictsCount: number;
}): ProjectHealthResult {
  let score = 100;
  const reasons: ProjectHealthResult["reasons"] = [];

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = data.tasks.filter((t) => t.status === "BLOCKED").length;
  const unassignedTasks = data.tasks.filter(
    (t) => (!t.assignees || t.assignees.length === 0) && t.status !== "DONE"
  ).length;

  // Simple heuristic for overdue check (if deadline is 'yesterday' or past date)
  const overdueTasks = data.tasks.filter((t) => {
    if (!t.deadline || t.status === "DONE") return false;
    const dlLower = t.deadline.toLowerCase();
    if (dlLower.includes("overdue") || dlLower.includes("yesterday")) return true;
    const parsed = new Date(t.deadline);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime() < Date.now();
    }
    return false;
  }).length;

  // Deductions:
  // 1. Blocked tasks: -10 pts each (max 30)
  if (blockedTasks > 0) {
    const pts = Math.min(blockedTasks * 10, 30);
    score -= pts;
    reasons.push({
      type: "DEDUCTION",
      message: `${blockedTasks} task(s) currently blocked (-${pts}%)`,
      points: -pts,
    });
  }

  // 2. Overdue tasks: -15 pts each (max 30)
  if (overdueTasks > 0) {
    const pts = Math.min(overdueTasks * 15, 30);
    score -= pts;
    reasons.push({
      type: "DEDUCTION",
      message: `${overdueTasks} task(s) overdue (-${pts}%)`,
      points: -pts,
    });
  }

  // 3. Active conflicts/contradictions: -12 pts each (max 24)
  if (data.conflictsCount > 0) {
    const pts = Math.min(data.conflictsCount * 12, 24);
    score -= pts;
    reasons.push({
      type: "DEDUCTION",
      message: `${data.conflictsCount} active scheduling or architectural contradiction(s) (-${pts}%)`,
      points: -pts,
    });
  }

  // 4. Unresolved items: -5 pts each (max 15)
  if (data.unresolvedCount > 0) {
    const pts = Math.min(data.unresolvedCount * 5, 15);
    score -= pts;
    reasons.push({
      type: "DEDUCTION",
      message: `${data.unresolvedCount} unresolved question(s) pending team response (-${pts}%)`,
      points: -pts,
    });
  }

  // 5. Unassigned tasks: -4 pts each (max 12)
  if (unassignedTasks > 0) {
    const pts = Math.min(unassignedTasks * 4, 12);
    score -= pts;
    reasons.push({
      type: "DEDUCTION",
      message: `${unassignedTasks} action item(s) without an assigned owner (-${pts}%)`,
      points: -pts,
    });
  }

  // 6. Completion boost if all clear
  if (score === 100 && totalTasks > 0 && completedTasks === totalTasks) {
    reasons.push({
      type: "BONUS",
      message: "All action items completed with zero unresolved blockers (+0%)",
      points: 0,
    });
  } else if (reasons.length === 0) {
    reasons.push({
      type: "NEUTRAL",
      message: "No blocking dependencies, contradictions, or overdue tasks detected",
      points: 0,
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let status: ProjectHealthResult["status"] = "EXCELLENT";
  if (finalScore < 60) status = "CRITICAL";
  else if (finalScore < 80) status = "NEEDS_ATTENTION";
  else if (finalScore < 95) status = "GOOD";

  return {
    score: finalScore,
    status,
    reasons,
    metrics: {
      totalTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      unassignedTasks,
      unresolvedCount: data.unresolvedCount,
      activeConflictsCount: data.conflictsCount,
    },
  };
}
