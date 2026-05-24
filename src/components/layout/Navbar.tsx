import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Platform", href: "/#platform" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Security", href: "/admin" },
  { label: "Host tools", href: "/host" }
];

export function Navbar({ variant = "light" }: { variant?: "light" | "transparent" }) {
  const [open, setOpen] = useState(false);
  const isTransparent = variant === "transparent";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        isTransparent ? "border-white/15 bg-slate-950/20 text-white" : "border-border bg-white/88"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo textClassName={isTransparent ? "text-white" : undefined} />
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "text-sm font-semibold transition-colors hover:text-primary",
                  isTransparent ? "text-white/78 hover:text-white" : "text-slate-600",
                  isActive && !item.href.includes("#") && "text-primary"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant={isTransparent ? "outline" : "ghost"} asChild className={isTransparent ? "border-white/25 bg-white/10 text-white hover:bg-white/15" : undefined}>
            <Link to="/login">Staff Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Register Visitor</Link>
          </Button>
        </div>
        <Button
          variant={isTransparent ? "outline" : "ghost"}
          size="icon"
          className={cn("md:hidden", isTransparent && "border-white/20 bg-white/10 text-white hover:bg-white/15")}
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open ? (
        <div className={cn("border-t px-4 py-4 md:hidden", isTransparent ? "border-white/15 bg-slate-950/85" : "border-border bg-white")}>
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn("rounded-lg px-3 py-2 text-sm font-semibold", isTransparent ? "text-white/85 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100")}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid gap-2">
              <Button variant="outline" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>
                  Staff Login
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register" onClick={() => setOpen(false)}>
                  Register Visitor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
