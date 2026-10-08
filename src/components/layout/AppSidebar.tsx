"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessagesSquare,
  CheckSquare,
  Compass,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  Bot,
  FolderKanban,
  Settings,
  X,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  highlight?: boolean;
  warning?: boolean;
  special?: boolean;
}

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const navigation: Array<{ group: string; items: NavItem[] }> = [
    {
      group: "Core",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Conversations", href: "/conversations", icon: MessagesSquare },
        { name: "Ingest / Upload", href: "/conversations/new", icon: FileUp, highlight: true },
      ],
    },
    {
      group: "Action Intelligence",
      items: [
        { name: "Tasks", href: "/tasks", icon: CheckSquare },
        { name: "Decisions", href: "/decisions", icon: Compass },
        { name: "Commitments", href: "/commitments", icon: AlertCircle },
        { name: "Unresolved Items", href: "/unresolved", icon: HelpCircle },
        { name: "Conflicts & Risks", href: "/conflicts", icon: AlertTriangle, warning: true },
      ],
    },
    {
      group: "Workspace",
      items: [
        { name: "Ask Echo AI", href: "/ask", icon: Bot, special: true },
        { name: "Projects", href: "/projects", icon: FolderKanban },
        { name: "Settings & Privacy", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0d0e15] border-r border-[#22242f] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-3.5rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#22242f] lg:hidden">
          <span className="font-semibold text-sm text-white">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigation.map((group) => (
            <div key={group.group}>
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/25"
                          : "text-gray-400 hover:text-gray-200 hover:bg-[#151722]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive
                              ? "text-indigo-400"
                              : item.warning
                              ? "text-amber-500/80 group-hover:text-amber-400"
                              : item.special
                              ? "text-indigo-400"
                              : "text-gray-400 group-hover:text-gray-300"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.highlight && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                          + New
                        </span>
                      )}

                      {item.warning && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline footer */}
        <div className="p-3 border-t border-[#22242f] bg-[#090a0f]/60 text-[11px] text-gray-400 text-center">
          &ldquo;Turn conversations into action.&rdquo;
        </div>
      </aside>
    </>
  );
}
