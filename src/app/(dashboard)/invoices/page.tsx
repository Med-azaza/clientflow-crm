import { FilePlus2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { invoices } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const invoiceSummary = [
  { label: "Paid", value: "$4.8k", tone: "green" as const },
  { label: "Pending", value: "$4.2k", tone: "blue" as const },
  { label: "Overdue", value: "$8.9k", tone: "red" as const },
  { label: "Draft", value: "$11k", tone: "amber" as const },
];

export default function InvoicesPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Invoices
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Track billing status, due dates, and client payments.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
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

      <DataTable
        columns={[
          {
            key: "invoice",
            header: "Invoice ID",
            render: (invoice) => (
              <span className="font-semibold text-slate-950">{invoice.id}</span>
            ),
          },
          {
            key: "client",
            header: "Client",
            render: (invoice) => invoice.client,
          },
          {
            key: "project",
            header: "Project",
            render: (invoice) => invoice.project,
          },
          {
            key: "amount",
            header: "Amount",
            render: (invoice) => (
              <span className="font-semibold text-slate-950">
                {formatCurrency(invoice.amount)}
              </span>
            ),
          },
          {
            key: "due",
            header: "Due date",
            render: (invoice) => invoice.dueDate,
          },
          {
            key: "status",
            header: "Status",
            render: (invoice) => <StatusBadge>{invoice.status}</StatusBadge>,
          },
          {
            key: "action",
            header: "Action",
            render: () => (
              <button className="font-semibold text-blue-700" type="button">
                View
              </button>
            ),
          },
        ]}
        data={invoices}
      />
    </div>
  );
}
