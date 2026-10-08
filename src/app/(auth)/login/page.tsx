"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@echo.ai");
  const [password, setPassword] = useState("demouser123");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleTryDemo() {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error(data.error || "Demo initialization failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load demo");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111218] border border-[#22242f] rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              E
            </div>
            <span className="font-bold text-lg text-white">Echo</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Sign in to your workspace</h2>
          <p className="text-xs text-gray-400 mt-1">Turn conversations into structured action</p>
        </div>

        {/* 1-Click Demo Button */}
        <div className="mb-6">
          <button
            onClick={handleTryDemo}
            disabled={demoLoading}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/70 hover:to-purple-800/70 border border-indigo-500/40 text-xs font-semibold text-indigo-200 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>1-Click Try Demo (No signup required)</span>
              </>
            )}
          </button>
          <div className="relative my-6 text-center text-xs text-gray-500">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#22242f]" />
            </div>
            <span className="relative bg-[#111218] px-3">or continue with email</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 bg-[#161822] border border-[#262838] focus:border-indigo-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#161822] border border-[#262838] focus:border-indigo-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
