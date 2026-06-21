import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/app/(dashboard)/projects/[id]/project-detail-client";
import {
  activityLogs,
  files,
  invoices,
  projects,
  tasks,
  teamMembers,
} from "@/lib/mock-data";

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
  const projectFiles = files.filter((file) => file.project === project.name);
  const projectInvoices = invoices.filter(
    (invoice) => invoice.project === project.name,
  );
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

      <ProjectDetailClient
        activityLogs={activityLogs}
        assignees={assignees}
        initialTasks={projectTasks}
        project={project}
        projectFiles={projectFiles}
        projectInvoices={projectInvoices}
        teamMembers={teamMembers}
      />
    </div>
  );
}
