import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentContext } from "@/lib/data";
import { isDemoEmail } from "@/lib/demo-workspace";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { organization, profile, role } = await getCurrentContext();

  return (
    <DashboardShell
      isDemoWorkspace={isDemoEmail(profile.email)}
      organization={organization}
      profile={profile}
      role={role}
    >
      {children}
    </DashboardShell>
  );
}
