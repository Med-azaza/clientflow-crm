import type { Priority, Status } from "@/lib/app-types";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: Status | Priority | string;
  tone?: "blue" | "green" | "red" | "amber" | "gray" | "purple";
};

const toneMap = {
  blue: "bg-blue-100 text-blue-700 ring-blue-200",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  red: "bg-rose-100 text-rose-700 ring-rose-200",
  amber: "bg-amber-100 text-amber-700 ring-amber-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  purple: "bg-violet-100 text-violet-700 ring-violet-200",
};

function inferTone(value: string): keyof typeof toneMap {
  if (["Active", "Completed", "Paid", "Shared", "Low"].includes(value)) {
    return "green";
  }

  if (["Overdue", "Urgent", "High"].includes(value)) {
    return "red";
  }

  if (["Pending", "Review", "In Review", "Medium"].includes(value)) {
    return "amber";
  }

  if (["Draft", "Private"].includes(value)) {
    return "gray";
  }

  return "blue";
}

export function StatusBadge({ children, tone }: StatusBadgeProps) {
  const label = String(children);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ring-1",
        toneMap[tone ?? inferTone(label)],
      )}
    >
      {label}
    </span>
  );
}
