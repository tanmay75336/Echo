"use client";

import { useState, useEffect } from "react";
import { Bot, Send, Sparkles, User, ExternalLink, Loader2, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "echo";
  text: string;
  citations?: string[];
  provider?: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  "What did we decide about the database?",
  "Who is responsible for the backend?",
  "What tasks are due this week?",
  "Which commitments were made?",
  "What questions remain unresolved?",
  "Show me detected conflicts and risks",
];

export function AskEchoClient({
  initialQuestion,
  workspaceName,
}: {
  initialQuestion?: string;
  workspaceName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      sender: "echo",
      text: `Hello! I am your Echo Workspace Copilot. I answer questions strictly and exclusively from your "${workspaceName}" conversations, tasks, decisions, commitments, and conflict records.`,
      timestamp: "Just now",
    },
  ]);
  const [query, setQuery] = useState(initialQuestion || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      handleAsk(initialQuestion);
    }
  }, [initialQuestion]);

  async function handleAsk(questionText: string) {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();

      const echoMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: "echo",
        text: data.answer || "No response received.",
        citations: data.citations || [],
        provider: data.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, echoMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "echo",
          text: "I encountered an error querying your workspace data. Please verify your connection and try again.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1c1e28]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>Ask Echo</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Strictly grounded in your workspace intelligence. Never hallucinates outside your data.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-[11px] text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Grounded in {workspaceName}</span>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
        <span className="text-gray-500 text-[11px] shrink-0">Suggestions:</span>
        {PRESET_QUERIES.map((pq, i) => (
          <button
            key={i}
            onClick={() => handleAsk(pq)}
            className="px-2.5 py-1 rounded-lg bg-[#141622] hover:bg-[#1a1d2c] border border-[#242636] text-[11px] text-gray-300 hover:text-white shrink-0 transition-colors"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#22242f] bg-[#0c0d13] p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-3 text-xs max-w-2xl",
              m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-medium text-xs",
                m.sender === "user" ? "bg-indigo-600" : "bg-purple-700 shadow-sm"
              )}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={cn(
                "p-4 rounded-2xl space-y-2 leading-relaxed shadow-sm",
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-xs"
                  : "bg-[#141622] border border-[#242636] text-gray-200 rounded-tl-xs"
              )}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Citations pill list */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-[#222536] space-y-1">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">
                    Workspace Citations:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.citations.map((cite, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-sm bg-[#1a1d2c] border border-indigo-500/30 text-[10px] text-indigo-300 font-mono"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1">
                <span>{m.timestamp}</span>
                {m.provider && (
                  <span className="font-mono text-[9px] text-gray-500">{m.provider}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 text-xs max-w-md mr-auto">
            <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#141622] border border-[#242636] text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Scanning workspace data and formulating answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(query);
        }}
        className="flex items-center gap-2 p-2 rounded-xl bg-[#12131b] border border-[#22242f]"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your workspace decisions, owners, or tasks..."
          className="flex-1 px-3 py-2 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
