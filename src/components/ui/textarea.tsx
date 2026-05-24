import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[96px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-slate-400 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
      invalid && "border-red-300 bg-red-50/40 focus-visible:ring-red-500",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
