"use client";

import { FilePlus2, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  createInvoiceRecord,
  deleteInvoiceRecord,
  markInvoicePaid,
  updateInvoiceRecord,
} from "@/lib/actions";
import type {
  ClientRecord,
  InvoiceRecord,
  ProjectRecord,
} from "@/lib/app-types";
import { formatCurrency } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export function InvoicesClient({
  clients,
  invoices,
  projects,
}: {
  clients: ClientRecord[];
  invoices: InvoiceRecord[];
  projects: ProjectRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const invoiceSummary = useMemo(() => {
    const statuses = ["Paid", "Pending", "Overdue", "Draft"] as const;

    return statuses.map((status) => ({
      label: status,
      tone:
        status === "Paid"
          ? ("green" as const)
          : status === "Overdue"
            ? ("red" as const)
            : status === "Draft"
              ? ("amber" as const)
              : ("blue" as const),
      value: formatCurrency(
        invoices
          .filter((invoice) => invoice.status === status)
          .reduce((total, invoice) => total + invoice.amount, 0),
      ),
    }));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return invoices
      .filter((invoice) => {
        const matchesQuery =
          invoice.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
          invoice.client.toLowerCase().includes(normalizedQuery) ||
          invoice.project.toLowerCase().includes(normalizedQuery);
        const matchesStatus =
          statusFilter === "All" || invoice.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((first, second) => {
        if (sortBy === "amount") {
          return second.amount - first.amount;
        }

        return first.dueDate.localeCompare(second.dueDate);
      });
  }, [invoices, query, sortBy, statusFilter]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    startTransition(async () => {
      const result = editing
        ? await updateInvoiceRecord({ ...payload, id: editing.id })
        : await createInvoiceRecord(payload);

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to save invoice.");
        return;
      }

      setFeedback(result.message ?? "Invoice saved.");
      setModalOpen(false);
      setEditing(null);
      form.reset();
      router.refresh();
    });
  };

  const run = (
    action: () => Promise<{ ok: boolean; message?: string; error?: string }>,
  ) => {
    startTransition(async () => {
      const result = await action();
      setFeedback(result.message ?? result.error ?? null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Invoices
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Track billing status, due dates, and client payments.
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
          <FilePlus2 className="size-5" />
          Create Invoice
        </button>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {invoiceSummary.map((item) => (
          <MetricCard
            icon={FilePlus2}
            key={item.label}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </div>

      <div className="card grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search invoices..."
            type="search"
            value={query}
          />
        </label>
        <select
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none"
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
        >
          <option value="All">Status: All</option>
          {["Paid", "Pending", "Overdue", "Draft"].map((status) => (
            <option key={status} value={status}>
              Status: {status}
            </option>
          ))}
        </select>
        <select
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 outline-none"
          onChange={(event) => setSortBy(event.target.value)}
          value={sortBy}
        >
          <option value="dueDate">Sort by due date</option>
          <option value="amount">Sort by amount</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            className: "whitespace-nowrap",
            header: "Invoice ID",
            key: "invoice",
            render: (invoice) => (
              <span className="font-semibold text-slate-950">
                {invoice.invoiceNumber}
              </span>
            ),
          },
          {
            className: "whitespace-nowrap",
            header: "Client",
            key: "client",
            render: (invoice) => invoice.client,
          },
          {
            className: "min-w-56",
            header: "Project",
            key: "project",
            render: (invoice) => invoice.project,
          },
          {
            className: "whitespace-nowrap",
            header: "Amount",
            key: "amount",
            render: (invoice) => (
              <span className="font-semibold text-slate-950">
                {formatCurrency(invoice.amount)}
              </span>
            ),
          },
          {
            className: "whitespace-nowrap",
            header: "Status",
            key: "status",
            render: (invoice) => <StatusBadge>{invoice.status}</StatusBadge>,
          },
          {
            className: "whitespace-nowrap",
            header: "Action",
            key: "action",
            render: (invoice) => (
              <div className="flex gap-3">
                <button
                  className="font-semibold text-blue-700"
                  onClick={() => {
                    setEditing(invoice);
                    setModalOpen(true);
                  }}
                  type="button"
                >
                  Edit
                </button>
                {invoice.status !== "Paid" ? (
                  <button
                    className="font-semibold text-emerald-700"
                    disabled={isPending}
                    onClick={() => run(() => markInvoicePaid(invoice.id))}
                    type="button"
                  >
                    Paid
                  </button>
                ) : null}
                <button
                  className="font-semibold text-rose-600"
                  disabled={isPending}
                  onClick={() => run(() => deleteInvoiceRecord(invoice.id))}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        data={filteredInvoices}
        emptyState={
          <EmptyState
            description="Try another search term or status filter."
            title="No invoices found"
          />
        }
      />

      <Modal
        description="Create or update a workspace invoice record."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={editing ? "Edit Invoice" : "Create Invoice"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Invoice number
              </span>
              <input
                className={inputClass}
                defaultValue={editing?.invoiceNumber}
                name="invoiceNumber"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Amount
              </span>
              <input
                className={inputClass}
                defaultValue={editing?.amount ?? 0}
                min="0"
                name="amount"
                required
                type="number"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Client
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.clientId ?? ""}
                name="clientId"
              >
                <option value="">No client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Project
              </span>
              <select
                className={inputClass}
                defaultValue={editing?.projectId ?? ""}
                name="projectId"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              className={inputClass}
              defaultValue={editing?.status ?? "Draft"}
              name="status"
            >
              <option>Draft</option>
              <option>Pending</option>
              <option>Paid</option>
              <option>Overdue</option>
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-300"
              disabled={isPending}
              type="submit"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
