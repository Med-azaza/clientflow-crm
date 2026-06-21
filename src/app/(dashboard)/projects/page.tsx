import { CalendarDays, LayoutGrid, List, Plus } from "lucide-react";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { UserAvatar } from "@/components/ui/user-avatar";
import { projects, teamMembers } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <LayoutGrid className="size-7 text-blue-700" />
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              Projects Board
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-600">
            Track agency workflow and manage project lifecycles.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="-space-x-2 hidden sm:flex">
            {teamMembers.slice(0, 3).map((member) => (
              <UserAvatar
                className="size-9 text-xs ring-2 ring-white"
                initials={member.initials}
                key={member.id}
                label={member.name}
              />
            ))}
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
            type="button"
          >
            <Plus className="size-5" />
            New Project
          </button>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none">
            <option>Client: All Clients</option>
            <option>Client: Acme Corp</option>
          </select>
          <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none">
            <option>Priority: High</option>
            <option>Priority: Urgent</option>
            <option>Priority: All</option>
          </select>
          <button
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800"
            type="button"
          >
            <CalendarDays className="size-4" />
            Deadline: This Month
          </button>
        </div>
        <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-blue-700 shadow-sm"
            type="button"
          >
            <LayoutGrid className="size-4" />
            Kanban
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-slate-600"
            type="button"
          >
            <List className="size-4" />
            List
          </button>
        </div>
      </div>

      <KanbanBoard projects={projects} />
    </div>
  );
}
