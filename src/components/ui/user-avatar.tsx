import { cn } from "@/lib/utils";

type UserAvatarProps = {
  initials: string;
  label?: string;
  className?: string;
};

export function UserAvatar({ initials, label, className }: UserAvatarProps) {
  return (
    <div
      aria-label={label ?? initials}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-slate-700 to-slate-950 text-sm font-semibold text-white shadow-sm",
        className,
      )}
      role="img"
    >
      {initials}
    </div>
  );
}
