import { ArrowUpRight } from "lucide-react";
import { ActionCard } from "@/components/ui/action-card";
import { actionQueue } from "@/lib/mock-data";

export function ActionQueue() {
  return (
    <section className="overflow-hidden rounded-[24px] bg-blue-700 p-6 text-white shadow-xl shadow-blue-900/15">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Action Queue</h2>
        <ArrowUpRight className="size-6" />
      </div>
      <div className="mt-6 space-y-4">
        {actionQueue.map((item) => (
          <ActionCard
            detail={item.detail}
            icon={item.icon}
            key={item.id}
            title={item.title}
          />
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-blue-50">
        Complete high-priority items to maintain your 98% on-time project
        delivery rate.
      </div>
    </section>
  );
}
