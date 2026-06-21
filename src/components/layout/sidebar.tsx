"use client";

import {
  Bell,
  FileText,
  Folder,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: Folder },
  { label: "Tasks", href: "/tasks", icon: Bell },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Files", href: "/files", icon: Folder },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

function SidebarContent({ onClose }: Pick<SidebarProps, "onClose">) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[var(--app-sidebar)]">
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
        <Link
          className="text-2xl font-bold tracking-tight text-blue-700"
          href="/dashboard"
        >
          ClientFlow
        </Link>
        <button
          aria-label="Close navigation"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-5 py-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition",
                "hover:bg-blue-50 hover:text-blue-700",
                active && "bg-blue-100 text-blue-700 shadow-sm",
              )}
              href={item.href}
              key={item.href}
              onClick={onClose}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-5 border-t border-slate-200 p-5">
        <div className="rounded-2xl bg-blue-700 p-5 text-white shadow-lg shadow-blue-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
            Pro Plan Active
          </p>
          <p className="mt-1 font-semibold">Need more storage?</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-3/4 rounded-full bg-white" />
          </div>
          <button
            className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700"
            type="button"
          >
            Upgrade Plan
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <UserAvatar initials="AD" label="Anna Dorsey" />
          <div>
            <p className="font-semibold text-slate-900">Anna D.</p>
            <p className="text-sm text-slate-500">Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 lg:block">
        <SidebarContent />
      </aside>
      <button
        aria-label="Close navigation backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/40 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] border-r border-slate-200 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
}
