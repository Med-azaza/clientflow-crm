"use client";

import { FilePlus2, Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  type Invoice,
  invoices as initialInvoices,
  type Status,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [modalOpen, setModalOpen] = useState(false);

  const invoiceSummary = useMemo(() => {
    const statuses = ["Paid", "Pending", "Overdue", "Draft"] as const;

    return statuses.map((status) => ({
      label: status,
      value: formatCurrency(
        invoices
          .filter((invoice) => invoice.status === status)
          .reduce((total, invoice) => total + invoice.amount, 0),
      ),
      tone:
        status === "Paid"
          ? ("green" as const)
          : status === "Overdue"
            ? ("red" as const)
            : status === "Draft"
              ? ("amber" as const)
              : ("blue" as const),
    }));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return invoices
      .filter((invoice) => {
        const matchesQuery =
          invoice.id.toLowerCase().includes(normalizedQuery) ||
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

  const handleCreateInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextInvoice: Invoice = {
      id: `INV-2026-${String(invoices.length + 43).padStart(3, "0")}`,
      client: String(formData.get("client") ?? ""),
      project: String(formData.get("project") ?? ""),
      amount: Number(formData.get("amount") ?? 0),
      dueDate: String(formData.get("dueDate") ?? "Jul 15"),
      status: String(formData.get("status") ?? "Draft") as Status,
    };

    setInvoices((current) => [nextInvoice, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
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
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <FilePlus2 className="size-5" />
          Create Invoice
        </button>
      </div>

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
            key: "invoice",
            header: "Invoice ID",
            className: "whitespace-nowrap",
            render: (invoice) => (
              <span className="font-semibold text-slate-950">{invoice.id}</span>
            ),
          },
          {
            key: "client",
            header: "Client",
            className: "whitespace-nowrap",
            render: (invoice) => invoice.client,
          },
          {
            key: "project",
            header: "Project",
            className: "min-w-56",
            render: (invoice) => invoice.project,
          },
          {
            key: "amount",
            header: "Amount",
            className: "whitespace-nowrap",
            render: (invoice) => (
              <span className="font-semibold text-slate-950">
                {formatCurrency(invoice.amount)}
              </span>
            ),
          },
          {
            key: "due",
            header: "Due date",
            className: "whitespace-nowrap",
            render: (invoice) => invoice.dueDate,
          },
          {
            key: "status",
            header: "Status",
            className: "whitespace-nowrap",
            render: (invoice) => <StatusBadge>{invoice.status}</StatusBadge>,
          },
          {
            key: "action",
            header: "Action",
            className: "whitespace-nowrap",
            render: () => (
              <button className="font-semibold text-blue-700" type="button">
                View
              </button>
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
        description="Create a local demo invoice without connecting billing."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Create Invoice"
      >
        <form className="space-y-4" onSubmit={handleCreateInvoice}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Client
              </span>
              <input className={inputClass} name="client" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Project
              </span>
              <input className={inputClass} name="project" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Amount
              </span>
              <input
                className={inputClass}
                min="0"
                name="amount"
                required
                type="number"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Due date
              </span>
              <input
                className={inputClass}
                defaultValue="Jul 15"
                name="dueDate"
                required
              />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select className={inputClass} name="status">
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
              className="rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              type="submit"
            >
              Save Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
