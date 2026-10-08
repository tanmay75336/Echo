"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  Compass,
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Circle,
  FileUp,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { ProjectHealthResult } from "@/lib/health/calculator";
import { cn } from "@/lib/utils";

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline?: string | null;
  sourceQuote?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number; speaker?: string | null; content: string } | null;
  assignees: Array<{ name: string }>;
  project?: { id: string; name: string; color: string } | null;
}

interface DashboardDecision {
  id: string;
  title: string;
  decision: string;
  status: string;
  date?: string | null;
  participants?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number; speaker?: string | null } | null;
}

interface DashboardUnresolved {
  id: string;
  question: string;
  status: string;
  context?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number } | null;
}

interface DashboardConflict {
  id: string;
  description: string;
  involvedPeople: string;
  severity: string;
  evidence: string;
  status: string;
  conversation?: { id: string; title: string } | null;
}

interface ProjectHealthItem {
  id: string;
  name: string;
  color: string;
  health: ProjectHealthResult;
  taskCount: number;
}

interface DashboardClientProps {
  userName: string;
  workspaceName: string;
  initialTasks: DashboardTask[];
  initialDecisions: DashboardDecision[];
  initialUnresolved: DashboardUnresolved[];
  initialConflicts: DashboardConflict[];
  projectsWithHealth: ProjectHealthItem[];
  hasConversations: boolean;
}

