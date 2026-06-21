import { Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { ClientHealthPanel } from "@/components/clients/client-health-panel";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { clients } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Clients
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage client relationships and monitor account growth.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
          type="button"
        >
          <Plus className="size-5" />
          Add Client
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <div className="card flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none focus:border-blue-300"
                placeholder="Search clients..."
                type="search"
              />
            </label>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800"
              type="button"
            >
              <Filter className="size-4" />
              Filter
            </button>
            <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none">
              <option>Sort by revenue</option>
              <option>Sort by last contact</option>
            </select>
            <button
              aria-label="Export clients"
              className="inline-flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
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
                render: (client) => (
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      className="size-10 text-xs"
                      initials={client.avatar}
                      label={client.name}
                    />
                    <div>
                      <p className="font-semibold text-slate-950">
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-500">{client.company}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "company",
                header: "Company",
                render: (client) => client.company,
              },
              {
                key: "email",
                header: "Email",
                render: (client) => client.email,
              },
              {
                key: "projects",
                header: "Active projects",
                render: (client) => (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                    {client.activeProjects}
                  </span>
                ),
              },
              {
                key: "revenue",
                header: "Total revenue",
                render: (client) => (
                  <span className="font-semibold text-slate-950">
                    {formatCurrency(client.revenue)}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (client) => <StatusBadge>{client.status}</StatusBadge>,
              },
              {
                key: "last",
                header: "Last contact",
                render: (client) => client.lastContact,
              },
              {
                key: "actions",
                header: "Actions",
                render: (client) => (
                  <button
                    aria-label={`Open ${client.company} actions`}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                    type="button"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                ),
              },
            ]}
            data={clients}
            footer={
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Showing {clients.length} of 24 clients</span>
                <span className="font-semibold text-blue-700">Page 1 of 3</span>
              </div>
            }
          />
        </section>
        <ClientHealthPanel />
      </div>
    </div>
  );
}
