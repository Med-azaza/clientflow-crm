"use client";

import {
  BellRing,
  CreditCard,
  KeyRound,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  teamMembers as initialTeamMembers,
  invoices,
  type TeamMember,
} from "@/lib/mock-data";

const settingsTabs = [
  "Organization",
  "Team Members",
  "Roles & Permissions",
  "Billing & Subscription",
  "API Access",
] as const;

type SettingsTab = (typeof settingsTabs)[number];

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Organization");
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
      workload: 18,
      projects: 1,
      status: "Active",
    };

    setTeamMembers((current) => [nextMember, ...current]);
    setActiveTab("Team Members");
    setModalOpen(false);
    event.currentTarget.reset();
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Manage your organization&apos;s members, billing, and system
            preferences.
          </p>
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 sm:w-auto"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus className="size-5" />
          Add Member
        </button>
      </div>

      <div className="flex gap-8 overflow-x-auto border-b border-slate-200">
        {settingsTabs.map((tab) => (
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-6">
          {activeTab === "Organization" ? <OrganizationPanel /> : null}
          {activeTab === "Team Members" ? (
            <TeamMembersPanel
              onAddMember={() => setModalOpen(true)}
              teamMembers={teamMembers}
            />
          ) : null}
          {activeTab === "Roles & Permissions" ? (
            <RolesPanel teamMembers={teamMembers} />
          ) : null}
          {activeTab === "Billing & Subscription" ? <BillingPanel /> : null}
          {activeTab === "API Access" ? <ApiPanel /> : null}
        </section>

        <SettingsSidebar />
      </div>

      <Modal
        description="Invite a local mock teammate for this portfolio demo."
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
    </div>
  );
}

function OrganizationPanel() {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Organization Profile
        </h2>
        <p className="mt-1 text-slate-600">
          Update your company details and visual identity.
        </p>
      </div>
      <div className="grid gap-5 p-6 md:grid-cols-[140px_minmax(0,1fr)]">
        <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
          <Plus className="size-7" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Company Name
            </span>
            <input
              className={inputClass}
              defaultValue="ClientFlow Inc."
              type="text"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Tax ID / VAT
            </span>
            <input className={inputClass} placeholder="Optional" type="text" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Business Address
            </span>
            <input
              className={inputClass}
              defaultValue="1248 Business Cir, San Francisco, CA 94103"
              type="text"
            />
          </label>
          <div className="md:col-span-2 md:text-right">
            <button
              className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-200"
              type="button"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamMembersPanel({
  teamMembers,
  onAddMember,
}: {
  teamMembers: TeamMember[];
  onAddMember: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Team Members</h2>
          <p className="mt-1 text-slate-600">
            Manage members and their system-wide permissions.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white"
          onClick={onAddMember}
          type="button"
        >
          <Plus className="size-5" />
          Add Member
        </button>
      </div>
      <DataTable
        columns={[
          {
            key: "member",
            header: "Member",
            className: "min-w-64",
            render: (member) => (
              <div className="flex items-center gap-3">
                <UserAvatar
                  className="size-9 text-xs"
                  initials={member.initials}
                  label={member.name}
                />
                <div>
                  <p className="font-semibold text-slate-950">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            className: "whitespace-nowrap",
            render: (member) => (
              <StatusBadge tone="blue">{member.role}</StatusBadge>
            ),
          },
          {
            key: "status",
            header: "Status",
            className: "whitespace-nowrap",
            render: (member) => <StatusBadge>{member.status}</StatusBadge>,
          },
          {
            key: "projects",
            header: "Projects",
            className: "whitespace-nowrap",
            render: (member) => member.projects,
          },
        ]}
        data={teamMembers}
      />
    </section>
  );
}

function RolesPanel({ teamMembers }: { teamMembers: TeamMember[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {["Admin", "Manager", "Contributor"].map((role, index) => (
        <article className="card p-6" key={role}>
          <ShieldCheck className="size-7 text-blue-700" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">{role}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {index === 0
              ? "Full access to workspace settings, billing, and team controls."
              : index === 1
                ? "Can manage projects, clients, tasks, and shared files."
                : "Can collaborate on assigned projects and conversations."}
          </p>
          <p className="mt-5 text-sm font-semibold text-blue-700">
            {teamMembers.filter((member) => member.projects > index).length}{" "}
            members assigned
          </p>
        </article>
      ))}
    </div>
  );
}

function BillingPanel() {
  return (
    <section className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={CreditCard}
          label="Current Plan"
          tone="blue"
          value="Pro Business"
        />
        <MetricCard
          icon={CreditCard}
          label="Monthly Spend"
          tone="green"
          value="$149"
        />
        <MetricCard
          icon={CreditCard}
          label="Seats Used"
          tone="amber"
          value="42 / 50"
        />
      </div>
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-950">Invoice History</h2>
        </div>
        <DataTable
          columns={[
            {
              key: "invoice",
              header: "Invoice",
              render: (invoice) => invoice.id,
            },
            {
              key: "date",
              header: "Date",
              render: (invoice) => invoice.dueDate,
            },
            {
              key: "amount",
              header: "Amount",
              render: (invoice) => `$${invoice.amount.toLocaleString()}`,
            },
            {
              key: "action",
              header: "Action",
              render: () => (
                <button className="font-semibold text-blue-700" type="button">
                  Download
                </button>
              ),
            },
          ]}
          data={invoices.slice(0, 3)}
        />
      </section>
    </section>
  );
}

function ApiPanel() {
  return (
    <section className="card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">API Access</h2>
          <p className="mt-1 text-slate-600">
            Demo API keys are disabled until a backend is connected.
          </p>
        </div>
        <button
          className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-500"
          disabled
          type="button"
        >
          Generate Key
        </button>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        ClientFlow is currently a mock-data portfolio demo. API access can be
        enabled when authentication and Supabase are added.
      </div>
    </section>
  );
}

function SettingsSidebar() {
  return (
    <aside className="space-y-6">
      <section className="rounded-[24px] bg-blue-700 p-6 text-white shadow-xl shadow-blue-900/15">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
          Current Plan
        </p>
        <h2 className="mt-2 text-3xl font-bold">Pro Business</h2>
        <div className="mt-8 space-y-5">
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Active Members</span>
              <span>42 / 50</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div className="h-full w-[84%] rounded-full bg-white" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Storage Capacity</span>
              <span>15.2 GB / 20 GB</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div className="h-full w-[76%] rounded-full bg-white" />
            </div>
          </div>
        </div>
        <button
          className="mt-8 w-full rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700"
          type="button"
        >
          Manage Subscription
        </button>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-950">Payment Method</h2>
          <button className="text-sm font-semibold text-blue-700" type="button">
            Edit
          </button>
        </div>
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <CreditCard className="size-8 text-slate-900" />
          <div>
            <p className="font-semibold text-slate-950">**** 4242</p>
            <p className="text-sm text-slate-500">Expires 04/26</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-bold text-slate-950">Notification Preferences</h2>
        <div className="mt-5 space-y-4">
          {[
            ["Project approvals", BellRing],
            ["Role changes", ShieldCheck],
            ["API key activity", KeyRound],
          ].map(([label, Icon]) => (
            <label
              className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
              key={String(label)}
            >
              <span className="flex items-center gap-3 font-semibold text-slate-700">
                <Icon className="size-5 text-blue-700" />
                {label as string}
              </span>
              <input
                className="size-5 accent-blue-700"
                defaultChecked
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </section>
    </aside>
  );
}
