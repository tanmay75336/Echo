import { describe, it, expect } from "vitest";
import { calculateProjectHealth } from "../src/lib/health/calculator";

describe("Deterministic Project Health Calculator", () => {
  it("calculates 100% for a clean healthy project", () => {
    const health = calculateProjectHealth({
      tasks: [
        { status: "DONE", assignees: [{ name: "Tanmay" }] },
        { status: "IN_PROGRESS", assignees: [{ name: "Rahul" }], deadline: "next week" },
      ],
      unresolvedCount: 0,
      conflictsCount: 0,
    });

    expect(health.score).toBe(100);
    expect(health.status).toBe("EXCELLENT");
  });

  it("applies deterministic deductions for blocked tasks, overdue tasks, and conflicts", () => {
    const health = calculateProjectHealth({
      tasks: [
        { status: "BLOCKED", assignees: [{ name: "Rahul" }] }, // -10 pts
        { status: "TODO", assignees: [{ name: "Amit" }], deadline: "overdue yesterday" }, // -15 pts
        { status: "TODO", assignees: [] }, // unassigned: -4 pts
      ],
      unresolvedCount: 1, // -5 pts
      conflictsCount: 1, // -12 pts
    });

    // Score: 100 - 10 - 15 - 4 - 5 - 12 = 54
    expect(health.score).toBe(54);
    expect(health.status).toBe("CRITICAL");
    expect(health.reasons.length).toBeGreaterThan(3);
  });
});
