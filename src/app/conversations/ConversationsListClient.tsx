"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessagesSquare,
  FileUp,
  Search,
  Trash2,
  CheckSquare,
  Compass,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ConversationItem {
  id: string;
  title: string;
  sourceFormat: string;
  participantCount: number;
  messageCount: number;
  status: string;
  createdAt: Date | string;
  project?: { id: string; name: string; color: string } | null;
  _count: {
    messages: number;
    tasks: number;
    decisions: number;
    commitments: number;
    unresolvedItems: number;
    conflicts: number;
  };
}

export function ConversationsListClient({
  initialConversations,
}: {
  initialConversations: ConversationItem[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [search, setSearch] = useState("");
  const router = useRouter();

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation and all its extracted intelligence?")) return;

    setConversations((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  }

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.project?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Conversations</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1e28] text-gray-400 font-mono">
              {conversations.length}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            All ingested chats, transcripts, and verified action boards.
          </p>
        </div>

        <Link
          href="/conversations/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors"
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>Ingest New Conversation</span>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#12131b] border border-[#22242f] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Conversations Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-[#22242f] bg-[#111218] p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">No conversations found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Ingest your first conversation from WhatsApp, Slack, or transcripts to see Echo&apos;s action intelligence.
            </p>
          </div>
          <Link
            href="/conversations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white shadow-xs"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Ingest Conversation</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/conversations/${c.id}`}
              className="group p-5 rounded-xl border border-[#22242f] bg-[#111218] hover:border-indigo-500/40 hover:bg-[#13151f] transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#1a1c26] text-gray-400 font-mono uppercase tracking-wider border border-[#262838]">
                    {c.sourceFormat}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.project && (
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#1e202e] text-indigo-300 font-medium">
                        {c.project.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      title="Delete conversation"
                      className="text-gray-500 hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {c.title}
                </h3>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(c.createdAt)}</span>
                  <span>·</span>
                  <span>{c.participantCount} participants</span>
                  <span>·</span>
                  <span>{c._count.messages} messages</span>
                </div>
              </div>

              {/* Action Intelligence Badges */}
              <div className="pt-3 border-t border-[#1e202b] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-gray-400 text-[11px]">
                  <span className="flex items-center gap-1" title="Extracted Tasks">
                    <CheckSquare className="w-3 h-3 text-indigo-400" />
                    <span>{c._count.tasks}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Extracted Decisions">
                    <Compass className="w-3 h-3 text-emerald-400" />
                    <span>{c._count.decisions}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Extracted Commitments">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>{c._count.commitments}</span>
                  </span>
                  {c._count.conflicts > 0 && (
                    <span className="flex items-center gap-1 text-rose-400" title="Detected Contradictions">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{c._count.conflicts}</span>
                    </span>
                  )}
                </div>

                <div className="text-gray-500 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
