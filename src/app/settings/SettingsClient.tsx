"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  Users,
  Database,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export function SettingsClient({ user, workspace }: { user: any; workspace: any }) {
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleResetDemo() {
    if (!confirm("This will reload the realistic demo workspace with sprint sync conversation, tasks, and conflicts. Continue?")) return;
    setResetting(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      router.refresh();
      alert("Demo data reloaded successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  }

  async function handleDeleteWorkspace() {
    const confirmName = prompt(`Type "${workspace.name}" to permanently delete this workspace and all its data:`);
    if (confirmName !== workspace.name) {
      alert("Workspace name did not match. Deletion cancelled.");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/workspaces", { method: "DELETE" });
      if (res.ok) {
        router.push("/signup");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-[#1c1e28]">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Workspace Settings & Privacy</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage your workspace, data export options, and privacy controls.
        </p>
      </div>

      {/* Workspace Overview */}
      <div className="p-5 rounded-xl border border-[#22242f] bg-[#111218] space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Workspace Overview</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#141622] border border-[#242636]">
            <span className="text-gray-400 block text-[11px]">Workspace Name</span>
            <span className="font-semibold text-white mt-1 block truncate">{workspace.name}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#141622] border border-[#242636]">
            <span className="text-gray-400 block text-[11px]">Conversations</span>
            <span className="font-semibold text-white mt-1 block">{workspace._count.conversations}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#141622] border border-[#242636]">
            <span className="text-gray-400 block text-[11px]">Action Items</span>
            <span className="font-semibold text-white mt-1 block">{workspace._count.tasks}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#141622] border border-[#242636]">
            <span className="text-gray-400 block text-[11px]">Decisions</span>
            <span className="font-semibold text-white mt-1 block">{workspace._count.decisions}</span>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="p-5 rounded-xl border border-[#22242f] bg-[#111218] space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Workspace Members</span>
        </h2>

        <div className="divide-y divide-[#1e202d] text-xs">
          {workspace.members.map((m: any) => (
            <div key={m.id} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{m.user.name}</div>
                <div className="text-[11px] text-gray-500">{m.user.email}</div>
              </div>
              <span className="px-2 py-0.5 rounded-sm bg-[#181a26] text-gray-300 font-mono text-[10px] border border-[#27293a]">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="p-5 rounded-xl border border-[#22242f] bg-[#111218] space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export Workspace Intelligence</span>
        </h2>
        <p className="text-xs text-gray-400">
          Download your tasks, decisions, commitments, and conflict analyses at any time.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="/api/export?format=csv"
            download
            className="px-3.5 py-2 rounded-lg bg-[#151722] hover:bg-[#1a1d2c] border border-[#262838] text-xs text-white flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export as CSV</span>
          </a>
          <a
            href="/api/export?format=json"
            download
            className="px-3.5 py-2 rounded-lg bg-[#151722] hover:bg-[#1a1d2c] border border-[#262838] text-xs text-white flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export as JSON</span>
          </a>
          <a
            href="/api/export?format=markdown"
            download
            className="px-3.5 py-2 rounded-lg bg-[#151722] hover:bg-[#1a1d2c] border border-[#262838] text-xs text-white flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export as Markdown</span>
          </a>
        </div>
      </div>

      {/* Privacy & Security Disclosure */}
      <div className="p-5 rounded-xl border border-[#22242f] bg-[#111218] space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacy & AI Safety Architecture</span>
        </h2>
        <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
          <p>
            • <strong>Untrusted User Data Isolation:</strong> All conversation text is explicitly flagged as untrusted in AI system prompts. Text cannot inject system prompt overrides.
          </p>
          <p>
            • <strong>Strict Grounding:</strong> Ask Echo only answers from your indexed workspace data and will never hallucinate outside your records.
          </p>
          <p>
            • <strong>Full Cascading Deletion:</strong> When you delete a conversation, all generated tasks, decisions, commitments, and conflict analyses are deleted from the database.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-4">
        <h2 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Danger Zone</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div>
            <div className="text-xs font-medium text-white">Reset Demo Workspace</div>
            <div className="text-[11px] text-gray-400">
              Reload the 50+ message conversation, tasks, decisions, and conflicts.
            </div>
          </div>
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-3 py-1.5 rounded-lg bg-[#1c1e28] hover:bg-[#252838] text-xs text-gray-200 border border-[#2c2f42] flex items-center gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", resetting && "animate-spin")} />
            <span>Reload Demo</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-rose-900/30">
          <div>
            <div className="text-xs font-medium text-white">Delete Workspace</div>
            <div className="text-[11px] text-gray-400">
              Permanently delete this workspace and all associated conversation intelligence.
            </div>
          </div>
          <button
            onClick={handleDeleteWorkspace}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-xs"
          >
            {deleting ? "Deleting..." : "Delete Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
