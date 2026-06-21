"use client";

import { type ReactNode, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";
import type { Organization, Profile, Role } from "@/lib/app-types";

type DashboardShellProps = {
  children: ReactNode;
  isDemoWorkspace: boolean;
  organization: Organization;
  profile: Profile;
  role: Role;
};

export function DashboardShell({
  children,
  isDemoWorkspace,
  organization,
  profile,
  role,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--app-bg)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        organization={organization}
        profile={profile}
        role={role}
      />
      <div className="min-w-0 lg:pl-72">
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
          profile={profile}
          role={role}
        />
        {isDemoWorkspace ? (
          <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-900 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1480px] flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="font-bold">Demo workspace</span>
              <span className="text-blue-800">
                You're viewing sample data. Changes may be reset.
              </span>
            </div>
          </div>
        ) : null}
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
