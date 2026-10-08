"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  Plus,
  X,
  AlertCircle,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionItem {
  id: string;
  title: string;
  decision: string;
  description?: string | null;
  reason?: string | null;
  participants?: string | null;
  status: string;
  date?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number; speaker?: string | null; content: string } | null;
  project?: { id: string; name: string; color: string } | null;
}

export function DecisionsClient({ initialDecisions }: { initialDecisions: DecisionItem[] }) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New decision state
  const [newTitle, setNewTitle] = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newParticipants, setNewParticipants] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  async function updateStatus(id: string, newStatus: string) {
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );

    try {
      await fetch(`/api/decisions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDecision.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          decision: newDecision,
          reason: newReason || null,
          participants: newParticipants || null,
          status: "CONFIRMED",
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle("");
        setNewDecision("");
        setNewReason("");
        setNewParticipants("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  const filtered = decisions.filter((d) =>
    statusFilter === "ALL" ? true : d.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Decisions Ledger</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1e28] text-gray-400 font-mono">
              {decisions.length}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Architectural and product choices verified with team consensus and source links.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Decision</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {["ALL", "CONFIRMED", "PROPOSED", "OUTDATED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={cn(
              "px-3 py-1 rounded-md transition-colors text-xs font-medium",
              statusFilter === st
                ? "bg-indigo-600 text-white"
                : "bg-[#141622] text-gray-400 hover:text-white border border-[#22242f]"
            )}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Decisions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-[#22242f] bg-[#111218] p-8 text-gray-500 text-xs">
          No decisions matching this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dec) => (
            <div
              key={dec.id}
              className="p-4 rounded-xl border border-[#22242f] bg-[#111218] hover:border-[#2f3242] transition-colors space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h3 className="font-semibold text-sm text-white">{dec.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-sm font-medium",
                      dec.status === "CONFIRMED"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                        : dec.status === "OUTDATED"
                        ? "bg-gray-800 text-gray-400"
                        : "bg-indigo-950 text-indigo-300 border border-indigo-800/40"
                    )}
                  >
                    {dec.status}
                  </span>

                  <select
                    value={dec.status}
                    onChange={(e) => updateStatus(dec.id, e.target.value)}
                    className="bg-[#181a24] border border-[#272938] text-[10px] text-gray-300 rounded-md px-1.5 py-0.5 focus:outline-hidden"
                  >
                    <option value="CONFIRMED">Confirm</option>
                    <option value="PROPOSED">Proposed</option>
                    <option value="OUTDATED">Mark Outdated</option>
                  </select>
                </div>
              </div>

              {/* Decision Box */}
              <div className="p-3 rounded-lg bg-[#151722] border border-[#242636] text-gray-200 font-medium">
                {dec.decision}
              </div>

              {dec.reason && (
                <div className="text-[11px] text-gray-400">
                  <strong className="text-gray-300">Rationale / Reason:</strong> {dec.reason}
                </div>
              )}

              {/* Source & Participants */}
              <div className="pt-2 border-t border-[#1e202d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Participants: {dec.participants || "Team"}</span>
                </div>

                {dec.conversationId && (
                  <Link
                    href={`/conversations/${dec.conversationId}${dec.sourceMessage ? `?msg=${dec.sourceMessage.id}` : ""}`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>View Conversation Source</span>
                    {dec.sourceMessage && <span>#{dec.sourceMessage.orderIndex}</span>}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Decision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#111218] border border-[#22242f] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#20222f]">
              <h3 className="font-semibold text-white text-sm">Record Team Decision</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">Decision Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Database: PostgreSQL with Prisma"
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">What was decided?</label>
                <textarea
                  required
                  rows={2}
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  placeholder="State the decision clearly..."
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Reason / Context (Optional)</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Why this was chosen over alternatives"
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Participants (Optional)</label>
                <input
                  type="text"
                  value={newParticipants}
                  onChange={(e) => setNewParticipants(e.target.value)}
                  placeholder="e.g. Tanmay, Rahul, Amit"
                  className="w-full p-2.5 bg-[#161822] border border-[#242636] rounded-lg text-white focus:outline-hidden"
                />
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
                  {creating ? "Saving..." : "Record Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
