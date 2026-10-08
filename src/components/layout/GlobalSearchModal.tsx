"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, CheckSquare, Compass, AlertCircle, HelpCircle, MessageSquare, Folder, ArrowRight, Loader2 } from "lucide-react";

interface SearchResult {
  tasks: Array<{ id: string; title: string; status: string; priority: string }>;
  decisions: Array<{ id: string; title: string; decision: string; status: string }>;
  commitments: Array<{ id: string; person: string; commitment: string; status: string }>;
  conversations: Array<{ id: string; title: string }>;
  messages: Array<{ id: string; content: string; speaker?: string; conversation: { id: string; title: string } }>;
  projects: Array<{ id: string; name: string }>;
}

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard shortcut Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  function navigateTo(url: string) {
    onClose();
    router.push(url);
  }

  const hasAnyResults =
    results &&
    (results.tasks.length > 0 ||
      results.decisions.length > 0 ||
      results.commitments.length > 0 ||
      results.conversations.length > 0 ||
      results.messages.length > 0 ||
      results.projects.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-[#111218] border border-[#22242f] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#22242f] gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, decisions, commitments, messages, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-hidden"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-gray-500 text-sm">
              Type at least 2 characters to search across your workspace intelligence.
            </div>
          )}

          {query && !loading && !hasAnyResults && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No matching records found for &ldquo;<span className="text-gray-200">{query}</span>&rdquo;.
            </div>
          )}

          {results?.tasks && results.tasks.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Tasks
              </div>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigateTo("/tasks")}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#161822] hover:bg-[#1f2230] border border-[#22242f] text-sm flex items-center justify-between group transition-colors"
                  >
                    <span className="text-gray-200 truncate">{t.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 shrink-0 ml-2">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.decisions && results.decisions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> Decisions
              </div>
              <div className="space-y-1">
                {results.decisions.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigateTo("/decisions")}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#161822] hover:bg-[#1f2230] border border-[#22242f] text-sm flex items-center justify-between group transition-colors"
                  >
                    <span className="text-gray-200 truncate">{d.decision}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 shrink-0 ml-2">
                      {d.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.commitments && results.commitments.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Commitments
              </div>
              <div className="space-y-1">
                {results.commitments.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigateTo("/commitments")}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#161822] hover:bg-[#1f2230] border border-[#22242f] text-sm flex items-center justify-between group transition-colors"
                  >
                    <span className="text-gray-200 truncate">
                      <strong className="text-amber-400 font-medium">{c.person}:</strong> {c.commitment}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/40 shrink-0 ml-2">
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.conversations && results.conversations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Conversations
              </div>
              <div className="space-y-1">
                {results.conversations.map((cv) => (
                  <button
                    key={cv.id}
                    onClick={() => navigateTo(`/conversations/${cv.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#161822] hover:bg-[#1f2230] border border-[#22242f] text-sm flex items-center justify-between group transition-colors"
                  >
                    <span className="text-gray-200 truncate">{cv.title}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.projects && results.projects.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-purple-400" /> Projects
              </div>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/projects/${p.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#161822] hover:bg-[#1f2230] border border-[#22242f] text-sm flex items-center justify-between group transition-colors"
                  >
                    <span className="text-gray-200 truncate">{p.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#22242f] bg-[#0c0d12] flex items-center justify-between text-xs text-gray-500">
          <span>Search indexed across all workspace data</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
