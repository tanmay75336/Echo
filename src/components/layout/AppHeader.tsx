"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Search, LogOut, Menu, X, Bot, ShieldCheck, RefreshCw } from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface AppHeaderProps {
  user?: {
    name?: string;
    email?: string;
    currentWorkspace?: { name: string; slug: string };
  } | null;
  onToggleSidebar?: () => void;
}

export function AppHeader({ user, onToggleSidebar }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleResetDemo() {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <header className="h-14 border-b border-[#22242f] bg-[#0c0d13]/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand/Workspace */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1a1c25] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <span className="text-sm">E</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                Echo
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                  AI
                </span>
              </span>
            </div>
          </Link>

          {user?.currentWorkspace && (
            <div className="hidden sm:flex items-center pl-3 border-l border-[#22242f] text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              <span className="font-medium text-gray-300 truncate max-w-[140px]">
                {user.currentWorkspace.name}
              </span>
            </div>
          )}
        </div>

        {/* Center: Search trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#14161f] hover:bg-[#191c28] border border-[#22242f] text-xs text-gray-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search workspace, tasks, decisions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded-sm bg-[#22242f] text-[10px] text-gray-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2">
          {/* Ask Echo quick link */}
          <Link
            href="/ask"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Ask Echo</span>
          </Link>

          {/* Search on mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1c25] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Reset Demo button */}
          <button
            onClick={handleResetDemo}
            disabled={seeding}
            title="Reload Demo Data"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#1a1c25] border border-transparent hover:border-[#22242f] transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${seeding ? "animate-spin text-indigo-400" : ""}`} />
            <span>Reset Demo</span>
          </button>

          {/* User profile / Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#22242f]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-700 to-purple-600 flex items-center justify-center text-xs font-medium text-white shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#1a1c25] rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
