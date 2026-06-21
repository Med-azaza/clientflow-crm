"use client";

import {
  BellRing,
  CreditCard,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  updateMemberRole,
  updateOrganization,
  updateProfile,
} from "@/lib/actions";
import type {
  InvoiceRecord,
  Organization,
  OrganizationMember,
  Profile,
  Role,
} from "@/lib/app-types";

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

export function SettingsClient({
  invoices,
  members,
  organization,
  profile,
  role,
}: {
  invoices: InvoiceRecord[];
  members: OrganizationMember[];
  organization: Organization;
  profile: Profile;
  role: Role;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("Organization");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (
    action: () => Promise<{ ok: boolean; message?: string; error?: string }>,
  ) => {
    startTransition(async () => {
      const result = await action();
      setFeedback(result.message ?? result.error ?? null);
      router.refresh();
    });
  };

  const handleOrganization = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    run(() => updateOrganization(payload));
  };

  const handleProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    run(() => updateProfile(payload));
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Manage your organization&apos;s members, billing, and preferences.
          </p>
        </div>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

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
          {activeTab === "Organization" ? (
            <section className="card overflow-hidden">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-950">
                  Organization Profile
                </h2>
                <p className="mt-1 text-slate-600">
                  Update workspace details and your user profile.
                </p>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-2">
                <form className="space-y-6" onSubmit={handleOrganization}>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Organization Name
                    </span>
                    <input
                      className={inputClass}
                      defaultValue={organization.name}
                      name="name"
                      type="text"
                    />
                  </label>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:bg-slate-300"
                    disabled={isPending || !["owner", "admin"].includes(role)}
                    type="submit"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Save Organization
                  </button>
                </form>
                <form className="space-y-6" onSubmit={handleProfile}>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Full Name
                    </span>
                    <input
                      className={inputClass}
                      defaultValue={profile.fullName}
                      name="fullName"
                      type="text"
                    />
                  </label>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-900 disabled:text-slate-400"
                    disabled={isPending}
                    type="submit"
                  >
                    Save Profile
                  </button>
                </form>
              </div>
            </section>
          ) : null}
          {activeTab === "Team Members" ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Team Members
                </h2>
                <p className="mt-1 text-slate-600">
                  Manage members and their system-wide permissions.
                </p>
              </div>
              <DataTable
                columns={[
                  {
                    className: "min-w-64",
                    header: "Member",
                    key: "member",
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
                          <p className="text-xs text-slate-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    className: "whitespace-nowrap",
                    header: "Role",
                    key: "role",
                    render: (member) => (
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold capitalize"
                        defaultValue={member.role}
                        disabled={
                          isPending || !["owner", "admin"].includes(role)
                        }
                        onChange={(event) =>
                          run(() =>
                            updateMemberRole({
                              role: event.target.value,
                              userId: member.userId,
                            }),
                          )
                        }
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                        <option value="client">client</option>
                      </select>
                    ),
                  },
                  {
                    className: "whitespace-nowrap",
                    header: "Status",
                    key: "status",
                    render: (member) => (
                      <StatusBadge>{member.status}</StatusBadge>
                    ),
                  },
                  {
                    className: "whitespace-nowrap",
                    header: "Tasks",
                    key: "projects",
                    render: (member) => member.projects,
                  },
                ]}
                data={members}
              />
            </section>
          ) : null}
          {activeTab === "Roles & Permissions" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {["owner", "admin", "member", "client"].map((item) => (
                <article className="card p-6" key={item}>
                  <ShieldCheck className="size-7 text-blue-700" />
                  <h2 className="mt-4 text-xl font-bold capitalize text-slate-950">
                    {item}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item === "owner"
                      ? "Owns workspace settings and all records."
                      : item === "admin"
                        ? "Can manage workspace records and members."
                        : item === "member"
                          ? "Can manage CRM project operations."
                          : "Can view client-facing workspace records."}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-blue-700">
                    {members.filter((member) => member.role === item).length}{" "}
                    assigned
                  </p>
                </article>
              ))}
            </div>
          ) : null}
          {activeTab === "Billing & Subscription" ? (
            <BillingPanel invoices={invoices} />
          ) : null}
          {activeTab === "API Access" ? <ApiPanel /> : null}
        </section>

        <SettingsSidebar members={members} />
      </div>
    </div>
  );
}

function BillingPanel({ invoices }: { invoices: InvoiceRecord[] }) {
  return (
    <section className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={CreditCard}
          label="Current Plan"
          tone="blue"
          value="Demo"
        />
        <MetricCard
          icon={CreditCard}
          label="Monthly Spend"
          tone="green"
          value="$0"
        />
        <MetricCard
          icon={CreditCard}
          label="Seats Used"
          tone="amber"
          value="Demo"
        />
      </div>
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-950">Billing Preview</h2>
          <p className="mt-1 text-slate-600">
            Billing is demo-only. Stripe is not connected in this MVP.
          </p>
        </div>
        <DataTable
          columns={[
            {
              header: "Invoice",
              key: "invoice",
              render: (invoice) => invoice.invoiceNumber,
            },
            {
              header: "Date",
              key: "date",
              render: (invoice) => invoice.dueDate,
            },
            {
              header: "Amount",
              key: "amount",
              render: (invoice) => `$${invoice.amount.toLocaleString()}`,
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
            API keys are disabled until a dedicated API key service is added.
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
        Supabase Auth and RLS protect the current app. Public API key issuance
        is intentionally out of scope for this MVP.
      </div>
    </section>
  );
}

function SettingsSidebar({ members }: { members: OrganizationMember[] }) {
  return (
    <aside className="space-y-6">
      <section className="rounded-[24px] bg-blue-700 p-6 text-white shadow-xl shadow-blue-900/15">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
          Current Plan
        </p>
        <h2 className="mt-2 text-3xl font-bold">Demo Billing</h2>
        <div className="mt-8 space-y-5">
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Active Members</span>
              <span>{members.length}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div className="h-full w-3/4 rounded-full bg-white" />
            </div>
          </div>
        </div>
        <button
          className="mt-8 w-full rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700"
          disabled
          type="button"
        >
          Stripe Not Connected
        </button>
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
