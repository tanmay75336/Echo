"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, ExternalLink, User, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommitmentItem {
  id: string;
  person: string;
  commitment: string;
  deadline?: string | null;
  status: string;
  confidence: number;
  sourceQuote?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number; speaker?: string | null; content: string } | null;
  project?: { id: string; name: string; color: string } | null;
}

export function CommitmentsClient({ initialCommitments }: { initialCommitments: CommitmentItem[] }) {
  const [commitments, setCommitments] = useState(initialCommitments);
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );

    try {
      await fetch(`/api/commitments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
            <span>Commitments Tracker</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1e28] text-gray-400 font-mono">
              {commitments.length}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Individual promises (&ldquo;I will do X&rdquo;) distinct from generic team suggestions.
          </p>
        </div>
      </div>

      {commitments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-[#22242f] bg-[#111218] p-8 text-gray-500 text-xs">
          No commitments found. Ingest a conversation where team members make personal delivery promises.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commitments.map((com) => (
            <div
              key={com.id}
              className="p-4 rounded-xl border border-[#22242f] bg-[#111218] hover:border-[#2f3242] transition-colors space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-[10px] flex items-center justify-center">
                    {com.person.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-200">{com.person}&apos;s Pledge</span>
                </div>

                <select
                  value={com.status}
                  onChange={(e) => updateStatus(com.id, e.target.value)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-medium border focus:outline-hidden",
                    com.status === "COMPLETED"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800/40"
                      : com.status === "BROKEN"
                      ? "bg-rose-950 text-rose-300 border-rose-800/40"
                      : "bg-amber-950 text-amber-300 border-amber-800/40"
                  )}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BROKEN">Broken / Delayed</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-[#141622] border border-[#242636] text-gray-200">
                &ldquo;{com.commitment}&rdquo;
              </div>

              {com.sourceQuote && (
                <div className="text-[11px] text-gray-400 italic">
                  &ldquo;{com.sourceQuote}&rdquo;
                </div>
              )}

              <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  {com.deadline ? (
                    <span className="text-amber-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {com.deadline}
                    </span>
                  ) : (
                    <span>No deadline mentioned</span>
                  )}
                </div>

                {com.conversationId && (
                  <Link
                    href={`/conversations/${com.conversationId}${com.sourceMessage ? `?msg=${com.sourceMessage.id}` : ""}`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>Source #{com.sourceMessage?.orderIndex}</span>
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
