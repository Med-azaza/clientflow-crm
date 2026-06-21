import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/lib/mock-data";

const columns: Array<Project["column"]> = [
  "Planning",
  "In Progress",
  "Review",
  "Completed",
];

export function KanbanBoard({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-4">
      {columns.map((column) => {
        const items = projects.filter((project) => project.column === column);

        return (
          <section className="min-w-0" key={column}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-blue-600" />
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">
                  {column}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {items.length}
                </span>
              </div>
              <button
                aria-label={`Add ${column} project`}
                className="rounded-full p-1 text-slate-500 hover:bg-white"
                type="button"
              >
                <Plus className="size-5" />
              </button>
            </div>
            <div className="space-y-5">
              {items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
