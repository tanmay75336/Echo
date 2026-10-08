"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileUp,
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { detectFormat, ConversationSourceFormat } from "@/lib/parsing";
import { getDemoConversationText } from "@/lib/demo/seedData";
import { cn } from "@/lib/utils";

interface IngestConversationClientProps {
  projects: Array<{ id: string; name: string }>;
}

const STEPS = [
  { id: 1, label: "Reading conversation..." },
  { id: 2, label: "Identifying participants..." },
  { id: 3, label: "Extracting tasks..." },
  { id: 4, label: "Finding decisions..." },
  { id: 5, label: "Checking unresolved items..." },
  { id: 6, label: "Building action board..." },
];

export function IngestConversationClient({ projects }: IngestConversationClientProps) {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [detectedFormat, setDetectedFormat] = useState<ConversationSourceFormat>("TEXT");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  function handleTextChange(text: string) {
    setRawText(text);
    if (text.trim().length > 10) {
      setDetectedFormat(detectFormat(text));
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  }

  function handleLoadSample() {
    setTitle("Sprint 1 — Architecture & Core Ingestion");
    const sample = getDemoConversationText();
    handleTextChange(sample);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim() || !title.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentStep(1);

    // Step animation interval to show progress as analysis runs
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          rawText,
          projectId: projectId || null,
          runAnalysisImmediately: true,
        }),
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze conversation");
      }

      setCurrentStep(6);
      setTimeout(() => {
        router.push(`/conversations/${data.conversationId}`);
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setLoading(false);
      setCurrentStep(0);
      setError(
        err instanceof Error
          ? err.message
          : "AI analysis is temporarily unavailable. Your conversation is preserved. Please try again."
      );
    }
  }

  const lineCount = rawText ? rawText.split("\n").length : 0;
  const charCount = rawText ? rawText.length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <FileUp className="w-4 h-4" />
          <span>Ingest & Extract</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Analyze Conversation
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Paste or upload exports from WhatsApp, Slack, Discord, Telegram, or meeting transcripts.
        </p>
      </div>

      {/* Processing State Modal / Overlay */}
      {loading && (
        <div className="rounded-2xl border border-indigo-500/30 bg-[#12131d] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-white">Analyzing Conversation</h2>
            <p className="text-xs text-gray-400">
              Echo is structuring action items, decisions, commitments, and conflict signals...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3 pt-2">
            {STEPS.map((step) => {
              const isDone = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 text-xs p-2.5 rounded-lg transition-all",
                    isCurrent
                      ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 font-medium"
                      : isDone
                      ? "text-gray-400"
                      : "text-gray-600"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-700 shrink-0 flex items-center justify-center text-[10px]">
                      {step.id}
                    </div>
                  )}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Form */}
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start justify-between gap-3 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="submit"
                className="underline hover:text-white shrink-0 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* Top Controls: Title, Project, Sample loader */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Conversation Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sprint 1 Planning, Architecture Review, Client Call"
                className="w-full px-3.5 py-2.5 bg-[#141622] border border-[#22242f] focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Assign to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141622] border border-[#22242f] focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-hidden"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Bar: File Upload & Sample Loader */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#111218] border border-[#22242f]">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#202334] border border-[#282a3c] text-xs font-medium text-gray-200 transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload File (.txt, .csv, transcript)</span>
                <input
                  type="file"
                  accept=".txt,.csv,.log,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#202334] border border-[#282a3c] text-xs font-medium text-indigo-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Load Sample Sync (50+ Msgs)</span>
              </button>
            </div>

            {/* Detected format pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Detected format:</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-mono text-[11px] font-semibold">
                {detectedFormat}
              </span>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Paste conversation text</span>
              <span className="font-mono text-[11px] text-gray-500">
                {lineCount} lines · {charCount} chars
              </span>
            </div>
            <textarea
              required
              rows={14}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste raw text here... Example:
[09:30 AM] Rahul: I'll finish backend Wednesday.
[09:35 AM] Tanmay: Great.
[09:40 AM] Amit: I'll prepare the PPT.
[02:15 PM] Rahul: Heads up, I won't be available until Friday."
              className="w-full p-4 bg-[#111218] border border-[#22242f] focus:border-indigo-500 rounded-xl text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-hidden leading-relaxed resize-y"
            />
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!rawText.trim() || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Conversation & Build Action Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
