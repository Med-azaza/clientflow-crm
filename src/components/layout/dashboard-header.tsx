"use client";

import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Profile, Role } from "@/lib/app-types";
import { signOut } from "@/lib/auth-actions";
import { cn, initialsFor } from "@/lib/utils";

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
  profile: Profile;
  role: Role;
};

const notifications = [
  {
    id: "n1",
    title: "Client approval received",
    detail: "Acme Corp approved the homepage direction.",
    time: "12m ago",
  },
  {
    id: "n2",
    title: "Invoice follow-up",
    detail: "Horizon Ventures has a pending invoice reminder queued.",
    time: "1h ago",
  },
  {
    id: "n3",
    title: "New project comment",
    detail: "Sam added notes to Brand Refresh 2024.",
    time: "3h ago",
  },
];

export function DashboardHeader({
  onMenuClick,
  profile,
  role,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const basePath = `/${pathname.split("/")[1] || "dashboard"}`;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("clientflow-theme");
    const shouldUseDark = storedTheme === "dark";

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  const handleThemeToggle = () => {
    const nextDarkMode = !darkMode;

    document.documentElement.classList.toggle("dark", nextDarkMode);
    window.localStorage.setItem(
      "clientflow-theme",
      nextDarkMode ? "dark" : "light",
    );
    setDarkMode(nextDarkMode);
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-[var(--app-bg)]/95 px-4 py-3 backdrop-blur sm:gap-4 lg:min-h-20 lg:px-8">
      <button
        aria-label="Open navigation"
        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 lg:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <Menu className="size-5" />
      </button>
      <div className="relative hidden w-full max-w-md md:block">
        <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-5 text-slate-400" />
        <input
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white/80 pr-4 pl-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          placeholder={placeholders[basePath] ?? "Search workspace..."}
          type="search"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative" ref={notificationsRef}>
          <button
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
            className={cn(
              "relative rounded-xl p-2 text-slate-700 transition hover:bg-white hover:text-blue-700",
              notificationsOpen && "bg-white text-blue-700 shadow-sm",
            )}
            onClick={() => setNotificationsOpen((open) => !open)}
            type="button"
          >
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
          </button>
          {notificationsOpen ? (
            <div className="absolute top-full right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="font-bold text-slate-950">Notifications</p>
                  <p className="text-xs font-medium text-slate-500">
                    {notifications.length} new updates
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-700">
                  Demo
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <button
                    className="w-full px-5 py-4 text-left transition hover:bg-slate-50"
                    key={notification.id}
                    onClick={() => setNotificationsOpen(false)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 size-2 rounded-full bg-blue-600" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-950">
                          {notification.title}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">
                          {notification.detail}
                        </span>
                        <span className="mt-2 block text-xs font-medium text-slate-400">
                          {notification.time}
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <button
          aria-label={darkMode ? "Use light theme" : "Use dark theme"}
          className="rounded-xl p-2 text-slate-700 transition hover:bg-white hover:text-blue-700"
          onClick={handleThemeToggle}
          type="button"
        >
          {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-36 truncate text-sm font-semibold text-slate-950">
              {profile.fullName || profile.email}
            </p>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
              {role}
            </p>
          </div>
          <UserAvatar
            className="size-11"
            initials={initialsFor(profile.fullName || profile.email)}
            label={profile.fullName || profile.email}
          />
          <form action={signOut}>
            <button
              aria-label="Sign out"
              className="rounded-xl p-2 text-slate-700 transition hover:bg-white hover:text-blue-700"
              type="submit"
            >
              <LogOut className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
