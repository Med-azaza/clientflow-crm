import {
  CalendarDays,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { OrganizationMember, ProjectRecord } from "@/lib/app-types";
import { formatCurrency } from "@/lib/utils";

type ProjectCardProps = {
  members: OrganizationMember[];
  project: ProjectRecord;
};

export function ProjectCard({ members, project }: ProjectCardProps) {
  const assignees = members.filter((member) =>
    project.assigneeIds.includes(member.userId),
  );

  return (
    <article className="card p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge>{`${project.priority} Priority`}</StatusBadge>
        <button
          aria-label={`Open ${project.name} actions`}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          type="button"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>
      <Link
        className="mt-5 block text-lg font-semibold leading-7 text-slate-950 hover:text-blue-700"
        href={`/projects/${project.slug}`}
      >
        {project.name}
      </Link>
      <p className="mt-2 text-sm font-medium text-slate-500">
        {project.company}
      </p>

      {project.progress < 100 ? (
        <div className="mt-5">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            <span>Progress</span>
            <span className="text-blue-700">{project.progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
            Budget
          </p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(project.budget)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
            Due date
          </p>
          <p className="mt-1 flex items-center gap-1 font-semibold text-slate-950">
            <CalendarDays className="size-4 text-slate-400" />
            {project.dueDate}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="-space-x-2 flex">
          {assignees.map((member) => (
            <UserAvatar
              className="size-8 text-xs ring-2 ring-white"
              initials={member.initials}
              key={member.id}
              label={member.name}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-4" />
            {project.comments}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip className="size-4" />
            {project.files}
          </span>
        </div>
      </div>
    </article>
  );
}
