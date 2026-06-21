import { InvoicesClient } from "@/components/crm/invoices-client";
import { getWorkspaceData } from "@/lib/data";

export default async function InvoicesPage() {
  const data = await getWorkspaceData();

  return (
    <InvoicesClient
      clients={data.clients}
      invoices={data.invoices}
      projects={data.projects}
    />
  );
}
