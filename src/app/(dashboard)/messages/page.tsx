import { MessagesClient } from "@/components/crm/messages-client";
import { getWorkspaceData } from "@/lib/data";

export default async function MessagesPage() {
  const data = await getWorkspaceData();

  return (
    <MessagesClient
      clients={data.clients}
      messages={data.messages}
      projects={data.projects}
    />
  );
}
