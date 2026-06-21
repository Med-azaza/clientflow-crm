"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { OrganizationMember } from "@/lib/app-types";

export function TeamWorkload({ members }: { members: OrganizationMember[] }) {
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">Team Workload</h2>
        <span className="text-sm font-semibold text-blue-700">Capacity</span>
      </div>
      <div className="mt-6 space-y-5">
        {members.slice(0, 4).map((member) => (
          <div className="flex items-center gap-4" key={member.id}>
            <UserAvatar initials={member.initials} label={member.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-semibold text-slate-900">
                  {member.name}
                </p>
                <p className="text-sm text-slate-500">{member.workload}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${member.workload}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
