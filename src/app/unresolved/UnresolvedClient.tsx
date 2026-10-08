"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, CheckCircle2, ExternalLink, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnresolvedItem {
  id: string;
  question: string;
  context?: string | null;
  participants?: string | null;
  status: string;
  resolutionNotes?: string | null;
  conversationId?: string | null;
  sourceMessage?: { id: string; orderIndex: number; speaker?: string | null; content: string } | null;
}

export function UnresolvedClient({ initialItems }: { initialItems: UnresolvedItem[] }) {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();

  async function resolveItem(id: string) {
    const notes = prompt("Enter resolution notes / outcome:") || "Resolved by team member.";
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "RESOLVED", resolutionNotes: notes } : i
      )
    );

    try {
      await fetch(`/api/unresolved/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", resolutionNotes: notes }),
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
            <span>Unresolved Questions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1e28] text-gray-400 font-mono">
              {items.length}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Open issues and questions raised in conversation that were never closed before the chat ended.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-[#22242f] bg-[#111218] p-8 text-gray-500 text-xs">
          No open questions detected. The team has resolved all discussion points.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[#22242f] bg-[#111218] hover:border-[#2f3242] transition-colors space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">{item.question}</h3>
                    {item.context && (
                      <p className="text-[11px] text-gray-400 mt-1">{item.context}</p>
                    )}
                  </div>
                </div>

                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-sm font-medium shrink-0",
                    item.status === "RESOLVED"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                      : "bg-purple-950 text-purple-300 border border-purple-800/40"
                  )}
                >
                  {item.status}
                </span>
              </div>

              {item.resolutionNotes && (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300">
                  <strong className="block mb-0.5">Resolution Notes:</strong>
                  {item.resolutionNotes}
                </div>
              )}

              <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px] text-gray-500">
                <div>
                  {item.status === "UNRESOLVED" ? (
                    <button
                      onClick={() => resolveItem(item.id)}
                      className="px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>

                {item.conversationId && (
                  <Link
                    href={`/conversations/${item.conversationId}${item.sourceMessage ? `?msg=${item.sourceMessage.id}` : ""}`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>Source #{item.sourceMessage?.orderIndex}</span>
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
