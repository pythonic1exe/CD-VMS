import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
};

const toneMap = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700"
};

export function StatCard({ label, value, change, icon, tone = "blue" }: StatCardProps) {
  const positive = !change.startsWith("-");

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-normal text-slate-950">{value}</p>
          </div>
          <span className={cn("grid h-10 w-10 place-items-center rounded-lg", toneMap[tone])}>{icon}</span>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-slate-600">
          {positive ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-amber-600" />}
          <span>{change}</span>
          <span className="font-medium text-muted-foreground">vs last week</span>
        </div>
      </CardContent>
    </Card>
  );
}
