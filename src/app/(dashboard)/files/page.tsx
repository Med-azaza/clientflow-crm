"use client";

import { Filter, Search, Upload } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  type ClientFile,
  fileTypeIcons,
  files as initialFiles,
} from "@/lib/mock-data";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export default function FilesPage() {
  const [files, setFiles] = useState(initialFiles);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleUploadFile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const type = String(formData.get("type") ?? "PDF");

    const nextFile: ClientFile = {
      id: `file-${Date.now()}`,
      name,
      type,
      client: String(formData.get("client") ?? ""),
      project: String(formData.get("project") ?? ""),
      size: String(formData.get("size") ?? "1.2 MB"),
      uploadedBy: "Anna Dorsey",
      date: "Today",
      status: "Shared",
    };

    setFiles((current) => [nextFile, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
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
        description="Add a local mock file card to the workspace."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Upload File"
      >
        <form className="space-y-4" onSubmit={handleUploadFile}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              File name
            </span>
            <input className={inputClass} name="name" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                File type
              </span>
              <select className={inputClass} name="type">
                <option>PDF</option>
                <option>Archive</option>
                <option>Spreadsheet</option>
                <option>Video</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Size</span>
              <input className={inputClass} defaultValue="1.2 MB" name="size" />
            </label>
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
              Add File
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
