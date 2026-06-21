"use client";

import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  HeartPulse,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { createMessageRecord, createTaskRecord } from "@/lib/actions";
import type {
  ActivityLogRecord,
  FileRecord,
  InvoiceRecord,
  MessageRecord,
  OrganizationMember,
  Priority,
  ProjectRecord,
  TaskRecord,
} from "@/lib/app-types";
import { formatCurrency } from "@/lib/utils";

const tabs = ["Overview", "Tasks", "Files", "Invoices", "Comments"] as const;
type Tab = (typeof tabs)[number];

type ProjectDetailClientProps = {
  activityLogs: ActivityLogRecord[];
  members: OrganizationMember[];
  project: ProjectRecord;
  projectFiles: FileRecord[];
  projectInvoices: InvoiceRecord[];
  projectMessages: MessageRecord[];
  projectTasks: TaskRecord[];
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export function ProjectDetailClient({
  activityLogs,
  members,
  project,
  projectFiles,
  projectInvoices,
  projectMessages,
  projectTasks,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const taskRows =
    activeTab === "Overview" ? projectTasks.slice(0, 4) : projectTasks;

  const openTasks = useMemo(
    () => projectTasks.filter((task) => task.status !== "Completed").length,
    [projectTasks],
  );
  const assignees = members.filter((member) =>
    project.assigneeIds.includes(member.userId),
  );

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    startTransition(async () => {
      const result = await createTaskRecord({
        ...payload,
        projectId: project.id,
      });

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to create task.");
        return;
      }

      setFeedback(result.message ?? "Task saved.");
      setModalOpen(false);
      form.reset();
      router.refresh();
    });
  };

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("projectId", project.id);
    formData.set("clientId", project.clientId ?? "");

    startTransition(async () => {
      const response = await fetch("/api/files/upload", {
        body: formData,
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setFeedback(result.error ?? "Unable to upload file.");
        return;
      }

      setFeedback("File uploaded.");
      setFileModalOpen(false);
      form.reset();
      router.refresh();
    });
  };

  const handleComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = comment.trim();

    if (!trimmed) {
      return;
    }

    startTransition(async () => {
      const result = await createMessageRecord({
        body: trimmed,
        clientId: project.clientId ?? "",
        projectId: project.id,
      });

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to add comment.");
        return;
      }

      setComment("");
      router.refresh();
    });
  };

  const taskTable = (
    <DataTable
      columns={[
        {
          className: "min-w-64",
          header: "Task",
          key: "task",
          render: (task) => (
            <div>
              <p className="font-semibold text-slate-950">{task.title}</p>
              <p className="mt-1 text-slate-500">{task.client}</p>
            </div>
          ),
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
          Add New Task
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
            onClick={() => setFileModalOpen(true)}
            type="button"
          >
            Upload File
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

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={`${formatCurrency(project.budgetUsed)} / ${formatCurrency(project.budget)}`}
          icon={DollarSign}
          label="Budget Used"
          tone="blue"
          value={`${project.budget ? Math.round((project.budgetUsed / project.budget) * 100) : 0}%`}
        />
        <MetricCard
          detail={project.dueDate}
          icon={CalendarDays}
          label="Deadline"
          tone="red"
          value={project.dueDate}
        />
        <MetricCard
          detail={`${openTasks} open / ${projectTasks.length} total`}
          icon={CheckCircle2}
          label="Open Tasks"
          tone="amber"
          value={String(openTasks)}
        />
        <MetricCard
          detail={`${project.progress}% complete`}
          icon={HeartPulse}
          label="Project Health"
          tone="green"
          value={project.progress >= 75 ? "Strong" : "Watch"}
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
                </div>
                <Link className="font-semibold text-blue-700" href="/tasks">
                  View All Tasks
                </Link>
              </div>
              {taskTable}
            </div>
          </section>
          <ProjectSidebar
            activityLogs={activityLogs}
            assignees={assignees}
            fileCount={projectFiles.length}
          />
        </div>
      ) : null}

      {activeTab === "Tasks" ? taskTable : null}
      {activeTab === "Files" ? (
        <DataTable
          columns={[
            {
              className: "min-w-64",
              header: "File",
              key: "file",
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
              header: "Uploaded by",
              key: "uploaded",
              render: (file) => file.uploadedBy,
            },
            { header: "Date", key: "date", render: (file) => file.date },
            {
              header: "Status",
              key: "status",
              render: (file) => <StatusBadge>{file.status}</StatusBadge>,
            },
          ]}
          data={projectFiles}
          emptyState={
            <EmptyState
              description="Upload a file to share project assets."
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
              header: "Invoice",
              key: "invoice",
              render: (invoice) => invoice.invoiceNumber,
            },
            {
              header: "Amount",
              key: "amount",
              render: (invoice) => formatCurrency(invoice.amount),
            },
            {
              header: "Due date",
              key: "due",
              render: (invoice) => invoice.dueDate,
            },
            {
              header: "Status",
              key: "status",
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
                className="rounded-2xl bg-blue-700 p-3 text-white disabled:bg-slate-300"
                disabled={isPending || !comment.trim()}
                type="submit"
              >
                <MessageSquare className="size-5" />
              </button>
            </form>
            <div className="mt-6 space-y-4">
              {projectMessages.map((item) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={item.id}>
                  <p className="text-slate-700">{item.body}</p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    {item.time}
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
        description="Create a task for this project."
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
              <select className={inputClass} name="priority">
                {(["High", "Urgent", "Medium", "Low"] as Priority[]).map(
                  (priority) => (
                    <option key={priority}>{priority}</option>
                  ),
                )}
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
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        description="Upload a file to this project."
        onClose={() => setFileModalOpen(false)}
        open={fileModalOpen}
        title="Upload File"
      >
        <form className="space-y-4" onSubmit={handleUpload}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Display name
            </span>
            <input className={inputClass} name="name" />
          </label>
          <input className={inputClass} name="file" required type="file" />
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700">
            <input
              className="size-5 accent-blue-700"
              name="sharedWithClient"
              type="checkbox"
            />
            Shared with client
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-300"
            disabled={isPending}
            type="submit"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Upload File
          </button>
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
  activityLogs: ActivityLogRecord[];
  assignees: OrganizationMember[];
  fileCount: number;
}) {
  return (
    <aside className="space-y-6">
      <section className="card p-6">
        <h2 className="text-2xl font-bold text-slate-950">Recent Activity</h2>
        <div className="mt-6 space-y-6 border-l border-slate-200 pl-6">
          {activityLogs.slice(0, 5).map((event) => (
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
