import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type ActionCardProps = {
  title: string;
  detail: string;
  icon: LucideIcon;
};

export function ActionCard({ title, detail, icon: Icon }: ActionCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-blue-100">{detail}</p>
      </div>
      <ArrowRight className="size-5 text-blue-100" />
    </div>
  );
}
