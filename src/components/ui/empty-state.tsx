import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}
