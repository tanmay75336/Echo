"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2, Lock, Mail, User, Building } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, workspaceName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration error");
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              E
            </div>
            <span className="font-bold text-lg text-white">Echo</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Create your workspace</h2>
          <p className="text-xs text-gray-400 mt-1">Start converting messy chats into verified action</p>
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
                <span>Skip signup: 1-Click Try Demo</span>
              </>
            )}
          </button>
          <div className="relative my-6 text-center text-xs text-gray-500">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#22242f]" />
            </div>
            <span className="relative bg-[#111218] px-3">or create new account</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Your Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tanmay"
                className="w-full pl-9 pr-3 py-2 bg-[#161822] border border-[#262838] focus:border-indigo-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanmay@company.com"
                className="w-full pl-9 pr-3 py-2 bg-[#161822] border border-[#262838] focus:border-indigo-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Workspace Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Acme Product Team"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-[#161822] border border-[#262838] focus:border-indigo-500 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account & Workspace"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
