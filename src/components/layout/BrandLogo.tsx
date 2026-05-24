import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  to?: string;
};

export function BrandLogo({ className, markClassName, textClassName, to = "/" }: BrandLogoProps) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5 rounded-lg focus-ring", className)}>
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm", markClassName)}>
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className={cn("text-lg font-extrabold tracking-normal text-foreground", textClassName)}>CD-VMS</span>
    </Link>
  );
}
