"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckSquare,
  Compass,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  ExternalLink,
  RefreshCw,
  Download,
  CheckCircle2,
  Circle,
  FileText,
  User,
  Clock,
  ChevronRight,
  Layers,
  Tag,
  Loader2,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface ConversationViewerClientProps {
  conversation: any;
  initialTargetMessageId?: string;
}

export function ConversationViewerClient({
  conversation,
  initialTargetMessageId,
}: ConversationViewerClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "decisions" | "commitments" | "unresolved" | "conflicts"
  >("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(
    initialTargetMessageId || null
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"chat" | "intelligence">("chat");

  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const router = useRouter();

  // Scroll to and highlight message
  function scrollToMessage(messageId: string) {
    setHighlightedMessageId(messageId);
    setMobilePanel("chat");

    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  useEffect(() => {
    if (initialTargetMessageId) {
      setTimeout(() => scrollToMessage(initialTargetMessageId), 300);
    }
  }, [initialTargetMessageId]);

  async function handleReanalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to re-analyze", err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function resolveUnresolved(itemId: string) {
    const notes = prompt("Enter resolution notes (optional):") || "Resolved by team member.";
    try {
      await fetch(`/api/unresolved/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", resolutionNotes: notes }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const latestAnalysis = conversation.analyses?.[0];
  const parsedTopics: string[] = latestAnalysis?.keyTopics
    ? JSON.parse(latestAnalysis.keyTopics)
    : [];

  const filteredMessages = conversation.messages.filter((m: any) =>
    searchQuery
      ? m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.speaker?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Group participants and count their messages
  const participantCounts = conversation.messages.reduce(
    (acc: Record<string, number>, m: any) => {
      const sp = m.speaker || "Unknown";
      acc[sp] = (acc[sp] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f212d] gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/conversations"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1c26] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate flex items-center gap-2">
              <span>{conversation.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#181a24] text-gray-400 font-mono border border-[#27293a]">
                {conversation.sourceFormat}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden bg-[#141622] rounded-lg p-0.5 border border-[#22242f]">
            <button
              onClick={() => setMobilePanel("chat")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                mobilePanel === "chat" ? "bg-indigo-600 text-white" : "text-gray-400"
              )}
            >
              Messages
            </button>
            <button
              onClick={() => setMobilePanel("intelligence")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                mobilePanel === "intelligence" ? "bg-indigo-600 text-white" : "text-gray-400"
              )}
            >
              Intelligence
            </button>
          </div>

          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1b1e2c] border border-[#262838] text-xs font-medium text-gray-200 transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3 text-indigo-400", analyzing && "animate-spin")} />
            <span className="hidden sm:inline">Re-run Analysis</span>
          </button>

          <a
            href={`/api/export?format=markdown&conversationId=${conversation.id}`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1b1e2c] border border-[#262838] text-xs font-medium text-gray-200 transition-colors"
          >
            <Download className="w-3 h-3 text-gray-400" />
            <span className="hidden sm:inline">Export</span>
          </a>
        </div>
      </div>

      {/* Main Three-Panel Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 overflow-hidden">
        {/* Left Column (Desktop 3 Cols): Conversation Metadata & Participants */}
        <div className="hidden lg:flex lg:col-span-3 flex-col rounded-xl border border-[#22242f] bg-[#101118] overflow-hidden">
          <div className="p-4 border-b border-[#20222f] bg-[#0d0e15]">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Metadata & Participants
            </div>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-gray-200 font-mono">{formatDate(conversation.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-gray-200 font-mono">{conversation.sourceFormat}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Messages:</span>
                <span className="text-gray-200 font-mono">{conversation.messages.length}</span>
              </div>
              {conversation.project && (
                <div className="flex justify-between">
                  <span>Project:</span>
                  <span className="text-indigo-400 font-medium">{conversation.project.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Participants list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Active Speakers ({Object.keys(participantCounts).length})
            </div>
            <div className="space-y-1.5">
              {Object.entries(participantCounts).map(([speaker, count]) => (
                <div
                  key={speaker}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#141620] border border-[#232535] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 font-medium text-[10px] flex items-center justify-center">
                      {speaker.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-200">{speaker}</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-500">{String(count)} msgs</span>
                </div>
              ))}
            </div>

            {/* Entities extracted */}
            {conversation.entities?.length > 0 && (
              <div className="pt-3 border-t border-[#1f212e] space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-indigo-400" />
                  <span>Key Entities & Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {conversation.entities.map((ent: any) => (
                    <span
                      key={ent.id}
                      className="px-2 py-0.5 rounded-sm bg-[#161824] border border-[#26283a] text-[10px] text-gray-300 font-mono"
                      title={ent.metadata || ent.type}
                    >
                      {ent.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column (Desktop 5-6 Cols): Conversation Messages Timeline */}
        <div
          className={cn(
            "flex flex-col rounded-xl border border-[#22242f] bg-[#0e0f16] overflow-hidden",
            mobilePanel === "chat" ? "col-span-1 lg:col-span-5" : "hidden lg:flex lg:col-span-5"
          )}
        >
          {/* Messages Search Bar */}
          <div className="p-3 border-b border-[#20222f] bg-[#0c0d13] flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search messages in this conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#141622] border border-[#242636] focus:border-indigo-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>
            <span className="text-[11px] font-mono text-gray-500 shrink-0">
              {filteredMessages.length} msgs
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMessages.map((msg: any) => {
              const isHighlighted = highlightedMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  ref={(el) => {
                    messageRefs.current[msg.id] = el;
                  }}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-xs space-y-1.5",
                    isHighlighted
                      ? "highlight-source-active border-indigo-500 bg-indigo-950/30"
                      : "border-[#1e202b] bg-[#12131b] hover:border-[#2b2d3d]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-500 font-semibold">
                        #{msg.orderIndex}
                      </span>
                      <span className="font-semibold text-indigo-300">
                        {msg.speaker || "Participant"}
                      </span>
                    </div>

                    {msg.timestamp && (
                      <span className="font-mono text-[10px] text-gray-500">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Desktop 4 Cols): AI Extracted Action Intelligence Panel */}
        <div
          className={cn(
            "flex flex-col rounded-xl border border-[#22242f] bg-[#101118] overflow-hidden",
            mobilePanel === "intelligence"
              ? "col-span-1 lg:col-span-4"
              : "hidden lg:flex lg:col-span-4"
          )}
        >
          {/* Intelligence Tabs Header */}
          <div className="flex items-center border-b border-[#20222f] bg-[#0c0d13] p-1.5 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0",
                activeTab === "overview"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1",
                activeTab === "tasks"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <span>Tasks</span>
              <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
                {conversation.tasks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("decisions")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1",
                activeTab === "decisions"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <span>Decisions</span>
              <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
                {conversation.decisions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("commitments")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1",
                activeTab === "commitments"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <span>Commitments</span>
              <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
                {conversation.commitments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("unresolved")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1",
                activeTab === "unresolved"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono px-1 rounded-sm bg-[#1c1e2c]">
                {conversation.unresolvedItems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("conflicts")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1",
                activeTab === "conflicts"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : conversation.conflicts.length > 0
                  ? "text-amber-400"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <span>Conflicts</span>
              {conversation.conflicts.length > 0 && (
                <span className="text-[10px] font-mono px-1 rounded-sm bg-amber-950 text-amber-300 border border-amber-800/40">
                  {conversation.conflicts.length}
                </span>
              )}
            </button>
          </div>

          {/* Intelligence Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-4 text-xs">
                {latestAnalysis ? (
                  <>
                    <div className="p-3.5 rounded-xl bg-[#141622] border border-[#22242f] space-y-2">
                      <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Executive Summary</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {latestAnalysis.summary}
                      </p>
                    </div>

                    {latestAnalysis.projectStatus && (
                      <div className="p-3.5 rounded-xl bg-[#141622] border border-[#22242f] space-y-2">
                        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Trajectory & Project Status</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {latestAnalysis.projectStatus}
                        </p>
                      </div>
                    )}

                    {parsedTopics.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#141622] border border-[#22242f] space-y-2">
                        <div className="font-semibold text-gray-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-400" />
                          <span>Key Discussion Themes</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedTopics.map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-md bg-[#191b28] border border-[#292c3e] text-gray-300 text-[11px]"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No analysis generated yet. Click Re-run Analysis to process.
                  </div>
                )}
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div className="space-y-3">
                {conversation.tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No tasks identified in this conversation.
                  </div>
                ) : (
                  conversation.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-[#13151f] border border-[#222432] space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTask(task.id, task.status)}
                            className="mt-0.5 text-gray-400 hover:text-indigo-400 shrink-0"
                          >
                            {task.status === "DONE" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <h4
                              className={cn(
                                "font-medium text-white",
                                task.status === "DONE" && "line-through text-gray-500"
                              )}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-sm shrink-0 font-medium",
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

                      {/* Meta info & Source Traceability Button */}
                      <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-2">
                          {task.assignees.length > 0 && (
                            <span>
                              Assignee: <strong className="text-gray-300">{task.assignees[0].name}</strong>
                            </span>
                          )}
                          {task.deadline && (
                            <span className="text-amber-400 font-mono">
                              Due: {task.deadline}
                            </span>
                          )}
                        </div>

                        {task.sourceMessage && (
                          <button
                            onClick={() => scrollToMessage(task.sourceMessage.id)}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            <span>Source #{task.sourceMessage.orderIndex}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DECISIONS TAB */}
            {activeTab === "decisions" && (
              <div className="space-y-3">
                {conversation.decisions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No decisions extracted from this conversation.
                  </div>
                ) : (
                  conversation.decisions.map((dec: any) => (
                    <div
                      key={dec.id}
                      className="p-3 rounded-xl bg-[#13151f] border border-[#222432] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-200">{dec.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          {dec.status}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#181a26] border border-[#25283a] text-gray-200 text-xs font-medium">
                        {dec.decision}
                      </div>

                      {dec.reason && (
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          <strong className="text-gray-300">Reason:</strong> {dec.reason}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px] text-gray-500">
                        <span>Participants: {dec.participants || "Team"}</span>
                        {dec.sourceMessage && (
                          <button
                            onClick={() => scrollToMessage(dec.sourceMessage.id)}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            <span>Source #{dec.sourceMessage.orderIndex}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* COMMITMENTS TAB */}
            {activeTab === "commitments" && (
              <div className="space-y-3">
                {conversation.commitments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No individual commitments found.
                  </div>
                ) : (
                  conversation.commitments.map((com: any) => (
                    <div
                      key={com.id}
                      className="p-3 rounded-xl bg-[#13151f] border border-[#222432] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-400">
                          {com.person}&apos;s Pledge
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-950 text-amber-300 border border-amber-800/40">
                          {com.status}
                        </span>
                      </div>

                      <p className="text-gray-200">&ldquo;{com.commitment}&rdquo;</p>

                      <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px] text-gray-500">
                        {com.deadline ? (
                          <span className="text-amber-400 font-mono">Due: {com.deadline}</span>
                        ) : (
                          <span>No deadline specified</span>
                        )}
                        {com.sourceMessage && (
                          <button
                            onClick={() => scrollToMessage(com.sourceMessage.id)}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            <span>Source #{com.sourceMessage.orderIndex}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* UNRESOLVED ITEMS TAB */}
            {activeTab === "unresolved" && (
              <div className="space-y-3">
                {conversation.unresolvedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    All items in this conversation are resolved.
                  </div>
                ) : (
                  conversation.unresolvedItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#13151f] border border-[#222432] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-purple-300 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Open Question</span>
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-sm",
                            item.status === "RESOLVED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                              : "bg-purple-950 text-purple-300 border border-purple-800/40"
                          )}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="font-medium text-gray-200">{item.question}</p>

                      {item.resolutionNotes && (
                        <p className="text-[11px] text-emerald-400/90 bg-emerald-950/20 p-2 rounded-md border border-emerald-900/30">
                          <strong>Resolution:</strong> {item.resolutionNotes}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1e202d] flex items-center justify-between text-[11px]">
                        {item.status === "UNRESOLVED" ? (
                          <button
                            onClick={() => resolveUnresolved(item.id)}
                            className="px-2 py-0.5 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span className="text-gray-500">Resolved</span>
                        )}

                        {item.sourceMessage && (
                          <button
                            onClick={() => scrollToMessage(item.sourceMessage.id)}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            <span>Source #{item.sourceMessage.orderIndex}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CONFLICTS TAB */}
            {activeTab === "conflicts" && (
              <div className="space-y-3">
                {conversation.conflicts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No contradictions or timeline conflicts detected.
                  </div>
                ) : (
                  conversation.conflicts.map((conf: any) => (
                    <div
                      key={conf.id}
                      className="p-3.5 rounded-xl border border-amber-800/40 bg-amber-950/20 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{conf.severity} Severity Contradiction</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-900/40 text-amber-200">
                          {conf.status}
                        </span>
                      </div>

                      <p className="text-gray-200 font-medium">{conf.description}</p>

                      <div className="p-2.5 rounded-lg bg-[#14151e] border border-amber-800/30 text-[11px] text-gray-300 font-mono leading-relaxed">
                        <strong className="text-amber-400 font-sans block mb-1">Evidence Comparison:</strong>
                        {conf.evidence}
                      </div>

                      <div className="text-[11px] text-gray-500">
                        Involved: <strong className="text-gray-400">{conf.involvedPeople}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
