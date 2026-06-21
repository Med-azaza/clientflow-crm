import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  HeartPulse,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  activityLogs,
  files,
  projects,
  tasks,
  teamMembers,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((item) => item.slug === id);

  if (!project) {
    notFound();
  }

  const projectTasks = tasks.filter((task) => task.project === project.name);
  const assignees = teamMembers.filter((member) =>
    project.assigneeIds.includes(member.id),
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        href="/projects"
      >
        <ArrowLeft className="size-4" />
        Back to Projects
      </Link>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            {project.name} - {project.company}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <StatusBadge>{project.status}</StatusBadge>
            <span className="text-slate-600">
              Created on {project.createdAt}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 shadow-sm"
            type="button"
          >
            Edit Details
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
            type="button"
          >
            <Plus className="size-5" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={`${formatCurrency(project.budgetUsed)} / ${formatCurrency(project.budget)}`}
          icon={DollarSign}
          label="Budget Used"
          tone="blue"
          value={`${Math.round((project.budgetUsed / project.budget) * 100)}%`}
        />
        <MetricCard
          detail={`Due on ${project.dueDate}, 2026`}
          icon={CalendarDays}
          label="Deadline"
          tone="red"
          value="12 Days"
        />
        <MetricCard
          detail="2 completed / 6 total"
          icon={CheckCircle2}
          label="Open Tasks"
          tone="amber"
          value={String(projectTasks.length + 2)}
        />
        <MetricCard
          detail="Ahead of schedule"
          icon={HeartPulse}
          label="Team Health"
          tone="green"
          value="Strong"
        />
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-8 overflow-x-auto">
          {["Overview", "Tasks", "Files", "Invoices", "Comments"].map((tab) => (
            <button
              className="border-b-2 border-transparent px-1 pb-4 font-semibold text-slate-600 first:border-blue-700 first:text-blue-700"
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold text-slate-950">
                  Current Sprint
                </h2>
                <span className="text-slate-500">S2 - Wave 1</span>
              </div>
              <Link className="font-semibold text-blue-700" href="/tasks">
                View All Tasks
              </Link>
            </div>
            <DataTable
              columns={[
                {
                  key: "task",
                  header: "Task",
                  render: (task) => (
                    <div>
                      <p className="font-semibold text-slate-950">
                        {task.title}
                      </p>
                      <p className="mt-1 text-slate-500">{task.client}</p>
                    </div>
                  ),
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
                  key: "actions",
                  header: "",
                  render: (task) => (
                    <button
                      aria-label={`Open ${task.title} actions`}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                      type="button"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  ),
                },
              ]}
              data={projectTasks}
              footer={
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-blue-700"
                  type="button"
                >
                  <Plus className="size-5" />
                  Add New Task to Sprint
                </button>
              }
            />
          </div>

          <section className="card bg-slate-100 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Project Note</h2>
              <button className="font-semibold text-blue-700" type="button">
                Edit
              </button>
            </div>
            <div className="rounded-2xl bg-white p-6 leading-7 text-slate-700">
              The client requested a sharper conversion story for the services
              section. Keep two homepage variations ready for Wednesday&apos;s
              review.
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Recent Activity
            </h2>
            <div className="mt-6 space-y-6 border-l border-slate-200 pl-6">
              {activityLogs.map((event) => (
                <div className="relative" key={event.id}>
                  <span className="-left-[31px] absolute top-1 flex size-3 rounded-full bg-blue-700 ring-4 ring-blue-100" />
                  <p className="font-semibold text-slate-950">{event.title}</p>
                  <p className="mt-1 text-slate-600">{event.detail}</p>
                  <p className="mt-2 text-sm text-slate-400">{event.time}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-blue-700 p-6 text-white shadow-xl shadow-blue-900/15">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              Workspace
            </p>
            <h2 className="mt-3 text-3xl font-bold">Shared Assets</h2>
            <div className="mt-8 flex items-center justify-between">
              <div className="-space-x-2 flex">
                {assignees.map((member) => (
                  <UserAvatar
                    className="size-8 text-xs ring-2 ring-blue-700"
                    initials={member.initials}
                    key={member.id}
                    label={member.name}
                  />
                ))}
              </div>
              <span className="text-sm text-blue-100">
                {files.filter((file) => file.project === project.name).length}{" "}
                files
              </span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
