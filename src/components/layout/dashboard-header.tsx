"use client";

import { Bell, Menu, Moon, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";

const placeholders: Record<string, string> = {
  "/dashboard": "Search clients, projects, or files...",
  "/clients": "Search clients...",
  "/projects": "Search projects...",
  "/tasks": "Search tasks...",
  "/invoices": "Search invoices...",
  "/files": "Search files...",
  "/messages": "Search messages...",
  "/settings": "Search workspace...",
};

type DashboardHeaderProps = {
  onMenuClick: () => void;
};

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const basePath = `/${pathname.split("/")[1] || "dashboard"}`;

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-[var(--app-bg)]/95 px-4 backdrop-blur lg:px-8">
      <button
        aria-label="Open navigation"
        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <Menu className="size-5" />
      </button>
      <div className="relative hidden w-full max-w-md sm:block">
        <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-5 text-slate-400" />
        <input
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white/80 pr-4 pl-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          placeholder={placeholders[basePath] ?? "Search workspace..."}
          type="search"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-slate-700 hover:bg-white"
          type="button"
        >
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
        </button>
        <button
          aria-label="Theme"
          className="rounded-xl p-2 text-slate-700 hover:bg-white"
          type="button"
        >
          <Moon className="size-5" />
        </button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-950">Anna D.</p>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
              Manager
            </p>
          </div>
          <UserAvatar initials="AD" label="Anna Dorsey" className="size-11" />
        </div>
      </div>
    </header>
  );
}
