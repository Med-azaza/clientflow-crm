"use client";

import {
  Archive,
  CheckCircle2,
  Clock3,
  Filter,
  FolderKanban,
  Loader2,
  type LucideIcon,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { ActionQueue } from "@/components/dashboard/action-queue";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { createProjectRecord } from "@/lib/actions";
import type {
  ActionQueueItem,
  ClientRecord,
  DashboardIconName,
  MetricHighlight,
  OrganizationMember,
  Priority,
  ProjectRecord,
} from "@/lib/app-types";
import { formatCurrency } from "@/lib/utils";

type DashboardClientProps = {
  actionQueue: ActionQueueItem[];
  clients: ClientRecord[];
  highlights: MetricHighlight[];
  members: OrganizationMember[];
  profileName: string;
  projects: ProjectRecord[];
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const metricIconMap: Partial<Record<DashboardIconName, LucideIcon>> = {
  archive: Archive,
  "check-circle": CheckCircle2,
  clock: Clock3,
  "folder-kanban": FolderKanban,
};

export function DashboardClient({
  actionQueue,
  clients,
  highlights,
  members,
  profileName,
  projects,
}: DashboardClientProps) {
  const router = useRouter();
  const [recentProjects] = useState(projects.slice(0, 6));
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recentProjects
      .filter(
        (project) =>
          project.name.toLowerCase().includes(normalizedQuery) ||
          project.company.toLowerCase().includes(normalizedQuery),
      )
      .sort((first, second) => {
        if (sortBy === "budget") {
          return second.budget - first.budget;
        }

        return first.dueDate.localeCompare(second.dueDate);
      });
  }, [query, recentProjects, sortBy]);

  const handleCreateProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    startTransition(async () => {
      const result = await createProjectRecord(payload);

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to create project.");
        return;
      }

      setFeedback(result.message ?? "Project saved.");
      form.reset();
      setModalOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Welcome back, {profileName || "there"}. Here&apos;s your agency
            overview for today.
          </p>
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 sm:w-auto"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus className="size-5" />
          New Project
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <MetricCard
            href={item.href}
            icon={metricIconMap[item.icon] ?? CheckCircle2}
            key={item.label}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-6">
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-950">
                  Recent Projects
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                  {projects.length} total
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="relative">
                  <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
                  <input
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search projects..."
                    type="search"
                    value={query}
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">Sort recent projects</span>
                  <Filter className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
                  <select
                    className="h-11 rounded-2xl border border-slate-200 bg-white pr-10 pl-11 font-semibold text-slate-900 outline-none"
                    onChange={(event) => setSortBy(event.target.value)}
                    value={sortBy}
                  >
                    <option value="deadline">Sort by deadline</option>
                    <option value="budget">Sort by budget</option>
                  </select>
                </label>
              </div>
            </div>
            <DataTable
              columns={[
                {
                  className: "min-w-56",
                  header: "Client",
                  key: "client",
                  render: (project) => (
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        className="size-9 text-xs"
                        initials={project.company
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                        label={project.company}
                      />
                      <span className="font-semibold text-slate-900">
                        {project.company}
                      </span>
                    </div>
                  ),
                },
                {
                  className: "min-w-56",
                  header: "Project Name",
                  key: "project",
                  render: (project) => project.name,
                },
                {
                  className: "whitespace-nowrap",
                  header: "Deadline",
                  key: "deadline",
                  render: (project) => (
                    <span className="font-semibold text-blue-700">
                      {project.dueDate}
                    </span>
                  ),
                },
                {
                  className: "whitespace-nowrap",
                  header: "Budget",
                  key: "budget",
                  render: (project) => (
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(project.budget)}
                    </span>
                  ),
                },
                {
                  className: "whitespace-nowrap",
                  header: "Lead",
                  key: "lead",
                  render: (project) =>
                    members.find((member) => member.userId === project.leadId)
                      ?.name ?? "Unassigned",
                },
                {
                  className: "whitespace-nowrap",
                  header: "Status",
                  key: "status",
                  render: (project) => (
                    <StatusBadge>{project.status}</StatusBadge>
                  ),
                },
              ]}
              data={visibleProjects}
              emptyState={
                <EmptyState
                  description="Create a project or adjust the search term."
                  title="No projects found"
                />
              }
              roundedTop={false}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <TeamWorkload members={members} />
          <ActionQueue items={actionQueue} />
        </aside>
      </div>

      <Modal
        description="Create a project in your Supabase workspace."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="New Project"
      >
        <form className="space-y-4" onSubmit={handleCreateProject}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Project name
            </span>
            <input className={inputClass} name="name" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Client</span>
            <select className={inputClass} name="clientId">
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
                Priority
              </span>
              <select className={inputClass} name="priority">
                {(["High", "Urgent", "Medium", "Low"] as Priority[]).map(
                  (priority) => (
                    <option key={priority}>{priority}</option>
                  ),
                )}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Budget
              </span>
              <input
                className={inputClass}
                min="0"
                name="budget"
                required
                type="number"
              />
            </label>
          </div>
          {feedback ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {feedback}
            </p>
          ) : null}
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
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
