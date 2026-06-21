"use client";

import {
  CalendarDays,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  createProjectRecord,
  deleteProjectRecord,
  updateProjectRecord,
} from "@/lib/actions";
import type {
  ClientRecord,
  OrganizationMember,
  Priority,
  ProjectRecord,
} from "@/lib/app-types";
import { formatCurrency } from "@/lib/utils";

type ProjectsClientProps = {
  clients: ClientRecord[];
  members: OrganizationMember[];
  projects: ProjectRecord[];
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const priorities: Array<Priority | "All"> = [
  "All",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

export function ProjectsClient({
  clients,
  members,
  projects,
}: ProjectsClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const clientNames = useMemo(
    () => [
      "All",
      ...Array.from(new Set(projects.map((project) => project.company))),
    ],
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.company.toLowerCase().includes(normalizedQuery);
      const matchesClient =
        clientFilter === "All" || project.company === clientFilter;
      const matchesPriority =
        priorityFilter === "All" || project.priority === priorityFilter;

      return matchesQuery && matchesClient && matchesPriority;
    });
  }, [clientFilter, priorityFilter, projects, query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    startTransition(async () => {
      const result = editing
        ? await updateProjectRecord({ ...payload, id: editing.id })
        : await createProjectRecord(payload);

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to save project.");
        return;
      }

      setFeedback(result.message ?? "Project saved.");
      setModalOpen(false);
      setEditing(null);
      form.reset();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteProjectRecord(id);
      setFeedback(result.message ?? result.error ?? null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <LayoutGrid className="size-7 text-blue-700" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Projects Board
            </h1>
          </div>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Track agency workflow and manage project lifecycles.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="-space-x-2 hidden sm:flex">
            {members.slice(0, 3).map((member) => (
              <UserAvatar
                className="size-9 text-xs ring-2 ring-white"
                initials={member.initials}
                key={member.id}
                label={member.name}
              />
            ))}
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
            New Project
          </button>
        </div>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

      <div className="card flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
          <label className="relative sm:col-span-2 xl:w-64">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              type="search"
              value={query}
            />
          </label>
          <select
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none"
            onChange={(event) => setClientFilter(event.target.value)}
            value={clientFilter}
          >
            {clientNames.map((client) => (
              <option key={client} value={client}>{`Client: ${client}`}</option>
            ))}
          </select>
          <select
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none"
            onChange={(event) =>
              setPriorityFilter(event.target.value as Priority | "All")
            }
            value={priorityFilter}
          >
            {priorities.map((priority) => (
              <option
                key={priority}
                value={priority}
              >{`Priority: ${priority}`}</option>
            ))}
          </select>
          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800"
            type="button"
          >
            <CalendarDays className="size-4" />
            Deadline: All
          </button>
        </div>
        <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1 sm:w-fit">
          <button
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${
              view === "kanban"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setView("kanban")}
            type="button"
          >
            <LayoutGrid className="size-4" />
            Kanban
          </button>
          <button
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${
              view === "list"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setView("list")}
            type="button"
          >
            <List className="size-4" />
            List
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          description="Adjust the search or filters, or create a new project."
          title="No projects match these filters"
        />
      ) : view === "kanban" ? (
        <KanbanBoard members={members} projects={filteredProjects} />
      ) : (
        <DataTable
          columns={[
            {
              className: "min-w-64",
              header: "Project",
              key: "project",
              render: (project) => (
                <div>
                  <Link
                    className="font-semibold text-slate-950 hover:text-blue-700"
                    href={`/projects/${project.slug}`}
                  >
                    {project.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.company}
                  </p>
                </div>
              ),
            },
            {
              className: "whitespace-nowrap",
              header: "Status",
              key: "status",
              render: (project) => <StatusBadge>{project.status}</StatusBadge>,
            },
            {
              className: "whitespace-nowrap",
              header: "Priority",
              key: "priority",
              render: (project) => (
                <StatusBadge>{`${project.priority} Priority`}</StatusBadge>
              ),
            },
            {
              className: "whitespace-nowrap",
              header: "Budget",
              key: "budget",
              render: (project) => formatCurrency(project.budget),
            },
            {
              className: "whitespace-nowrap",
              header: "Actions",
              key: "actions",
              render: (project) => (
                <div className="flex gap-3">
                  <button
                    className="font-semibold text-blue-700"
                    onClick={() => {
                      setEditing(project);
                      setModalOpen(true);
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="font-semibold text-rose-600"
                    disabled={isPending}
                    onClick={() => handleDelete(project.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredProjects}
          minWidth="min-w-[800px]"
        />
      )}

      <Modal
        description="Save this project to your Supabase workspace."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={editing ? "Edit Project" : "New Project"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Project name
            </span>
            <input
              className={inputClass}
              defaultValue={editing?.name}
              name="name"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Client</span>
            <select
              className={inputClass}
              defaultValue={editing?.clientId ?? ""}
              name="clientId"
            >
              <option value="">No client yet</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.status ?? "Planning"}
                name="status"
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Completed</option>
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
                <option>High</option>
                <option>Urgent</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Budget
              </span>
              <input
                className={inputClass}
                defaultValue={editing?.budget ?? 0}
                min="0"
                name="budget"
                required
                type="number"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Progress
              </span>
              <input
                className={inputClass}
                defaultValue={editing?.progress ?? 0}
                max="100"
                min="0"
                name="progress"
                type="number"
              />
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
              Save Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
