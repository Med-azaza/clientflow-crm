"use client";

import { Paperclip, Search, SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/user-avatar";
import { createMessageRecord } from "@/lib/actions";
import type {
  ClientRecord,
  MessageRecord,
  ProjectRecord,
} from "@/lib/app-types";
import { cn, initialsFor } from "@/lib/utils";

export function MessagesClient({
  clients,
  messages,
  projects,
}: {
  clients: ClientRecord[];
  messages: MessageRecord[];
  projects: ProjectRecord[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState(
    messages[0]?.projectId ?? projects[0]?.id ?? "",
  );
  const [selectedClientId, setSelectedClientId] = useState(
    messages[0]?.clientId ?? clients[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const conversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return messages.filter((message) => {
      return (
        message.sender.toLowerCase().includes(normalizedQuery) ||
        message.role.toLowerCase().includes(normalizedQuery) ||
        message.project.toLowerCase().includes(normalizedQuery) ||
        message.preview.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [messages, query]);

  const selected =
    messages.find((message) => message.id === selectedId) ?? messages[0];
  const selectedThread = selected
    ? messages.filter(
        (message) =>
          (selected.projectId && message.projectId === selected.projectId) ||
          (!selected.projectId && message.clientId === selected.clientId),
      )
    : [];

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    startTransition(async () => {
      const result = await createMessageRecord({
        body: trimmed,
        clientId: selected?.clientId ?? selectedClientId,
        projectId: selected?.projectId ?? selectedProjectId,
      });

      if (!result.ok) {
        setFeedback(result.error ?? "Unable to send message.");
        return;
      }

      setDraft("");
      setFeedback(null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Messages
        </h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          Keep client and project conversations in one workspace.
        </p>
      </div>

      <div className="grid min-h-[680px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 lg:border-r lg:border-b-0">
          <div className="space-y-3 border-b border-slate-200 p-5">
            <label className="relative block">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations..."
                type="search"
                value={query}
              />
            </label>
            <select
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
              onChange={(event) => setSelectedProjectId(event.target.value)}
              value={selectedProjectId}
            >
              <option value="">General conversation</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
              onChange={(event) => setSelectedClientId(event.target.value)}
              value={selectedClientId}
            >
              <option value="">No client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </select>
          </div>
          <div className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto lg:max-h-none">
            {conversations.length > 0 ? (
              conversations.map((message) => (
                <button
                  className={cn(
                    "flex w-full gap-4 p-5 text-left transition hover:bg-slate-50",
                    message.id === selected?.id && "bg-blue-50",
                  )}
                  key={message.id}
                  onClick={() => {
                    setSelectedId(message.id);
                    setSelectedProjectId(message.projectId ?? "");
                    setSelectedClientId(message.clientId ?? "");
                  }}
                  type="button"
                >
                  <UserAvatar
                    className="size-11 text-xs"
                    initials={initialsFor(message.sender)}
                    label={message.sender}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <p className="truncate font-semibold text-slate-950">
                        {message.sender}
                      </p>
                      <span className="text-xs text-slate-400">
                        {message.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {message.role}
                    </p>
                    <p className="mt-2 truncate text-sm text-slate-600">
                      {message.preview}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-5">
                <EmptyState
                  description="Try a client, project, or conversation keyword."
                  title="No conversations found"
                />
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950">
                {selected?.sender ?? "New Conversation"}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {selected?.project ??
                  projects.find((project) => project.id === selectedProjectId)
                    ?.name ??
                  "General"}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Workspace
            </span>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4 sm:p-6">
            {selectedThread.length > 0 ? (
              selectedThread.map((message) => (
                <div
                  className={cn(
                    "max-w-2xl rounded-[20px] p-5 shadow-sm",
                    message.mine
                      ? "ml-auto bg-blue-700 text-white shadow-blue-900/15"
                      : "border border-slate-200 bg-white text-slate-700",
                  )}
                  key={message.id}
                >
                  <p>{message.body}</p>
                  <p
                    className={cn(
                      "mt-3 text-xs font-medium",
                      message.mine ? "text-blue-100" : "text-slate-400",
                    )}
                  >
                    {message.time}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                description="Send the first message for this client or project."
                title="No messages yet"
              />
            )}
          </div>
          <div className="border-t border-slate-200 p-5">
            {feedback ? (
              <p className="mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {feedback}
              </p>
            ) : null}
            <form
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2"
              onSubmit={handleSend}
            >
              <button
                aria-label="Attach file"
                className="rounded-xl p-3 text-slate-500 transition hover:bg-white hover:text-blue-700"
                type="button"
              >
                <Paperclip className="size-5" />
              </button>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a message to your team..."
                type="text"
                value={draft}
              />
              <button
                aria-label="Send message"
                className="rounded-xl bg-blue-700 p-3 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!draft.trim() || isPending}
                type="submit"
              >
                <SendHorizonal className="size-5" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
