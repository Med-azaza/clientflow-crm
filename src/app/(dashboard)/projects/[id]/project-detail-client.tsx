"use client";

import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  HeartPulse,
  MessageSquare,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import type {
  ActivityLog,
  ClientFile,
  Invoice,
  Priority,
  Project,
  Task,
  TeamMember,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const tabs = ["Overview", "Tasks", "Files", "Invoices", "Comments"] as const;

type Tab = (typeof tabs)[number];

type ProjectDetailClientProps = {
  project: Project;
  initialTasks: Task[];
  projectFiles: ClientFile[];
  projectInvoices: Invoice[];
  assignees: TeamMember[];
  teamMembers: TeamMember[];
  activityLogs: ActivityLog[];
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export function ProjectDetailClient({
  project,
  initialTasks,
  projectFiles,
  projectInvoices,
  assignees,
  teamMembers,
  activityLogs,
}: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    "Final homepage approval checklist is ready for review.",
    "Client asked to keep the conversion notes attached to the design file.",
  ]);

  const taskRows = activeTab === "Overview" ? tasks.slice(0, 4) : tasks;

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== "Completed").length,
    [tasks],
  );

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "");
    const priority = String(formData.get("priority") ?? "High") as Priority;
    const assigneeId = String(formData.get("assigneeId") ?? "anna");

    setTasks((current) => [
      {
        id: `task-${Date.now()}`,
        title,
        project: project.name,
        client: project.company,
        assigneeId,
        priority,
        status: "Pending",
        dueDate: "This week",
      },
      ...current,
    ]);
    setModalOpen(false);
    event.currentTarget.reset();
  };

  const handleComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = comment.trim();

    if (!trimmed) {
      return;
    }

    setComments((current) => [trimmed, ...current]);
    setComment("");
  };

  const taskTable = (
    <DataTable
      columns={[
        {
          key: "task",
          header: "Task",
          className: "min-w-64",
          render: (task) => (
            <div>
              <p className="font-semibold text-slate-950">{task.title}</p>
              <p className="mt-1 text-slate-500">{task.client}</p>
            </div>
          ),
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
          key: "actions",
          header: "",
          className: "w-16 text-right",
          render: (task) => (
            <button
              aria-label={`Open ${task.title} actions`}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              type="button"
            >
              <MoreHorizontal className="size-4" />
            </button>
          ),
        },
      ]}
      data={taskRows}
      emptyState={
        <EmptyState
          description="Add a task to start building the sprint plan."
          title="No tasks yet"
        />
      }
      footer={
        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus className="size-5" />
          Add New Task to Sprint
        </button>
      }
      minWidth="min-w-[760px]"
    />
  );

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
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
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            type="button"
          >
            Edit Details
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800"
            onClick={() => setModalOpen(true)}
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
          detail={`${openTasks} open / ${tasks.length} total`}
          icon={CheckCircle2}
          label="Open Tasks"
          tone="amber"
          value={String(openTasks)}
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
          {tabs.map((tab) => (
            <button
              className={`whitespace-nowrap border-b-2 px-1 pb-4 font-semibold transition ${
                activeTab === tab
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-slate-600 hover:text-slate-950"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 space-y-6">
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl font-bold text-slate-950">
                    Current Sprint
                  </h2>
                  <span className="text-slate-500">S2 - Wave 1</span>
                </div>
                <Link className="font-semibold text-blue-700" href="/tasks">
                  View All Tasks
                </Link>
              </div>
              {taskTable}
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

          <ProjectSidebar
            activityLogs={activityLogs}
            assignees={assignees}
            fileCount={projectFiles.length}
          />
        </div>
      ) : null}

      {activeTab === "Tasks" ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-950">Project Tasks</h2>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white"
              onClick={() => setModalOpen(true)}
              type="button"
            >
              <Plus className="size-5" />
              Add Task
            </button>
          </div>
          {taskTable}
        </section>
      ) : null}

      {activeTab === "Files" ? (
        <DataTable
          columns={[
            {
              key: "file",
              header: "File",
              className: "min-w-64",
              render: (file) => (
                <div>
                  <p className="font-semibold text-slate-950">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {file.type} / {file.size}
                  </p>
                </div>
              ),
            },
            {
              key: "uploaded",
              header: "Uploaded by",
              render: (file) => file.uploadedBy,
            },
            {
              key: "date",
              header: "Date",
              className: "whitespace-nowrap",
              render: (file) => file.date,
            },
            {
              key: "status",
              header: "Status",
              className: "whitespace-nowrap",
              render: (file) => <StatusBadge>{file.status}</StatusBadge>,
            },
          ]}
          data={projectFiles}
          emptyState={
            <EmptyState
              description="Shared project files will appear here."
              icon={FileText}
              title="No files uploaded"
            />
          }
        />
      ) : null}

      {activeTab === "Invoices" ? (
        <DataTable
          columns={[
            {
              key: "invoice",
              header: "Invoice",
              render: (invoice) => invoice.id,
            },
            {
              key: "amount",
              header: "Amount",
              render: (invoice) => formatCurrency(invoice.amount),
            },
            {
              key: "due",
              header: "Due date",
              render: (invoice) => invoice.dueDate,
            },
            {
              key: "status",
              header: "Status",
              render: (invoice) => <StatusBadge>{invoice.status}</StatusBadge>,
            },
          ]}
          data={projectInvoices}
          emptyState={
            <EmptyState
              description="Invoices connected to this project will appear here."
              title="No invoices found"
            />
          }
        />
      ) : null}

      {activeTab === "Comments" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Project Comments
            </h2>
            <form className="mt-5 flex gap-3" onSubmit={handleComment}>
              <input
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-300"
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a project note..."
                value={comment}
              />
              <button
                aria-label="Add comment"
                className="rounded-2xl bg-blue-700 p-3 text-white"
                type="submit"
              >
                <MessageSquare className="size-5" />
              </button>
            </form>
            <div className="mt-6 space-y-4">
              {comments.map((item) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={item}>
                  <p className="text-slate-700">{item}</p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Just now
                  </p>
                </div>
              ))}
            </div>
          </div>
          <ProjectSidebar
            activityLogs={activityLogs}
            assignees={assignees}
            fileCount={projectFiles.length}
          />
        </section>
      ) : null}

      <Modal
        description="Create a local task for this project demo."
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
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function ProjectSidebar({
  activityLogs,
  assignees,
  fileCount,
}: {
  activityLogs: ActivityLog[];
  assignees: TeamMember[];
  fileCount: number;
}) {
  return (
    <aside className="space-y-6">
      <section className="card p-6">
        <h2 className="text-2xl font-bold text-slate-950">Recent Activity</h2>
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
          <span className="text-sm text-blue-100">{fileCount} files</span>
        </div>
      </section>
    </aside>
  );
}
