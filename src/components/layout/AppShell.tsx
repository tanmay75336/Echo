"use client";

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  user?: {
    name?: string;
    email?: string;
    currentWorkspace?: { name: string; slug: string };
  } | null;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f5] flex flex-col">
      <AppHeader user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#090a0f]">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
