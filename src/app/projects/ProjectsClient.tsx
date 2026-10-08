"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, X, ArrowRight, ShieldCheck, CheckSquare, MessagesSquare, Compass } from "lucide-react";
import { ProjectHealthResult } from "@/lib/health/calculator";
import { cn } from "@/lib/utils";

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  status: string;
  conversationCount: number;
  decisionCount: number;
  tasks: any[];
  health: ProjectHealthResult;
}

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Projects & Health</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1e28] text-gray-400 font-mono">
              {projects.length}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Organize conversations and track deterministic health scores across initiatives.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-[#22242f] bg-[#111218] p-8 text-gray-500 text-xs">
          No projects yet. Create a project to categorize conversations and monitor execution health.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const score = p.health.score;
            const completedCount = p.tasks.filter((t) => t.status === "DONE").length;

            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group p-5 rounded-xl border border-[#22242f] bg-[#111218] hover:border-indigo-500/40 hover:bg-[#13151f] transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-md"
                        style={{ backgroundColor: p.color }}
                      />
                      <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
                        {p.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      <span
                        className={cn(
                          score < 60
                            ? "text-rose-400"
                            : score < 80
                            ? "text-amber-400"
                            : "text-emerald-400"
                        )}
                      >
                        {score}%
                      </span>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                  )}

                  {/* Health Bar */}
                  <div className="w-full h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        score < 60 ? "bg-rose-500" : score < 80 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  {/* Top health note */}
                  <div className="text-[11px] text-gray-400 truncate">
                    {p.health.reasons[0]?.message || "Healthy status"}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e202b] flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-indigo-400" />
                      <span>
                        {completedCount}/{p.tasks.length} tasks
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessagesSquare className="w-3 h-3 text-blue-400" />
                      <span>{p.conversationCount}</span>
                    </span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#111218] border border-[#22242f] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#20222f]">
              <h3 className="font-semibold text-white text-sm">Create Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Echo Core Engine, Mobile Redesign"
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals and deliverables..."
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Badge Color</label>
                <div className="flex items-center gap-2">
                  {["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full transition-transform",
                        color === c && "ring-2 ring-white scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
