import { FilesClient } from "@/components/crm/files-client";
import { getWorkspaceData } from "@/lib/data";

export default async function FilesPage() {
  const data = await getWorkspaceData();

  return (
    <FilesClient
      clients={data.clients}
      files={data.files}
      projects={data.projects}
    />
  );
}
