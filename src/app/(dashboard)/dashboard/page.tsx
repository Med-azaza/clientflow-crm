"use client";

import { Filter, Plus, Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { ActionQueue } from "@/components/dashboard/action-queue";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  dashboardHighlights,
  type Priority,
  type Project,
  projects,
  teamMembers,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function DashboardPage() {
  const [recentProjects, setRecentProjects] = useState(projects.slice(0, 4));
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [modalOpen, setModalOpen] = useState(false);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recentProjects
      .filter((project) => {
        return (
          project.name.toLowerCase().includes(normalizedQuery) ||
          project.company.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((first, second) => {
        if (sortBy === "budget") {
          return second.budget - first.budget;
        }

        return first.dueDate.localeCompare(second.dueDate);
      });
  }, [query, recentProjects, sortBy]);

  const handleCreateProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const company = String(formData.get("company") ?? "");

    const nextProject: Project = {
      id: `dashboard-project-${Date.now()}`,
      slug: slugify(name),
      name,
      client: "New client contact",
      company,
      status: "Planning",
      priority: String(formData.get("priority") ?? "High") as Priority,
      budget: Number(formData.get("budget") ?? 0),
      budgetUsed: 0,
      dueDate: "Jul 30",
      createdAt: "Jun 21, 2026",
      progress: 10,
      leadId: "anna",
      assigneeIds: ["anna", "emily"],
      column: "Planning",
      comments: 0,
      files: 0,
    };

    setRecentProjects((current) => [nextProject, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Welcome back, Anna. Here&apos;s your agency overview for today.
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
        {dashboardHighlights.map((item) => (
          <MetricCard
            href={item.href}
            icon={item.icon}
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
                  {recentProjects.length} total
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
                  key: "client",
                  header: "Client",
                  className: "min-w-56",
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
                  key: "project",
                  header: "Project Name",
                  className: "min-w-56",
                  render: (project) => project.name,
                },
                {
                  key: "deadline",
                  header: "Deadline",
                  className: "whitespace-nowrap",
                  render: (project) => (
                    <span className="font-semibold text-blue-700">
                      {project.dueDate}
                    </span>
                  ),
                },
                {
                  key: "budget",
                  header: "Budget",
                  className: "whitespace-nowrap",
                  render: (project) => (
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(project.budget)}
                    </span>
                  ),
                },
                {
                  key: "lead",
                  header: "Lead",
                  className: "whitespace-nowrap",
                  render: (project) =>
                    teamMembers.find((member) => member.id === project.leadId)
                      ?.name ?? "Unassigned",
                },
                {
                  key: "status",
                  header: "Status",
                  className: "whitespace-nowrap",
                  render: (project) => (
                    <StatusBadge>{project.status}</StatusBadge>
                  ),
                },
              ]}
              data={visibleProjects}
              emptyState={
                <EmptyState
                  description="Try a different search term to find a recent project."
                  title="No projects found"
                />
              }
              roundedTop={false}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <TeamWorkload />
          <ActionQueue />
        </aside>
      </div>

      <Modal
        description="Create a local mock project from the dashboard."
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
            <input className={inputClass} name="company" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
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
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
