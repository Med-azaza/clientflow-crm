import { Paperclip, Search, SendHorizonal } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { messages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const selected = messages[0];

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Messages
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Keep client and project conversations in one workspace.
        </p>
      </div>

      <div className="grid min-h-[680px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 lg:border-r lg:border-b-0">
          <div className="border-b border-slate-200 p-5">
            <label className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 outline-none focus:border-blue-300"
                placeholder="Search conversations..."
                type="search"
              />
            </label>
          </div>
          <div className="divide-y divide-slate-100">
            {messages.map((message) => (
              <button
                className={cn(
                  "flex w-full gap-4 p-5 text-left hover:bg-slate-50",
                  message.id === selected.id && "bg-blue-50",
                )}
                key={message.id}
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
                  <p className="mt-1 text-sm text-slate-500">{message.role}</p>
                  <p className="mt-2 truncate text-sm text-slate-600">
                    {message.preview}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {selected.sender}
              </h2>
              <p className="text-sm text-slate-500">{selected.project}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Online
            </span>
          </div>
          <div className="flex-1 space-y-5 bg-slate-50 p-6">
            <div className="max-w-2xl rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-slate-700">{selected.body}</p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                {selected.time}
              </p>
            </div>
            <div className="ml-auto max-w-2xl rounded-[20px] bg-blue-700 p-5 text-white shadow-lg shadow-blue-900/15">
              <p>
                Yes. We&apos;ll send the final homepage approval checklist and
                annotated desktop/mobile files before 3 PM.
              </p>
              <p className="mt-3 text-xs font-medium text-blue-100">Just now</p>
            </div>
            <div className="max-w-2xl rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-slate-700">
                Perfect. Please include the updated hero copy and conversion
                notes.
              </p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                Typing...
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <button
                aria-label="Attach file"
                className="rounded-xl p-3 text-slate-500 hover:bg-white"
                type="button"
              >
                <Paperclip className="size-5" />
              </button>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                placeholder="Type a message to your team..."
                type="text"
              />
              <button
                aria-label="Send message"
                className="rounded-xl bg-blue-700 p-3 text-white"
                type="button"
              >
                <SendHorizonal className="size-5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
