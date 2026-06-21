import { ClientsClient } from "@/components/crm/clients-client";
import { getWorkspaceData } from "@/lib/data";

export default async function ClientsPage() {
  const data = await getWorkspaceData();

  return (
    <ClientsClient activityLogs={data.activityLogs} clients={data.clients} />
  );
}
