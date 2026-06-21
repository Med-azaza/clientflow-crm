"use client";

import { Filter, Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  createTaskRecord,
  deleteTaskRecord,
  updateTaskRecord,
} from "@/lib/actions";
import type {
  OrganizationMember,
  Priority,
  ProjectRecord,
  TaskRecord,
} from "@/lib/app-types";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export function TasksClient({
  members,
  projects,
  tasks,
}: {
  members: OrganizationMember[];
  projects: ProjectRecord[];
  tasks: TaskRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.project.toLowerCase().includes(normalizedQuery) ||
        task.client.toLowerCase().includes(normalizedQuery);
      const matchesAssignee =
        assigneeFilter === "All" || task.assigneeId === assigneeFilter;
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      return (
        matchesQuery && matchesAssignee && matchesPriority && matchesStatus
      );
    });
  }, [assigneeFilter, priorityFilter, query, statusFilter, tasks]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    startTransition(async () => {
      const result = editing
        ? await updateTaskRecord({ ...payload, id: editing.id })
        : await createTaskRecord(payload);

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to save task.");
        return;
      }

      setFeedback(result.message ?? "Task saved.");
      setModalOpen(false);
      setEditing(null);
      form.reset();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteTaskRecord(id);
      setFeedback(result.message ?? result.error ?? null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Tasks
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Coordinate assignments, priorities, and review states.
          </p>
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 sm:w-auto"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          type="button"
        >
          <Plus className="size-5" />
          Add Task
        </button>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

      <div className="card grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)]">
        <label className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks..."
            type="search"
            value={query}
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filter by assignee</span>
          <Filter className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
          <select
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-10 pl-11 font-semibold text-slate-800 outline-none"
            onChange={(event) => setAssigneeFilter(event.target.value)}
            value={assigneeFilter}
          >
            <option value="All">Assignee: All</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <select
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none"
          onChange={(event) => setPriorityFilter(event.target.value)}
          value={priorityFilter}
        >
          <option value="All">Priority: All</option>
          {["Urgent", "High", "Medium", "Low"].map((priority) => (
            <option key={priority} value={priority}>
              Priority: {priority}
            </option>
          ))}
        </select>
        <select
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none"
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
        >
          <option value="All">Status: All</option>
          {["Pending", "In Progress", "In Review", "Completed"].map(
            (status) => (
              <option key={status} value={status}>
                Status: {status}
              </option>
            ),
          )}
        </select>
      </div>

      <DataTable
        columns={[
          {
            className: "min-w-64",
            header: "Task",
            key: "task",
            render: (task) => (
              <div>
                <p className="font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-slate-500">{task.project}</p>
              </div>
            ),
          },
          {
            className: "whitespace-nowrap",
            header: "Client",
            key: "client",
            render: (task) => task.client,
          },
          {
            className: "whitespace-nowrap",
            header: "Assignee",
            key: "assignee",
            render: (task) => (
              <div className="flex items-center gap-3">
                <UserAvatar
                  className="size-8 text-xs"
                  initials={task.assigneeInitials}
                  label={task.assigneeName}
                />
                {task.assigneeName}
              </div>
            ),
          },
          {
            className: "whitespace-nowrap",
            header: "Priority",
            key: "priority",
            render: (task) => <StatusBadge>{task.priority}</StatusBadge>,
          },
          {
            className: "whitespace-nowrap",
            header: "Status",
            key: "status",
            render: (task) => <StatusBadge>{task.status}</StatusBadge>,
          },
          {
            className: "whitespace-nowrap",
            header: "Actions",
            key: "actions",
            render: (task) => (
              <div className="flex gap-3">
                <button
                  className="font-semibold text-blue-700"
                  onClick={() => {
                    setEditing(task);
                    setModalOpen(true);
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="font-semibold text-rose-600"
                  disabled={isPending}
                  onClick={() => handleDelete(task.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        data={filteredTasks}
        emptyState={
          <EmptyState
            description="Clear a filter or add a new task."
            title="No tasks found"
          />
        }
      />

      <Modal
        description="Save this task to your Supabase workspace."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={editing ? "Edit Task" : "Add Task"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Task title
            </span>
            <input
              className={inputClass}
              defaultValue={editing?.title}
              name="title"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Project
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.projectId ?? ""}
                name="projectId"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Assignee
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.assigneeId ?? ""}
                name="assigneeId"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Priority
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.priority ?? "High"}
                name="priority"
              >
                {(["High", "Urgent", "Medium", "Low"] as Priority[]).map(
                  (priority) => (
                    <option key={priority}>{priority}</option>
                  ),
                )}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.status ?? "Pending"}
                name="status"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>In Review</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
              onClick={() => setModalOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-300"
              disabled={isPending}
              type="submit"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
