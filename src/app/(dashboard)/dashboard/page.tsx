import { Filter, Plus, Search } from "lucide-react";
import { ActionQueue } from "@/components/dashboard/action-queue";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { dashboardHighlights, projects, teamMembers } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Welcome back, Anna. Here&apos;s your agency overview for today.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
          type="button"
        >
          <Plus className="size-5" />
          New Project
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardHighlights.map((item) => (
          <MetricCard
            icon={item.icon}
            key={item.label}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-950">
                  Recent Projects
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                  24 total
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative">
                  <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
                  <input
                    className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 text-sm outline-none focus:border-blue-300"
                    placeholder="Search projects..."
                    type="search"
                  />
                </label>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900"
                  type="button"
                >
                  <Filter className="size-4" />
                  Sort
                </button>
              </div>
            </div>
            <DataTable
              columns={[
                {
                  key: "client",
                  header: "Client",
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
                  render: (project) => project.name,
                },
                {
                  key: "deadline",
                  header: "Deadline",
                  render: (project) => (
                    <span className="font-semibold text-blue-700">
                      {project.dueDate}
                    </span>
                  ),
                },
                {
                  key: "budget",
                  header: "Budget",
                  render: (project) => (
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(project.budget)}
                    </span>
                  ),
                },
                {
                  key: "lead",
                  header: "Lead",
                  render: (project) =>
                    teamMembers.find((member) => member.id === project.leadId)
                      ?.name ?? "Unassigned",
                },
                {
                  key: "status",
                  header: "Status",
                  render: (project) => (
                    <StatusBadge>{project.status}</StatusBadge>
                  ),
                },
              ]}
              data={recentProjects}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <TeamWorkload />
          <ActionQueue />
        </aside>
      </div>
    </div>
  );
}
