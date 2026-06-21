"use client";

import { Paperclip, Search, SendHorizonal } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/user-avatar";
import { messages as initialMessages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ChatBubble = {
  id: string;
  body: string;
  time: string;
  mine?: boolean;
};

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(initialMessages[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [threadMessages, setThreadMessages] = useState<
    Record<string, ChatBubble[]>
  >(() =>
    Object.fromEntries(
      initialMessages.map((message) => [
        message.id,
        [
          { id: `${message.id}-body`, body: message.body, time: message.time },
          {
            id: `${message.id}-reply`,
            body:
              message.id === "m1"
                ? "Yes. We'll send the final homepage approval checklist and annotated desktop/mobile files before 3 PM."
                : "Thanks, we will review and follow up with next steps today.",
            time: "Just now",
            mine: true,
          },
        ],
      ]),
    ),
  );

  const conversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialMessages.filter((message) => {
      return (
        message.sender.toLowerCase().includes(normalizedQuery) ||
        message.role.toLowerCase().includes(normalizedQuery) ||
        message.project.toLowerCase().includes(normalizedQuery) ||
        message.preview.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  const selected =
    initialMessages.find((message) => message.id === selectedId) ??
    initialMessages[0];
  const selectedThread = selected ? (threadMessages[selected.id] ?? []) : [];

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed || !selected) {
      return;
    }

    setThreadMessages((current) => ({
      ...current,
      [selected.id]: [
        ...(current[selected.id] ?? []),
        {
          id: `local-${Date.now()}`,
          body: trimmed,
          time: "Just now",
          mine: true,
        },
      ],
    }));
    setDraft("");
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
          <div className="border-b border-slate-200 p-5">
            <label className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations..."
                type="search"
                value={query}
              />
            </label>
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
                  onClick={() => setSelectedId(message.id)}
                  type="button"
                >
                  <UserAvatar
                    className="size-11 text-xs"
                    initials={message.sender
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
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

        {selected ? (
          <section className="flex min-h-[520px] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-slate-950">
                  {selected.sender}
                </h2>
                <p className="truncate text-sm text-slate-500">
                  {selected.project}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                Online
              </span>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {selectedThread.map((message) => (
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
              ))}
            </div>
            <div className="border-t border-slate-200 p-5">
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
                  disabled={!draft.trim()}
                  type="submit"
                >
                  <SendHorizonal className="size-5" />
                </button>
              </form>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
