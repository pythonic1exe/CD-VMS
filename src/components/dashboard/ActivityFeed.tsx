import { cn } from "@/lib/utils";

type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: string;
};

const dotTone: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  muted: "bg-slate-300",
  default: "bg-blue-500"
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full", dotTone[item.tone] || dotTone.default)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">{item.time}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
