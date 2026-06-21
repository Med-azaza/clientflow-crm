import { SettingsClient } from "@/components/crm/settings-client";
import { getWorkspaceData } from "@/lib/data";

export default async function SettingsPage() {
  const data = await getWorkspaceData();

  return (
    <SettingsClient
      invoices={data.invoices}
      members={data.members}
      organization={data.organization}
      profile={data.profile}
      role={data.role}
    />
  );
}
