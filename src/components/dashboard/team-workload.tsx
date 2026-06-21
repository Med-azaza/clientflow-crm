"use client";

import { type FormEvent, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  teamMembers as initialTeamMembers,
  type TeamMember,
} from "@/lib/mock-data";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamWorkload() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const role = String(formData.get("role") ?? "Project Manager");

    const nextMember: TeamMember = {
      id: `member-${Date.now()}`,
      name,
      role,
      avatar: initialsFor(name),
      initials: initialsFor(name),
      workload: 24,
      projects: 1,
      status: "Active",
    };

    setTeamMembers((current) => [nextMember, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
  };

  return (
    <>
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Team Workload</h2>
          <span className="text-sm font-semibold text-blue-700">Capacity</span>
        </div>
        <div className="mt-6 space-y-5">
          {teamMembers.slice(0, 4).map((member) => (
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
        <button
          className="mt-6 w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          + Add Member
        </button>
      </section>

      <Modal
        description="Add a local team member to the workload preview."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Add Member"
      >
        <form className="space-y-4" onSubmit={handleAddMember}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input className={inputClass} name="name" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select className={inputClass} name="role">
              <option>Project Manager</option>
              <option>Account Lead</option>
              <option>Design Lead</option>
              <option>Operations Lead</option>
            </select>
          </label>
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
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
