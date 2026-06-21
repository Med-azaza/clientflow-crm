"use client";

import { type ReactNode, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";
import type { Organization, Profile, Role } from "@/lib/app-types";

type DashboardShellProps = {
  children: ReactNode;
  organization: Organization;
  profile: Profile;
  role: Role;
};

export function DashboardShell({
  children,
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
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
