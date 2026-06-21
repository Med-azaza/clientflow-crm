"use client";

import { Filter, Plus, Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  tasks as initialTasks,
  type Priority,
  type Task,
  teamMembers,
} from "@/lib/mock-data";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const nextTask: Task = {
      id: `task-${Date.now()}`,
      title: String(formData.get("title") ?? ""),
      project: String(formData.get("project") ?? ""),
      client: String(formData.get("client") ?? ""),
      assigneeId: String(formData.get("assigneeId") ?? "anna"),
      priority: String(formData.get("priority") ?? "High") as Priority,
      status: "Pending",
      dueDate: "This week",
    };

    setTasks((current) => [nextTask, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
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
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus className="size-5" />
          Add Task
        </button>
      </div>

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
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
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
            key: "task",
            header: "Task",
            className: "min-w-64",
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
            className: "whitespace-nowrap",
            render: (task) => task.client,
          },
          {
            key: "assignee",
            header: "Assignee",
            className: "whitespace-nowrap",
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
            className: "whitespace-nowrap",
            render: (task) => <StatusBadge>{task.priority}</StatusBadge>,
          },
          {
            key: "status",
            header: "Status",
            className: "whitespace-nowrap",
            render: (task) => <StatusBadge>{task.status}</StatusBadge>,
          },
          {
            key: "due",
            header: "Due date",
            className: "whitespace-nowrap",
            render: (task) => (
              <span className="font-semibold text-slate-950">
                {task.dueDate}
              </span>
            ),
          },
        ]}
        data={filteredTasks}
        emptyState={
          <EmptyState
            description="Clear a filter or add a new task to keep work moving."
            title="No tasks found"
          />
        }
      />

      <Modal
        description="Add a local mock task for the portfolio demo."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Add Task"
      >
        <form className="space-y-4" onSubmit={handleAddTask}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Task title
            </span>
            <input className={inputClass} name="title" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Project
              </span>
              <input
                className={inputClass}
                defaultValue="Website Redesign"
                name="project"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Client
              </span>
              <input
                className={inputClass}
                defaultValue="Acme Corp"
                name="client"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Assignee
              </span>
              <select className={inputClass} name="assigneeId">
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Priority
              </span>
              <select className={inputClass} name="priority">
                <option>High</option>
                <option>Urgent</option>
                <option>Medium</option>
                <option>Low</option>
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
              className="rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              type="submit"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
