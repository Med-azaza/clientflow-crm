import {
  BellRing,
  CreditCard,
  KeyRound,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { invoices, teamMembers } from "@/lib/mock-data";

const settingsTabs = [
  "Organization",
  "Team Members",
  "Roles & Permissions",
  "Billing & Subscription",
  "API Access",
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Settings
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Manage your organization&apos;s members, billing, and system
          preferences.
        </p>
      </div>

      <div className="flex gap-8 overflow-x-auto border-b border-slate-200">
        {settingsTabs.map((tab) => (
          <button
            className="whitespace-nowrap border-b-2 border-transparent px-1 pb-4 font-semibold text-slate-600 first:border-blue-700 first:text-blue-700"
            key={tab}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
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
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-300"
                    defaultValue="ClientFlow Inc."
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Tax ID / VAT
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-300"
                    placeholder="Optional"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Business Address
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-300"
                    defaultValue="1248 Business Cir, San Francisco, CA 94103"
                  />
                </label>
                <div className="md:col-span-2 md:text-right">
                  <button
                    className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-900"
                    type="button"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Team Members
                </h2>
                <p className="mt-1 text-slate-600">
                  Manage members and their system-wide permissions.
                </p>
              </div>
              <button
                className="hidden items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white sm:inline-flex"
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
                  render: (member) => (
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        className="size-9 text-xs"
                        initials={member.initials}
                        label={member.name}
                      />
                      <div>
                        <p className="font-semibold text-slate-950">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "role",
                  header: "Role",
                  render: (member) => (
                    <StatusBadge tone="blue">{member.role}</StatusBadge>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (member) => (
                    <StatusBadge>{member.status}</StatusBadge>
                  ),
                },
                {
                  key: "projects",
                  header: "Projects",
                  render: (member) => member.projects,
                },
              ]}
              data={teamMembers}
            />
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-950">
                Invoice History
              </h2>
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
                    <button
                      className="font-semibold text-blue-700"
                      type="button"
                    >
                      Download
                    </button>
                  ),
                },
              ]}
              data={invoices.slice(0, 3)}
            />
          </section>
        </section>

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
              <button
                className="text-sm font-semibold text-blue-700"
                type="button"
              >
                Edit
              </button>
            </div>
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <CreditCard className="size-8 text-slate-900" />
              <div>
                <p className="font-semibold text-slate-950">•••• 4242</p>
                <p className="text-sm text-slate-500">Expires 04/26</p>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-bold text-slate-950">
              Notification Preferences
            </h2>
            <div className="mt-5 space-y-4">
              {[
                ["Project approvals", BellRing],
                ["Role changes", ShieldCheck],
                ["API key activity", KeyRound],
              ].map(([label, Icon]) => (
                <label
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
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
      </div>
    </div>
  );
}
