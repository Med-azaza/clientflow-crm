import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "red" | "amber";
  detail?: string;
  href?: string;
};

const toneMap = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  detail,
  href,
}: MetricCardProps) {
  const content = (
    <article
      className={cn(
        "card p-5 transition duration-200",
        href &&
          "group hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn("rounded-2xl p-3", toneMap[tone])}>
          <Icon className="size-5" />
        </div>
        <ArrowUpRight className="size-5 text-slate-300 transition group-hover:text-blue-600" />
      </div>
      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        {detail ? (
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        ) : null}
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link aria-label={`Open ${label}`} className="block" href={href}>
      {content}
    </Link>
  );
}
