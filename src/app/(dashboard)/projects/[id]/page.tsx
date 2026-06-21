import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/app/(dashboard)/projects/[id]/project-detail-client";
import { getProjectWorkspaceData } from "@/lib/data";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjectWorkspaceData(id);

  if (!data.project) {
    notFound();
  }

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
        activityLogs={data.activityLogs}
        members={data.members}
        project={data.project}
        projectFiles={data.projectFiles}
        projectInvoices={data.projectInvoices}
        projectMessages={data.projectMessages}
        projectTasks={data.projectTasks}
      />
    </div>
  );
}