export function DashboardClient({
  userName,
  workspaceName,
  initialTasks,
  initialDecisions,
  initialUnresolved,
  initialConflicts,
  projectsWithHealth,
  hasConversations,
}: DashboardClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [conflicts, setConflicts] = useState(initialConflicts);

  const openTasks = tasks.filter((t) => t.status !== "DONE");
  const dueSoonTasks = tasks.filter((t) => t.deadline && t.status !== "DONE");
  const completedTasks = tasks.filter((t) => t.status === "DONE");

  async function toggleTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  }

  async function resolveConflict(conflictId: string) {
    // Optimistic update
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));

    try {
      await fetch(`/api/conflicts/${conflictId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
    } catch (err) {
      console.error("Failed to resolve conflict", err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good morning, {userName.split(" ")[0]}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Here&apos;s what needs attention in <strong className="text-gray-200">{workspaceName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/conversations/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Ingest Conversation</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/tasks"
          className="p-4 rounded-xl bg-[#111218] border border-[#22242f] hover:border-indigo-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Open Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{openTasks.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            {completedTasks.length} of {tasks.length} completed
          </div>
        </Link>

        <Link
          href="/tasks"
          className="p-4 rounded-xl bg-[#111218] border border-[#22242f] hover:border-amber-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Due Soon</span>
            <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{dueSoonTasks.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Active commitments with deadlines</div>
        </Link>

        <Link
          href="/unresolved"
          className="p-4 rounded-xl bg-[#111218] border border-[#22242f] hover:border-purple-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Unresolved</span>
            <HelpCircle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{initialUnresolved.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Open questions awaiting decision</div>
        </Link>

        <Link
          href="/decisions"
          className="p-4 rounded-xl bg-[#111218] border border-[#22242f] hover:border-emerald-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Decisions</span>
            <Compass className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{initialDecisions.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Confirmed team decisions</div>
        </Link>
      </div>

      {/* Needs Attention Alert Box (Conflicts & Contradictions) */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Needs Attention ({conflicts.length} Contradiction Detected)</span>
            </div>
            <Link
              href="/conflicts"
              className="text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-[#14151e] border border-amber-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-medium text-amber-200">{c.description}</div>
                  <div className="text-gray-400 text-[11px] leading-relaxed">
                    <strong className="text-gray-300">Evidence:</strong> {c.evidence}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.conversation && (
                    <Link
                      href={`/conversations/${c.conversation.id}`}
                      className="px-2.5 py-1 rounded-md bg-[#1d1f2c] hover:bg-[#252839] text-gray-300 text-[11px] flex items-center gap-1 border border-[#2c2f42] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Source</span>
                    </Link>
                  )}
                  <button
                    onClick={() => resolveConflict(c.id)}
                    className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] border border-amber-500/40 transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Action Items + Recent Decisions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Items */}
          <div className="rounded-xl border border-[#22242f] bg-[#111218] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#22242f] mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                  Your Action Items
                </h2>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {openTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No pending tasks! All action items completed.
              </div>
            ) : (
              <div className="space-y-2">
                {openTasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-[#151722] hover:bg-[#1a1d2b] border border-[#242636] flex items-center justify-between gap-3 text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="text-gray-400 hover:text-indigo-400 transition-colors shrink-0"
                      >
                        {task.status === "DONE" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={cn(
                            "font-medium truncate text-gray-200",
                            task.status === "DONE" && "line-through text-gray-500"
                          )}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                          {task.deadline && (
                            <span className="text-amber-400/90 font-mono">
                              Due: {task.deadline}
                            </span>
                          )}
                          {task.assignees.length > 0 && (
                            <span>
                              Assignee: <strong className="text-gray-400">{task.assignees[0].name}</strong>
                            </span>
                          )}
                          {task.project && (
                            <span className="hidden sm:inline px-1.5 py-0.2 rounded-sm bg-[#1e202e] text-gray-400 text-[10px]">
                              {task.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Source traceability link */}
                    {task.conversationId && (
                      <Link
                        href={`/conversations/${task.conversationId}${task.sourceMessage ? `?msg=${task.sourceMessage.id}` : ""}`}
                        title="View original source message"
                        className="px-2 py-1 rounded-md bg-[#1d1f2e] hover:bg-indigo-600/20 text-gray-400 hover:text-indigo-300 border border-[#2a2d3e] text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>Source</span>
                        {task.sourceMessage && (
                          <span className="font-mono text-[10px] text-indigo-400">
                            #{task.sourceMessage.orderIndex}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Decisions */}
          <div className="rounded-xl border border-[#22242f] bg-[#111218] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#22242f] mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                  Recent Decisions
                </h2>
              </div>
              <Link
                href="/decisions"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All Decisions</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {initialDecisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No decisions recorded yet. Ingest a conversation to extract decisions.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {initialDecisions.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg bg-[#151722] border border-[#242636] flex flex-col justify-between text-xs space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-200 truncate">{d.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">{d.decision}</p>
                    </div>

                    <div className="pt-2 border-t border-[#202230] flex items-center justify-between text-[11px] text-gray-500">
                      <span>{d.participants || "Team"}</span>
                      {d.conversationId && (
                        <Link
                          href={`/conversations/${d.conversationId}${d.sourceMessage ? `?msg=${d.sourceMessage.id}` : ""}`}
                          className="text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Deterministic Project Health & Workspace Intelligence */}
        <div className="space-y-6">
          {/* Project Health Score */}
          <div className="rounded-xl border border-[#22242f] bg-[#111218] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#22242f] mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                  Project Health
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Projects
              </Link>
            </div>

            {projectsWithHealth.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                No projects found. Create a project to track health.
              </div>
            ) : (
              <div className="space-y-5">
                {projectsWithHealth.slice(0, 3).map((p) => {
                  const score = p.health.score;
                  const isCritical = score < 60;
                  const isWarning = score >= 60 && score < 80;

                  return (
                    <div key={p.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-200">{p.name}</span>
                        <span
                          className={cn(
                            "font-mono font-bold text-sm",
                            isCritical
                              ? "text-rose-400"
                              : isWarning
                              ? "text-amber-400"
                              : "text-emerald-400"
                          )}
                        >
                          {score}%
                        </span>
                      </div>

                      {/* Deterministic Health Bar */}
                      <div className="w-full h-2 bg-[#1a1c28] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCritical
                              ? "bg-rose-500"
                              : isWarning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      {/* Explainable Reasons */}
                      <div className="space-y-1 pt-1">
                        {p.health.reasons.slice(0, 2).map((r, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-gray-400 flex items-start gap-1.5"
                          >
                            <span
                              className={cn(
                                "shrink-0 mt-0.5",
                                r.type === "DEDUCTION" ? "text-amber-400" : "text-emerald-400"
                              )}
                            >
                              •
                            </span>
                            <span>{r.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick AI Ask Assistant Widget */}
          <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-b from-[#141624] to-[#10111a] p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask Echo Copilot</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ask questions directly from your workspace records with verified citations.
            </p>
            <div className="space-y-1.5 pt-1">
              <Link
                href="/ask?q=What did we decide about the database?"
                className="block p-2 rounded-lg bg-[#181a26] hover:bg-[#1f2233] border border-[#27293a] text-xs text-gray-300 hover:text-white transition-colors"
              >
                &ldquo;What did we decide about the database?&rdquo;
              </Link>
              <Link
                href="/ask?q=Who is responsible for the backend?"
                className="block p-2 rounded-lg bg-[#181a26] hover:bg-[#1f2233] border border-[#27293a] text-xs text-gray-300 hover:text-white transition-colors"
              >
                &ldquo;Who is responsible for the backend?&rdquo;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
