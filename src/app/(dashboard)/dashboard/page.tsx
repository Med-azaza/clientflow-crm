import { DashboardClient } from "@/components/crm/dashboard-client";
import { getWorkspaceData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getWorkspaceData();

  return (
    <DashboardClient
      actionQueue={data.actionQueue}
      clients={data.clients}
      highlights={data.dashboardHighlights}
      members={data.members}
      profileName={data.profile.fullName}
      projects={data.projects}
    />
  );
}
