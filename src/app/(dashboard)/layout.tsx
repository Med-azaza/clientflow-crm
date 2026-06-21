import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentContext } from "@/lib/data";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { organization, profile, role } = await getCurrentContext();

  return (
    <DashboardShell organization={organization} profile={profile} role={role}>
      {children}
    </DashboardShell>
  );
}
