"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConflictItem {
  id: string;
  description: string;
  involvedPeople: string;
  severity: string;
  evidence: string;
  status: string;
  confidence: number;
  conversationId?: string | null;
  conversation?: { id: string; title: string } | null;
}

export function ConflictsClient({ initialConflicts }: { initialConflicts: ConflictItem[] }) {
  const [conflicts, setConflicts] = useState(initialConflicts);
  const router = useRouter();

  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "RESOLVED" : "ACTIVE";
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );

    try {
      await fetch(`/api/conflicts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Contradiction & Conflict Detection</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono border border-amber-800/40">
              {conflicts.filter((c) => c.status === "ACTIVE").length} Active
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Cross-message promise discrepancies, timeline contradictions, and architectural disagreements.
          </p>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-[#22242f] bg-[#111218] p-8 text-gray-500 text-xs">
          No conflicts or contradictions detected across your workspace conversations.
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conf) => (
            <div
              key={conf.id}
              className={cn(
                "p-5 rounded-xl border transition-colors space-y-3 text-xs",
                conf.status === "ACTIVE"
                  ? "border-amber-800/50 bg-amber-950/20"
                  : "border-[#22242f] bg-[#111218] opacity-75"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "w-4 h-4",
                      conf.status === "ACTIVE" ? "text-amber-400" : "text-gray-500"
                    )}
                  />
                  <span className="font-semibold text-sm text-white">
                    {conf.severity} Severity Possible Conflict
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-sm font-medium",
                      conf.status === "ACTIVE"
                        ? "bg-amber-900/40 text-amber-300 border border-amber-800/40"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                    )}
                  >
                    {conf.status}
                  </span>

                  <button
                    onClick={() => toggleStatus(conf.id, conf.status)}
                    className="px-2.5 py-1 rounded-md bg-[#181a26] hover:bg-[#202334] text-gray-300 border border-[#292c3e] text-[11px]"
                  >
                    {conf.status === "ACTIVE" ? "Mark as Resolved" : "Re-open"}
                  </button>
                </div>
              </div>

              <p className="text-gray-200 font-medium text-xs leading-relaxed">
                {conf.description}
              </p>

              {/* Side-by-Side Evidence Box */}
              <div className="p-3.5 rounded-lg bg-[#111218] border border-amber-900/40 text-[11px] text-gray-300 font-mono leading-relaxed space-y-1">
                <strong className="text-amber-400 font-sans block mb-1">
                  Extracted Evidence:
                </strong>
                {conf.evidence}
              </div>

              <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px] text-gray-500">
                <div>
                  Involved: <strong className="text-gray-300">{conf.involvedPeople}</strong>
                </div>

                {conf.conversation && (
                  <Link
                    href={`/conversations/${conf.conversation.id}`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>View Conversation</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
