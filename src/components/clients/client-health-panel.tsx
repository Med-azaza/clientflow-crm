import { UserAvatar } from "@/components/ui/user-avatar";
import { activityLogs, clients } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function ClientHealthPanel() {
  return (
    <aside className="space-y-6">
      <section className="card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
          Client Health
        </h2>
        <div className="mt-5 space-y-5">
          {clients.slice(0, 3).map((client) => (
            <div className="flex items-center gap-4" key={client.id}>
              <UserAvatar initials={client.avatar} label={client.name} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <p className="truncate font-semibold text-slate-900">
                    {client.name}
                  </p>
                  <p className="text-sm font-semibold text-blue-700">
                    {client.health}%
                  </p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${client.health}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-blue-700 p-6 text-white shadow-xl shadow-blue-900/15">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
          Monthly Revenue
        </p>
        <p className="mt-3 text-3xl font-bold">
          {formatCurrency(
            clients.reduce((total, client) => total + client.revenue, 0),
          )}
        </p>
        <p className="mt-4 text-sm leading-6 text-blue-50">
          Account growth is trending upward after three high-value onboarding
          events this month.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
          Recent Activity
        </h2>
        <div className="mt-5 space-y-4">
          {activityLogs.slice(0, 3).map((event) => (
            <div className="rounded-2xl bg-slate-50 p-4" key={event.id}>
              <p className="font-semibold text-slate-900">{event.title}</p>
              <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {event.time}
              </p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
