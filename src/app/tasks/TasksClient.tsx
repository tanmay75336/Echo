"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Kanban,
  List,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  User,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  deadline?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number; speaker?: string | null; content: string } | null;
  assignees: Array<{ name: string }>;
  project?: { id: string; name: string; color: string } | null;
}

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "border-gray-700" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-indigo-500/50" },
  { id: "BLOCKED", label: "Blocked", color: "border-rose-500/50" },
  { id: "DONE", label: "Done", color: "border-emerald-500/50" },
];

export function TasksClient({
  initialTasks,
  projects,
}: {
  initialTasks: TaskItem[];
  projects: Array<{ id: string; name: string }>;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<string>("MEDIUM");
  const [newDeadline, setNewDeadline] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  async function handleStatusChange(taskId: string, newStatus: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          priority: newPriority,
          deadline: newDeadline || null,
          assigneeName: newAssignee || null,
          projectId: newProjectId || null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewAssignee("");
        setNewDeadline("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  const filteredTasks = tasks.filter((t) =>
    priorityFilter === "ALL" ? true : t.priority === priorityFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Tasks & Action Board</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1e28] text-gray-400 font-mono">
              {tasks.length}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage actionable work extracted from your conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-[#141622] rounded-lg p-0.5 border border-[#22242f]">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "kanban" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              )}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Priority Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-500 text-[11px] flex items-center gap-1">
          <Filter className="w-3 h-3" /> Priority:
        </span>
        {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors text-[11px] font-medium",
              priorityFilter === p
                ? "bg-indigo-600 text-white"
                : "bg-[#141622] text-gray-400 hover:text-white border border-[#22242f]"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="rounded-xl border border-[#22242f] bg-[#0e1017] p-3 space-y-3 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1c1e28]">
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        col.id === "DONE"
                          ? "bg-emerald-500"
                          : col.id === "BLOCKED"
                          ? "bg-rose-500"
                          : col.id === "IN_PROGRESS"
                          ? "bg-indigo-500"
                          : "bg-gray-500"
                      )}
                    />
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#181a24] text-gray-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-[#141622] border border-[#242636] hover:border-indigo-500/40 space-y-2 text-xs transition-colors shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-white line-clamp-2">{task.title}</h4>
                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded-sm shrink-0 font-medium",
                            task.priority === "URGENT"
                              ? "bg-rose-950 text-rose-300 border border-rose-800/40"
                              : task.priority === "HIGH"
                              ? "bg-amber-950 text-amber-300 border border-amber-800/40"
                              : "bg-[#1c1e2c] text-gray-400"
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Assignee & Deadline */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        {task.assignees.length > 0 ? (
                          <span className="flex items-center gap-1 text-gray-300">
                            <User className="w-3 h-3 text-gray-400" />
                            {task.assignees[0].name}
                          </span>
                        ) : (
                          <span>Unassigned</span>
                        )}

                        {task.deadline && (
                          <span className="text-amber-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {task.deadline}
                          </span>
                        )}
                      </div>

                      {/* Footer: Quick status mover & Source traceability link */}
                      <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="bg-[#191b26] border border-[#2a2c3d] text-[10px] text-gray-300 rounded-sm px-1.5 py-0.5 focus:outline-hidden"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>

                        {task.conversationId && (
                          <Link
                            href={`/conversations/${task.conversationId}${task.sourceMessage ? `?msg=${task.sourceMessage.id}` : ""}`}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[10px] font-medium"
                          >
                            <span>Source</span>
                            {task.sourceMessage && <span>#{task.sourceMessage.orderIndex}</span>}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded-xl border border-[#22242f] bg-[#111218] overflow-hidden">
          <div className="divide-y divide-[#1e202d]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-[#141622] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() =>
                      handleStatusChange(task.id, task.status === "DONE" ? "TODO" : "DONE")
                    }
                    className="text-gray-400 hover:text-indigo-400 shrink-0"
                  >
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div
                      className={cn(
                        "font-medium text-white truncate",
                        task.status === "DONE" && "line-through text-gray-500"
                      )}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      {task.assignees.length > 0 && (
                        <span>Assignee: {task.assignees[0].name}</span>
                      )}
                      {task.deadline && (
                        <span className="text-amber-400 font-mono">Due: {task.deadline}</span>
                      )}
                      {task.project && (
                        <span className="px-1.5 py-0.2 rounded-sm bg-[#1c1e2c] text-gray-400">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="bg-[#161824] border border-[#252838] text-[11px] text-gray-300 rounded-md px-2 py-1 focus:outline-hidden"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {task.conversationId && (
                    <Link
                      href={`/conversations/${task.conversationId}${task.sourceMessage ? `?msg=${task.sourceMessage.id}` : ""}`}
                      className="px-2 py-1 rounded-md bg-[#191b28] hover:bg-indigo-600/20 text-indigo-400 text-[11px] flex items-center gap-1 border border-[#282a3c]"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#111218] border border-[#22242f] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#20222f]">
              <h3 className="font-semibold text-white text-sm">Create New Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Set up database migrations"
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add details..."
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Deadline (e.g. Thursday)</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="Thursday / Oct 10"
                    className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Assignee Name</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Project</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#20222f]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#272938] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-xs"
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
