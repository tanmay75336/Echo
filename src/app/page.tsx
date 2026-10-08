"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Compass,
  MessageSquare,
  ShieldCheck,
  Search,
  Bot,
  Zap,
  Loader2,
} from "lucide-react";

export default function LandingPage() {
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();

  async function handleTryDemo() {
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f5] flex flex-col selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#1e202b] px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-[#090a0f]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            E
          </div>
          <span className="font-semibold text-base tracking-tight text-white">Echo</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTryDemo}
            disabled={demoLoading}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#272938] hover:border-gray-600 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
            <span>Live Demo</span>
          </button>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verifiable AI Conversation Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.15]">
          Your conversations are full of decisions.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
            Echo turns them into action.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
          AI that finds what was promised, decided, assigned, and left unresolved — directly
          from your WhatsApp, Slack, Zoom transcripts, and team chats.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleTryDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-sm text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Try Demo Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#272938] hover:border-gray-500 bg-[#12131b] hover:bg-[#181a24] font-medium text-sm text-gray-200 transition-colors"
          >
            Create Free Account
          </Link>
        </div>

        {/* Transformation Showcase (Left: Raw Messy Chat -> Right: Structured Action Board) */}
        <div className="mt-16 w-full rounded-2xl border border-[#22242f] bg-[#0e1017] p-4 sm:p-6 shadow-2xl text-left overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#22242f] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-500">interactive_transformation_preview</span>
            </div>
            <span className="text-xs text-indigo-400 font-medium">Automatic Source Traceability</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Raw Conversation */}
            <div className="rounded-xl bg-[#141620] border border-[#262838] p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Messy Human Conversation (Slack / WhatsApp)
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div className="p-2 rounded-md bg-[#191b26] border border-[#272938]">
                    <span className="text-indigo-400 font-semibold">[09:43 AM] Rahul:</span> Agreed. Let&apos;s use PostgreSQL for our production database with Prisma ORM because of the strict relational model.
                  </div>
                  <div className="p-2 rounded-md bg-[#191b26] border border-[#272938]">
                    <span className="text-indigo-400 font-semibold">[09:45 AM] Rahul:</span> I will finish the backend auth and ingestion API by Wednesday.
                  </div>
                  <div className="p-2 rounded-md bg-[#191b26] border border-[#272938]">
                    <span className="text-purple-400 font-semibold">[09:54 AM] Amit:</span> I&apos;ll prepare the PPT and slide deck by Thursday afternoon.
                  </div>
                  <div className="p-2 rounded-md bg-[#191b26] border border-amber-900/40 bg-amber-950/20">
                    <span className="text-amber-400 font-semibold">[02:15 PM] Rahul:</span> Heads up team — I have family visiting unexpectedly and won&apos;t be available until Friday.
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#22242f] text-[11px] text-gray-500">
                Parsed 4 messages · 2 participants detected
              </div>
            </div>

            {/* Right: Extracted Intelligence */}
            <div className="rounded-xl bg-[#141620] border border-[#262838] p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Echo Extracted Action Intelligence
                </div>
                <div className="space-y-2.5">
                  {/* Decision */}
                  <div className="p-2.5 rounded-lg bg-[#181a24] border border-[#282a3a] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" /> Decision Confirmed
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        PostgreSQL + Prisma
                      </span>
                    </div>
                    <p className="text-gray-300 mt-1">Adopt PostgreSQL for relational mappings and foreign-key source traceability.</p>
                  </div>

                  {/* Task */}
                  <div className="p-2.5 rounded-lg bg-[#181a24] border border-[#282a3a] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Action Item
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">Due: Thursday</span>
                    </div>
                    <p className="text-gray-300 mt-1 font-medium">Prepare PPT investor presentation and slide deck</p>
                    <div className="text-[11px] text-gray-400 mt-1">Assigned: <strong className="text-gray-200">Amit</strong> · Source: Message #3</div>
                  </div>

                  {/* Contradiction alert */}
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Possible Conflict Detected
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-900/40 text-amber-300">
                        High Severity
                      </span>
                    </div>
                    <p className="text-amber-200/90 mt-1 text-[11px]">
                      Rahul committed to delivering backend by Wednesday (Msg #2), but later indicated unavailability until Friday (Msg #4).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#22242f] flex items-center justify-between text-[11px] text-gray-500">
                <span>100% Verifiable Source Traceability</span>
                <span className="text-indigo-400">Clicking any item scrolls to source</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-xl border border-[#22242f] bg-[#111218]">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Source Traceability</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Every extracted task, decision, and commitment links to the exact message and speaker from which it was derived. Never wonder why a task exists.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#22242f] bg-[#111218]">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Contradiction Detection</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Surface conflicting commitments and changing dates before they cause project failures. Echo compares promises across messages automatically.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#22242f] bg-[#111218]">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Grounded Ask Echo</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Ask questions directly about your workspace decisions, owners, and unresolved questions. Echo answers only from verified workspace data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e202b] py-8 px-6 text-center text-xs text-gray-500">
        <p>Echo — Turn conversations into action. Built for high-velocity software and product teams.</p>
      </footer>
    </div>
  );
}
