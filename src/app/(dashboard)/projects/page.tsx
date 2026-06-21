import { ProjectsClient } from "@/components/crm/projects-client";
import { getWorkspaceData } from "@/lib/data";

export default async function ProjectsPage() {
  const data = await getWorkspaceData();

  return (
    <ProjectsClient
      clients={data.clients}
      members={data.members}
      projects={data.projects}
    />
  );
}
