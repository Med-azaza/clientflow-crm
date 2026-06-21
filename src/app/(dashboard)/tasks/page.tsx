import { TasksClient } from "@/components/crm/tasks-client";
import { getWorkspaceData } from "@/lib/data";

export default async function TasksPage() {
  const data = await getWorkspaceData();

  return (
    <TasksClient
      members={data.members}
      projects={data.projects}
      tasks={data.tasks}
    />
  );
}
