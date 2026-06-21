import { Filter, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { tasks, teamMembers } from "@/lib/mock-data";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Tasks
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Coordinate assignments, priorities, and review states.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
          type="button"
        >
          <Plus className="size-5" />
          Add Task
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-5 lg:flex-row">
        {["Assignee: All", "Priority: All", "Status: All"].map((filter) => (
          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800"
            key={filter}
            type="button"
          >
            <Filter className="size-4" />
            {filter}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: "task",
            header: "Task",
            render: (task) => (
              <div>
                <p className="font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-slate-500">{task.project}</p>
              </div>
            ),
          },
          {
            key: "client",
            header: "Client",
            render: (task) => task.client,
          },
          {
            key: "assignee",
            header: "Assignee",
            render: (task) => {
              const member = teamMembers.find(
                (item) => item.id === task.assigneeId,
              );

              return member ? (
                <div className="flex items-center gap-3">
                  <UserAvatar
                    className="size-8 text-xs"
                    initials={member.initials}
                    label={member.name}
                  />
                  {member.name}
                </div>
              ) : (
                "Unassigned"
              );
            },
          },
          {
            key: "priority",
            header: "Priority",
            render: (task) => <StatusBadge>{task.priority}</StatusBadge>,
          },
          {
            key: "status",
            header: "Status",
            render: (task) => <StatusBadge>{task.status}</StatusBadge>,
          },
          {
            key: "due",
            header: "Due date",
            render: (task) => (
              <span className="font-semibold text-slate-950">
                {task.dueDate}
              </span>
            ),
          },
        ]}
        data={tasks}
      />
    </div>
  );
}
