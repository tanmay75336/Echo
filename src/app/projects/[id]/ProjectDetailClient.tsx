"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  Compass,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  MessagesSquare,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
} from "lucide-react";
import { ProjectHealthResult } from "@/lib/health/calculator";
import { cn } from "@/lib/utils";

export function ProjectDetailClient({
  project,
  health,
}: {
  project: any;
  health: ProjectHealthResult;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "decisions" | "conversations" | "health"
  >("overview");

  const completedTasks = project.tasks.filter((t: any) => t.status === "DONE");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1c26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-md"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>

        {/* Health pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#141622] border border-[#242636] flex items-center gap-2">
            <span className="text-xs text-gray-400">Health:</span>
            <span
              className={cn(
                "text-sm font-mono font-bold",
                health.score < 60
                  ? "text-rose-400"
                  : health.score < 80
                  ? "text-amber-400"
                  : "text-emerald-400"
              )}
            >
              {health.score}%
            </span>
          </div>

          <Link
            href="/conversations/new"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            + Add Conversation
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#20222f] gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === "overview"
              ? "border-indigo-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={cn(
            "px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "tasks"
              ? "border-indigo-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          <span>Tasks</span>
          <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
            {project.tasks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("decisions")}
          className={cn(
            "px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "decisions"
              ? "border-indigo-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          <span>Decisions</span>
          <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
            {project.decisions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("conversations")}
          className={cn(
            "px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "conversations"
              ? "border-indigo-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          <span>Conversations</span>
          <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
            {project.conversations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={cn(
            "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === "health"
              ? "border-indigo-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          Health Breakdown
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Task list preview */}
            <div className="rounded-xl border border-[#22242f] bg-[#111218] p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#20222f]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                  Project Action Items
                </h3>
                <span className="text-xs text-gray-400">
                  {completedTasks.length} of {project.tasks.length} Done
                </span>
              </div>
              <div className="space-y-2">
                {project.tasks.slice(0, 5).map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg bg-[#141622] border border-[#242636] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {t.status === "DONE" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={cn(t.status === "DONE" && "line-through text-gray-500")}>
                        {t.title}
                      </span>
                    </div>
                    {t.deadline && (
                      <span className="text-amber-400 font-mono text-[11px]">Due: {t.deadline}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Decisions preview */}
            <div className="rounded-xl border border-[#22242f] bg-[#111218] p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#20222f]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                  Project Decisions
                </h3>
              </div>
              <div className="space-y-2">
                {project.decisions.slice(0, 4).map((d: any) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg bg-[#141622] border border-[#242636] space-y-1 text-xs"
                  >
                    <div className="flex justify-between font-semibold text-white">
                      <span>{d.title}</span>
                      <span className="text-[10px] text-emerald-400 font-normal">{d.status}</span>
                    </div>
                    <p className="text-gray-400 text-[11px]">{d.decision}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Health breakdown card */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[#22242f] bg-[#111218] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#20222f]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Explainable Health</span>
                </div>
                <span className="text-lg font-mono font-bold text-indigo-400">{health.score}%</span>
              </div>

              <div className="w-full h-2 bg-[#1a1c28] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${health.score}%` }}
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Health Analysis:
                </div>
                {health.reasons.map((r, i) => (
                  <div key={i} className="text-gray-300 text-[11px] flex items-start gap-1.5">
                    <span
                      className={cn(
                        "mt-0.5",
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
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {project.tasks.map((t: any) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-[#22242f] bg-[#111218] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                {t.status === "DONE" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-500" />
                )}
                <div>
                  <h4 className={cn("font-medium text-white", t.status === "DONE" && "line-through text-gray-500")}>
                    {t.title}
                  </h4>
                  <div className="text-[11px] text-gray-500 mt-0.5 flex gap-2">
                    {t.assignees.length > 0 && <span>Assignee: {t.assignees[0].name}</span>}
                    {t.deadline && <span className="text-amber-400">Due: {t.deadline}</span>}
                  </div>
                </div>
              </div>

              {t.conversationId && (
                <Link
                  href={`/conversations/${t.conversationId}${t.sourceMessage ? `?msg=${t.sourceMessage.id}` : ""}`}
                  className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DECISIONS TAB */}
      {activeTab === "decisions" && (
        <div className="space-y-3">
          {project.decisions.map((d: any) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border border-[#22242f] bg-[#111218] space-y-2 text-xs"
            >
              <div className="flex justify-between font-semibold text-white">
                <span>{d.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  {d.status}
                </span>
              </div>
              <p className="text-gray-300 font-medium">{d.decision}</p>
              {d.reason && <p className="text-[11px] text-gray-400">Reason: {d.reason}</p>}
            </div>
          ))}
        </div>
      )}

      {/* CONVERSATIONS TAB */}
      {activeTab === "conversations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.conversations.map((c: any) => (
            <Link
              key={c.id}
              href={`/conversations/${c.id}`}
              className="p-4 rounded-xl border border-[#22242f] bg-[#111218] hover:border-indigo-500/40 transition-colors space-y-2 text-xs group"
            >
              <h4 className="font-semibold text-white group-hover:text-indigo-300">{c.title}</h4>
              <div className="text-[11px] text-gray-500 flex gap-2">
                <span>{c._count.messages} messages</span>
                <span>·</span>
                <span>{c._count.tasks} tasks</span>
                <span>·</span>
                <span>{c._count.decisions} decisions</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* HEALTH TAB */}
      {activeTab === "health" && (
        <div className="rounded-xl border border-[#22242f] bg-[#111218] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Transparent Health Signal Breakdown</h3>
            <p className="text-xs text-gray-400 mt-1">
              Deterministic calculations based purely on overdue work, blocked tasks, unresolved blockers, and contradictions.
            </p>
          </div>

          <div className="space-y-4">
            {health.reasons.map((r, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-[#141622] border border-[#242636] flex items-center justify-between text-xs"
              >
                <span>{r.message}</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    r.type === "DEDUCTION" ? "text-amber-400" : "text-emerald-400"
                  )}
                >
                  {r.points > 0 ? `+${r.points}` : `${r.points}`}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
