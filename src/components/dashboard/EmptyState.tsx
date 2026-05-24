import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, action, actionHref, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center", className)}>
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-white text-primary shadow-line">{icon}</div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? (
        actionHref ? (
          <Button className="mt-5" variant="outline" asChild>
            <Link to={actionHref}>{action}</Link>
          </Button>
        ) : (
          <Button className="mt-5" variant="outline" onClick={onAction}>
            {action}
          </Button>
        )
      ) : null}
    </div>
  );
}
