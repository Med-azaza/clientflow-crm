import { Filter, Search, Upload } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { files, fileTypeIcons } from "@/lib/mock-data";

export default function FilesPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Files
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage shared client assets, briefs, invoices, and project files.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15"
          type="button"
        >
          <Upload className="size-5" />
          Upload File
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none focus:border-blue-300"
            placeholder="Search files..."
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
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {files.map((file) => {
          const Icon =
            fileTypeIcons[file.type as keyof typeof fileTypeIcons] ?? Upload;

          return (
            <article className="card p-5" key={file.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Icon className="size-6" />
                </div>
                <StatusBadge>{file.status}</StatusBadge>
              </div>
              <h2 className="mt-5 font-bold text-slate-950">{file.name}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {file.type} • {file.size}
              </p>
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Project:</span>{" "}
                  {file.project}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Client:</span>{" "}
                  {file.client}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">
                    Uploaded:
                  </span>{" "}
                  {file.uploadedBy} on {file.date}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
