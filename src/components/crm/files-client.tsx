"use client";

import {
  FileArchive,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteFileRecord, toggleFileSharing } from "@/lib/actions";
import type { ClientRecord, FileRecord, ProjectRecord } from "@/lib/app-types";

const fileTypeIcons = {
  Archive: FileArchive,
  PDF: FileText,
  Spreadsheet: FileSpreadsheet,
  Video: Upload,
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export function FilesClient({
  clients,
  files,
  projects,
}: {
  clients: ClientRecord[];
  files: FileRecord[];
  projects: ProjectRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileTypes = useMemo(
    () => ["All", ...Array.from(new Set(files.map((file) => file.type)))],
    [files],
  );

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return files.filter((file) => {
      const matchesQuery =
        file.name.toLowerCase().includes(normalizedQuery) ||
        file.project.toLowerCase().includes(normalizedQuery) ||
        file.client.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "All" || file.type === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [files, query, typeFilter]);

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await fetch("/api/files/upload", {
        body: formData,
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setFeedback(result.error ?? "Unable to upload file.");
        return;
      }

      setFeedback("File uploaded.");
      setModalOpen(false);
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
            Files
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Manage shared client assets, briefs, invoices, and project files.
          </p>
        </div>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 sm:w-auto"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Upload className="size-5" />
          Upload File
        </button>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {feedback}
        </p>
      ) : null}

      <div className="card flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files..."
            type="search"
            value={query}
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filter files by type</span>
          <Filter className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
          <select
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-10 pl-11 font-semibold text-slate-800 outline-none lg:w-auto"
            onChange={(event) => setTypeFilter(event.target.value)}
            value={typeFilter}
          >
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                Type: {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredFiles.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredFiles.map((file) => {
            const Icon =
              fileTypeIcons[file.type as keyof typeof fileTypeIcons] ?? Upload;

            return (
              <article
                className="card p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                key={file.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                    <Icon className="size-6" />
                  </div>
                  <StatusBadge>{file.status}</StatusBadge>
                </div>
                <h2 className="mt-5 break-words font-bold text-slate-950">
                  {file.name}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {file.type} / {file.size}
                </p>
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">
                      Project:
                    </span>{" "}
                    {file.project}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Client:
                    </span>{" "}
                    {file.client}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Uploaded:
                    </span>{" "}
                    {file.uploadedBy} on {file.date}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
                  <a
                    className="text-blue-700"
                    href={`/api/files/${file.id}/download`}
                  >
                    Download
                  </a>
                  <button
                    className="text-slate-700"
                    disabled={isPending}
                    onClick={() => run(() => toggleFileSharing(file.id))}
                    type="button"
                  >
                    Toggle shared
                  </button>
                  <button
                    className="text-rose-600"
                    disabled={isPending}
                    onClick={() => run(() => deleteFileRecord(file.id))}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          description="Try a different search term or file type filter."
          title="No files found"
        />
      )}

      <Modal
        description="Upload a file to the private client-files Supabase bucket."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Upload File"
      >
        <form className="space-y-4" onSubmit={handleUpload}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Display name
            </span>
            <input className={inputClass} name="name" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">File</span>
            <input className={inputClass} name="file" required type="file" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Client
              </span>
              <select className={inputClass} name="clientId">
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
              <select className={inputClass} name="projectId">
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700">
            <input
              className="size-5 accent-blue-700"
              name="sharedWithClient"
              type="checkbox"
            />
            Shared with client
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
              Upload File
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
