import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current, { id, ...item }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitives.Provider swipeDirection="right">
        {children}
        {items.map((item) => (
          <ToastPrimitives.Root
            key={item.id}
            className={cn(
              "grid w-full max-w-sm grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border bg-white p-4 shadow-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-2 sm:data-[state=open]:slide-in-from-right-full",
              item.variant === "success" && "border-emerald-200",
              item.variant === "warning" && "border-amber-200",
              item.variant === "destructive" && "border-red-200"
            )}
            onOpenChange={(open) => {
              if (!open) setItems((current) => current.filter((candidate) => candidate.id !== item.id));
            }}
          >
            {item.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 text-primary" />
            )}
            <div className="min-w-0">
              <ToastPrimitives.Title className="text-sm font-semibold text-foreground">{item.title}</ToastPrimitives.Title>
              {item.description ? <ToastPrimitives.Description className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</ToastPrimitives.Description> : null}
            </div>
            <ToastPrimitives.Close className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 focus-ring">
              <X className="h-4 w-4" />
            </ToastPrimitives.Close>
          </ToastPrimitives.Root>
        ))}
        <ToastPrimitives.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
