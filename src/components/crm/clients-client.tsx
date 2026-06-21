"use client";

import {
  Download,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { ClientHealthPanel } from "@/components/clients/client-health-panel";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  createClientRecord,
  deleteClientRecord,
  updateClientRecord,
} from "@/lib/actions";
import type { ActivityLogRecord, ClientRecord } from "@/lib/app-types";
import { formatCurrency } from "@/lib/utils";

type ClientsClientProps = {
  activityLogs: ActivityLogRecord[];
  clients: ClientRecord[];
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export function ClientsClient({ activityLogs, clients }: ClientsClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("revenue");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    startTransition(async () => {
      const result = editing
        ? await updateClientRecord({ ...payload, id: editing.id })
        : await createClientRecord(payload);

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to save client.");
        return;
      }

      setFeedback(result.message ?? "Client saved.");
      setModalOpen(false);
      setEditing(null);
      form.reset();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteClientRecord(id);
      setFeedback(result.message ?? result.error ?? null);
      router.refresh();
    });
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
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          type="button"
        >
          <Plus className="size-5" />
          Add Client
        </button>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

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
                className: "min-w-60",
                header: "Client name",
                key: "name",
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
                className: "hidden lg:table-cell whitespace-nowrap",
                header: "Company",
                key: "company",
                render: (client) => client.company,
              },
              {
                className: "hidden xl:table-cell",
                header: "Email",
                key: "email",
                render: (client) => client.email,
              },
              {
                className: "whitespace-nowrap",
                header: "Projects",
                key: "projects",
                render: (client) => (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                    {client.activeProjects}
                  </span>
                ),
              },
              {
                className: "whitespace-nowrap",
                header: "Revenue",
                key: "revenue",
                render: (client) => (
                  <span className="font-semibold text-slate-950">
                    {formatCurrency(client.revenue)}
                  </span>
                ),
              },
              {
                className: "whitespace-nowrap",
                header: "Status",
                key: "status",
                render: (client) => <StatusBadge>{client.status}</StatusBadge>,
              },
              {
                className: "w-28 text-right",
                header: "Actions",
                key: "actions",
                render: (client) => (
                  <div className="flex justify-end gap-2">
                    <button
                      aria-label={`Edit ${client.company}`}
                      className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => {
                        setEditing(client);
                        setModalOpen(true);
                      }}
                      type="button"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    <button
                      className="font-semibold text-rose-600 disabled:text-slate-300"
                      disabled={isPending}
                      onClick={() => handleDelete(client.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredClients}
            emptyState={
              <EmptyState
                description="Try a different search term or clear the status filter."
                title="No clients found"
              />
            }
            footer={
              <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredClients.length} of {clients.length} clients
                </span>
                <span className="font-semibold text-blue-700">
                  Supabase records
                </span>
              </div>
            }
            minWidth="min-w-[820px]"
          />
        </section>
        <ClientHealthPanel activityLogs={activityLogs} clients={clients} />
      </div>

      <Modal
        description="Save this client to your Supabase workspace."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={editing ? "Edit Client" : "Add Client"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Contact name
            </span>
            <input
              className={inputClass}
              defaultValue={editing?.name}
              name="name"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Company
            </span>
            <input
              className={inputClass}
              defaultValue={editing?.company}
              name="company"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className={inputClass}
              defaultValue={editing?.email}
              name="email"
              required
              type="email"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Revenue
              </span>
              <input
                className={inputClass}
                defaultValue={editing?.revenue ?? 0}
                min="0"
                name="totalRevenue"
                required
                type="number"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.status ?? "Active"}
                name="status"
              >
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-300"
              disabled={isPending}
              type="submit"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
