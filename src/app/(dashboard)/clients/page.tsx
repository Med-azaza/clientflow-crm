"use client";

import { Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { ClientHealthPanel } from "@/components/clients/client-health-panel";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { type Client, clients as initialClients } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

function getInitials(value: string) {
  return value
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientsPage() {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("revenue");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clients
      .filter((client) => {
        const matchesQuery =
          client.name.toLowerCase().includes(normalizedQuery) ||
          client.company.toLowerCase().includes(normalizedQuery) ||
          client.email.toLowerCase().includes(normalizedQuery);
        const matchesStatus =
          statusFilter === "All" || client.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((first, second) => {
        if (sortBy === "lastContact") {
          return first.lastContact.localeCompare(second.lastContact);
        }

        return second.revenue - first.revenue;
      });
  }, [clients, query, sortBy, statusFilter]);

  const handleAddClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const company = String(formData.get("company") ?? "");
    const email = String(formData.get("email") ?? "");
    const revenue = Number(formData.get("revenue") ?? 0);
    const status = String(
      formData.get("status") ?? "Active",
    ) as Client["status"];

    const nextClient: Client = {
      id: `${company}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      company,
      email,
      activeProjects: 1,
      revenue,
      status,
      lastContact: "Just now",
      health: 86,
      avatar: getInitials(name),
      initials: getInitials(company),
    };

    setClients((current) => [nextClient, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Clients
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Manage client relationships and monitor account growth.
          </p>
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 sm:w-auto"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus className="size-5" />
          Add Client
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-6">
          <div className="card flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients..."
                type="search"
                value={query}
              />
            </label>
            <label className="relative">
              <span className="sr-only">Filter clients by status</span>
              <Filter className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-10 pl-11 font-semibold text-slate-800 outline-none lg:w-auto"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option>All</option>
                <option>Active</option>
                <option>Pending</option>
              </select>
            </label>
            <select
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none lg:w-auto"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <option value="revenue">Sort by revenue</option>
              <option value="lastContact">Sort by last contact</option>
            </select>
            <button
              aria-label="Export clients"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-700 lg:w-12"
              type="button"
            >
              <Download className="size-4" />
            </button>
          </div>

          <DataTable
            columns={[
              {
                key: "name",
                header: "Client name",
                className: "min-w-60",
                render: (client) => (
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      className="size-10 text-xs"
                      initials={client.avatar}
                      label={client.name}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">
                        {client.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {client.company}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "company",
                header: "Company",
                className: "hidden lg:table-cell whitespace-nowrap",
                render: (client) => client.company,
              },
              {
                key: "email",
                header: "Email",
                className: "hidden xl:table-cell",
                render: (client) => client.email,
              },
              {
                key: "projects",
                header: "Projects",
                className: "whitespace-nowrap",
                render: (client) => (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                    {client.activeProjects}
                  </span>
                ),
              },
              {
                key: "revenue",
                header: "Revenue",
                className: "whitespace-nowrap",
                render: (client) => (
                  <span className="font-semibold text-slate-950">
                    {formatCurrency(client.revenue)}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                className: "whitespace-nowrap",
                render: (client) => <StatusBadge>{client.status}</StatusBadge>,
              },
              {
                key: "last",
                header: "Last contact",
                className: "hidden 2xl:table-cell whitespace-nowrap",
                render: (client) => client.lastContact,
              },
              {
                key: "actions",
                header: "Actions",
                className: "w-20 text-right",
                render: (client) => (
                  <button
                    aria-label={`Open ${client.company} actions`}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    type="button"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                ),
              },
            ]}
            data={filteredClients}
            emptyState={
              <EmptyState
                description="Try a different search term or clear the status filter to see more clients."
                title="No clients found"
              />
            }
            footer={
              <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredClients.length} of {clients.length} clients
                </span>
                <span className="font-semibold text-blue-700">
                  Portfolio demo data
                </span>
              </div>
            }
            minWidth="min-w-[720px]"
          />
        </section>
        <ClientHealthPanel />
      </div>

      <Modal
        description="Add a frontend-only client record for this portfolio demo."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Add Client"
      >
        <form className="space-y-4" onSubmit={handleAddClient}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Contact name
            </span>
            <input className={inputClass} name="name" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Company
            </span>
            <input className={inputClass} name="company" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input className={inputClass} name="email" required type="email" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Revenue
              </span>
              <input
                className={inputClass}
                min="0"
                name="revenue"
                required
                type="number"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select className={inputClass} name="status">
                <option>Active</option>
                <option>Pending</option>
              </select>
            </label>
          </div>
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
              Save Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
